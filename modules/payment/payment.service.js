const Payment = require('../../models/Payment');
const Order = require('../../models/Order');
const OrderItem = require('../../models/OrderItem');
const Dish = require('../../models/Dish');
const Coupon = require('../../models/Coupon');
const UserCoupon = require('../../models/UserCoupon');

/**
 * Populate options used in queries
 */
const populateOrderUser = {
    path: 'OrderId',
    select: 'UserId OrderDate Total FinalPrice OrderStatus',
    populate: { path: 'UserId', select: 'Name UserEmail UserPhone' }
};

/**
 * Get payments for history view.
 * - If role === 'Customer' returns payments for orders owned by userId
 * - If role === 'Manager' returns all payments
 * Returns array of payments (populated)
 */
async function getPaymentsForHistory(userId, role) {
    if (role === 'Customer') {
        const userOrders = await Order.find({ UserId: userId }).select('_id');
        const orderIds = userOrders.map(o => o._id);
        if (!orderIds.length) return [];
        const payments = await Payment.find({ OrderId: { $in: orderIds } })
            .populate(populateOrderUser)
            .sort({ PaymentDate: -1 });
        return payments;
    }

    // if (role === 'Manager') {
    const payments = await Payment.find()
        .populate(populateOrderUser)
        .sort({ PaymentDate: -1 });
    return payments;
    // }

    // throw new Error('Forbidden');
}

/**
 * Get completed payments with optional filters and pagination
 * query: { orderId, startDate, endDate, page, limit }
 * Returns { payments, total, page, limit }
 */
