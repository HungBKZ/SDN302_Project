const { Account } = require('../../models/Account');
const Payment = require('../../models/Payment');
const paymentService = require('./payment.service');
const Order = require('../../models/Order');


exports.viewHistoryOrder = async (req, res) => {
    try {
        const userId = req.user?._id;
        const account = await Account.findById(userId);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const payments = await paymentService.getPaymentsForHistory(userId, account.UserRole);
        return res.status(200).json({ payments });

    } catch (error) {
        console.error('Error viewing order history:', error);
        if (error.message === 'Forbidden') return res.status(403).json({ message: 'Forbidden: You do not have access to view order history' });
        return res.status(500).json({ message: 'Error viewing order history', error: error.message });
    }
};

// New API method: listCompletedPayments
// GET /payments/completed
// Returns only payments with PaymentStatus = 'Completed' (case-insensitive)
// Supports: page, limit, orderId, startDate, endDate
exports.listCompletedPayments = async (req, res) => {
    try {
        const userId = req.user?._id;
        const account = await Account.findById(userId);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        const result = await paymentService.getCompletedPayments(userId, account.UserRole, req.query);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error listing completed payments:', error);
        if (error.message === 'Forbidden') return res.status(403).json({ message: 'Forbidden: You do not have access to view completed payments' });
        return res.status(500).json({ message: 'Error listing completed payments', error: error.message });
    }
};

// View details of a single payment
// GET /payments/:id
exports.viewPaymentDetail = async (req, res) => {
    try {
        const paymentId = req.params.id;
        const userId = req.user?._id;
        const account = await Account.findById(userId);

        if (!account) return res.status(404).json({ message: 'Account not found' });

        const result = await paymentService.getPaymentById(paymentId, userId, account.UserRole);
        if (!result) return res.status(404).json({ message: 'Payment not found' });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error viewing payment detail:', error);
        if (error.message === 'Forbidden') return res.status(403).json({ message: 'Forbidden: You do not have access to view this payment' });
        return res.status(500).json({ message: 'Error viewing payment detail', error: error.message });
    }
};

// Process payment
// POST /payments/pay
// body: { orderId, paymentMethod, couponId?, userCouponCode? }
exports.processPayment = async (req, res) => {
    try {
        const userId = req.user?._id;
        const account = await Account.findById(userId);
        if (!account) return res.status(404).json({ message: 'Account not found' });

        const { orderId, paymentMethod, couponId, userCouponCode } = req.body || {};
        if (!orderId || !paymentMethod) return res.status(400).json({ message: 'orderId and paymentMethod are required' });
        const existingPayment = await Payment.findOne({ OrderId: orderId, PaymentStatus: "Completed" });
        if (existingPayment) {
            return res.status(409).json({ message: 'Order has already been paid' });
        }
        const allowed = ['Cash', 'Card', 'Online'];
        if (!allowed.includes(paymentMethod)) return res.status(400).json({ message: `paymentMethod must be one of ${allowed.join(', ')}` });

        // Only customers or managers can process payments in this simple model
        if (!['Customer', 'Manager', 'Admin'].includes(account.UserRole)) return res.status(403).json({ message: 'Forbidden: cannot process payment' });

        const result = await paymentService.processPayment(orderId, userId, paymentMethod, { couponId, userCouponCode });

        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        console.error('Error processing payment:', error);
        // map known errors to 400
        const bad = ['Order not found', 'Coupon not found', 'Coupon expired', 'Coupon not available', 'UserCoupon not found', 'UserCoupon does not belong to user', 'UserCoupon is not available', 'UserCoupon expired'];
        if (bad.includes(error.message)) return res.status(400).json({ message: error.message });
        if (error.message === 'Forbidden') return res.status(403).json({ message: 'Forbidden' });
        return res.status(500).json({ message: 'Error processing payment', error: error.message });
    }
};