async function getCompletedPayments(userId, role, query = {}) {
    const completedRegex = /^\s*completed\s*$/i;
    const filter = { PaymentStatus: { $regex: completedRegex } };

    const { orderId, startDate, endDate } = query;
    if (orderId) filter.OrderId = orderId;
    if (startDate || endDate) {
        filter.PaymentDate = {};
        if (startDate) filter.PaymentDate.$gte = new Date(startDate);
        if (endDate) filter.PaymentDate.$lte = new Date(endDate);
    }

    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.max(parseInt(query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    if (role === 'Customer') {
        const userOrders = await Order.find({ UserId: userId }).select('_id');
        const orderIds = userOrders.map(o => o._id);
        if (!orderIds.length) return { payments: [], total: 0, page, limit };

        if (filter.OrderId) {
            const owns = orderIds.some(id => id.toString() === filter.OrderId.toString());
            if (!owns) return { payments: [], total: 0, page, limit };
        } else {
            filter.OrderId = { $in: orderIds };
        }
    }
    // else if (role !== 'Manager') {
    //     throw new Error('Forbidden');
    // }

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
        .populate(populateOrderUser)
        .sort({ PaymentDate: -1 })
        .skip(skip)
        .limit(limit);

    return { payments, total, page, limit };
}

/**
 * Get payment details by payment id
 * Returns { payment, items } where items are OrderItem populated with Dish
 * Enforces access: Customer can only view payments for their own orders
 */
async function getPaymentById(paymentId, userId, role) {
    const payment = await Payment.findById(paymentId).populate(populateOrderUser);
    if (!payment) return null;

    // If there's an order attached, optionally fetch order items
    const order = payment.OrderId || null;

    if (role === 'Customer') {
        // Only allow if the order.UserId matches userId
        const ownerId = order?.UserId?._id;
        if (!ownerId || ownerId.toString() !== userId.toString()) {
            // not allowed
            throw new Error('Forbidden');
        }
    } else if (role !== 'Manager') {
        throw new Error('Forbidden');
    }

    let items = [];
    if (order && order._id) {
        const rawItems = await OrderItem.find({ OrderId: order._id }).populate({ path: 'DishId', select: 'DishName DishPrice DishImage DishDescription' });
        // map items to include dish fields and line total
        items = rawItems.map(it => {
            const dish = it.DishId || {};
            const quantity = typeof it.Quantity === 'number' ? it.Quantity : Number(it.Quantity) || 0;
            const unitPrice = typeof it.UnitPrice === 'number' ? it.UnitPrice : Number(it.UnitPrice) || 0;
            const lineTotal = Math.round((quantity * unitPrice) * 100) / 100;
            return {
                _id: it._id,
                OrderId: it.OrderId,
                Dish: {
                    _id: dish._id,
                    name: dish.DishName,
                    price: dish.DishPrice,
                    image: dish.DishImage,
                    description: dish.DishDescription
                },
                Quantity: quantity,
                UnitPrice: unitPrice,
                LineTotal: lineTotal
            };
        });
    }

    // computed totals from items for convenience
    const computedTotal = items.reduce((s, it) => s + (it.LineTotal || 0), 0);

    return { payment, items, computedTotal };
}

module.exports = {
    getPaymentsForHistory,
    getCompletedPayments,
    getPaymentById
};

/**
 * Process a payment for an order.
 * - orderId: id of Order
 * - userId: id of authenticated Account
 * - paymentMethod: 'Cash'|'Card'|'Online'
 * - options: { couponId, userCouponCode }
 * Returns { payment, order, appliedDiscount }
 */
async function processPayment(orderId, userId, paymentMethod, options = {}) {
    // validate order
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    // Prevent duplicate/completed payments for the same order
    const completedRegex = /^\s*completed\s*$/i;
    const existingPayment = await Payment.findOne({ OrderId: order._id, PaymentStatus: { $regex: completedRegex } });
    if (existingPayment) {
        // Idempotent behaviour: if an existing completed payment exists, return it instead of throwing.
        const existingFinalAmount = order.FinalPrice || order.Total;
        // Ensure order status reflects payment
        if (order.OrderStatus !== 'Completed') {
            order.OrderStatus = 'Completed';
            await order.save();
        }
        return { payment: existingPayment, order, appliedDiscount: (order.Total || 0) - existingFinalAmount, appliedCouponId: order.CouponId || null, appliedUserCouponId: null, finalAmount: existingFinalAmount, alreadyPaid: true };
    }
    // Only allow customer or manager to pay: here we assume controller checked role.

    // Determine base amount (use FinalPrice if present)
    const baseAmount = typeof order.FinalPrice === 'number' ? order.FinalPrice : order.Total;

    let appliedDiscount = 0;
    let appliedCouponId = null;
    let appliedUserCouponId = null;

    // Prefer userCouponCode if provided
    if (options.userCouponCode) {
        const uc = await UserCoupon.findOne({ Code: options.userCouponCode });
        if (!uc) throw new Error('UserCoupon not found');
        if (uc.UserId.toString() !== userId.toString()) throw new Error('UserCoupon does not belong to user');
        if (uc.Status !== 'unused') throw new Error('UserCoupon is not available');
        if (uc.ExpiresAt && new Date() > uc.ExpiresAt) throw new Error('UserCoupon expired');

        appliedDiscount = Math.min(uc.DiscountAmount || 0, baseAmount);
        appliedUserCouponId = uc._id;
        // mark user coupon used
        uc.Status = 'used';
        uc.UsedAt = new Date();
        await uc.save();
    } else if (options.couponId) {
        const coupon = await Coupon.findById(options.couponId);
        if (!coupon) throw new Error('Coupon not found');
        if (coupon.IsDeleted) throw new Error('Coupon not available');
        if (coupon.ExpirationDate && new Date() > coupon.ExpirationDate) throw new Error('Coupon expired');

        appliedDiscount = Math.min(coupon.DiscountAmount || 0, baseAmount);
        appliedCouponId = coupon._id;
        // increment times used
        coupon.TimesUsed = (coupon.TimesUsed || 0) + 1;
        await coupon.save();
    }

    const finalAmount = Math.max(0, Math.round((baseAmount - appliedDiscount) * 100) / 100);

    // Update order: set applied coupon id and final price
    if (appliedCouponId) order.CouponId = appliedCouponId;
    // For userCoupon we don't have CouponId, but we still update FinalPrice
    order.FinalPrice = finalAmount;
    await order.save();

    // Create transaction reference
    const txnRef = `TXN-${(Math.random() * 1e9).toFixed(0)}`;

    // PaymentStatus: For simplicity, mark Cash as Completed, Card/Online as Completed too (could be Pending)
    const status = 'Completed';

    const paymentDoc = await Payment.create({
        OrderId: order._id,
        PaymentMethod: paymentMethod,
        PaymentStatus: status,
        TransactionRef: txnRef,
        PaymentDate: new Date()
    });

    // Mark order as completed when payment succeeded
    if (order.OrderStatus !== 'Completed') {
        order.OrderStatus = 'Completed';
        await order.save();
    }

    return { payment: paymentDoc, order, appliedDiscount, appliedCouponId, appliedUserCouponId, finalAmount };
}

// export the new function
module.exports.processPayment = processPayment;


