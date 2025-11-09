const Order = require('../../models/Order');
const OrderItem = require('../../models/OrderItem');
const Dish = require('../../models/Dish');
const Cart = require('../../models/Cart');
const CartItem = require('../../models/CartItem');
const { Account } = require('../../models/Account');
const Customer = require('../../models/Customer');
const Table = require('../../models/Table');
const mongoose = require('mongoose');

class OrderService {
    /**
     * UC-1: Tạo order mới (Guest/Member)
     * @param {Object} orderData - Thông tin order
     * @param {String|null} userId - ID của user (null nếu Guest)
     * @returns {Promise<Object>} Order đã được tạo
     */
    async createOrder(orderData, userId = null) {
        const {
            OrderType = 'Dine-in',
            TableId = null,
            CustomerPhone = null,
            OrderDescription = '',
            items = [] // Array of { dishId, quantity }
        } = orderData;

        // Kiểm tra Table nếu có
        if (TableId) {
            const table = await Table.findById(TableId);
            if (!table) {
                throw new Error('Bàn không tồn tại');
            }
            if (table.TableStatus !== 'Available' && table.TableStatus !== 'Occupied') {
                throw new Error('Bàn không khả dụng');
            }
        }

        // Nếu có items, validate và tính tổng tiền
        let total = 0;
        const orderItems = [];

        if (items && items.length > 0) {
            for (const item of items) {
                const { dishId, quantity } = item;

                // Kiểm tra món ăn
                const dish = await Dish.findById(dishId);
                if (!dish) {
                    throw new Error(`Món ăn với ID ${dishId} không tồn tại`);
                }

                if (dish.DishStatus && dish.DishStatus !== 'Available') {
                    throw new Error(`Món ${dish.DishName} hiện không khả dụng`);
                }

                if (dish.IngredientStatus && dish.IngredientStatus !== 'Sufficient') {
                    throw new Error(`Món ${dish.DishName} hiện không đủ nguyên liệu`);
                }

                if (!Number.isInteger(quantity) || quantity < 1) {
                    throw new Error('Số lượng phải là số nguyên >= 1');
                }

                const itemTotal = dish.DishPrice * quantity;
                total += itemTotal;

                orderItems.push({
                    dishId: dish._id,
                    quantity,
                    unitPrice: dish.DishPrice
                });
            }
        }

        // Tạo Order
        const order = new Order({
            UserId: userId,
            CustomerId: userId ? userId : null, // Nếu có userId thì dùng làm CustomerId
            TableId: TableId,
            OrderType: OrderType,
            OrderStatus: 'Pending',
            OrderDescription: OrderDescription,
            CustomerPhone: CustomerPhone,
            Total: total,
            FinalPrice: total, // Có thể tính lại sau khi áp dụng coupon
            OrderDate: new Date()
        });

        await order.save();

        // Tạo OrderItems
        for (const item of orderItems) {
            const orderItem = new OrderItem({
                OrderId: order._id,
                DishId: item.dishId,
                Quantity: item.quantity,
                UnitPrice: item.unitPrice
            });
            await orderItem.save();
        }

        // Populate để trả về đầy đủ thông tin
        await order.populate('TableId');
        if (userId) {
            await order.populate('UserId');
        }

        return order;
    }

    /**
     * UC-1: Tạo order từ giỏ hàng (Member)
     * @param {String} userId - ID của user
     * @param {Object} orderData - Thông tin order
     * @returns {Promise<Object>} Order đã được tạo
     */
    async createOrderFromCart(userId, orderData) {
        const {
            OrderType = 'Dine-in',
            TableId = null,
            OrderDescription = ''
        } = orderData;

        // Lấy giỏ hàng
        const cart = await Cart.findOne({ UserId: userId }).sort({ CreatedAt: -1 });
        if (!cart) {
            throw new Error('Giỏ hàng trống');
        }

        // Lấy items từ giỏ hàng
        const cartItems = await CartItem.find({ CartId: cart._id }).populate('DishId');
        if (!cartItems || cartItems.length === 0) {
            throw new Error('Giỏ hàng trống');
        }

        // Validate và tính tổng tiền
        let total = 0;
        const orderItems = [];

        for (const cartItem of cartItems) {
            const dish = cartItem.DishId;
            if (!dish) {
                continue; // Skip nếu dish đã bị xóa
            }

            if (dish.DishStatus && dish.DishStatus !== 'Available') {
                throw new Error(`Món ${dish.DishName} hiện không khả dụng`);
            }

            if (dish.IngredientStatus && dish.IngredientStatus !== 'Sufficient') {
                throw new Error(`Món ${dish.DishName} hiện không đủ nguyên liệu`);
            }

            const itemTotal = dish.DishPrice * cartItem.Quantity;
            total += itemTotal;

            orderItems.push({
                dishId: dish._id,
                quantity: cartItem.Quantity,
                unitPrice: dish.DishPrice
            });
        }

        if (orderItems.length === 0) {
            throw new Error('Không có món hợp lệ trong giỏ hàng');
        }

        // Kiểm tra Table nếu có
        if (TableId) {
            const table = await Table.findById(TableId);
            if (!table) {
                throw new Error('Bàn không tồn tại');
            }
        }

        // Tạo Order
        const order = new Order({
            UserId: userId,
            CustomerId: userId,
            TableId: TableId,
            OrderType: OrderType,
            OrderStatus: 'Pending',
            OrderDescription: OrderDescription,
            Total: total,
            FinalPrice: total,
            OrderDate: new Date()
        });

        await order.save();

        // Tạo OrderItems
        for (const item of orderItems) {
            const orderItem = new OrderItem({
                OrderId: order._id,
                DishId: item.dishId,
                Quantity: item.quantity,
                UnitPrice: item.unitPrice
            });
            await orderItem.save();
        }

        // Xóa giỏ hàng sau khi tạo order
        await CartItem.deleteMany({ CartId: cart._id });
        await Cart.findByIdAndDelete(cart._id);

        // Populate
        await order.populate('TableId');
        await order.populate('UserId');

        return order;
    }

    /**
     * UC-2: Xem menu trong order
     * @param {String} orderId - ID của order
     * @param {String|null} userId - ID của user (null nếu Guest)
     * @returns {Promise<Object>} Thông tin order và items
     */
    async getOrderMenu(orderId, userId = null) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Đơn hàng không tồn tại');
        }

        // Kiểm tra quyền: Guest có thể xem, Member chỉ xem order của mình
        if (userId && order.UserId && order.UserId.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền xem đơn hàng này');
        }

        // Lấy OrderItems
        const orderItems = await OrderItem.find({ OrderId: orderId })
            .populate('DishId')
            .lean();

        // Format items
        const items = orderItems
            .filter(item => item.DishId !== null)
            .map(item => {
                const dish = item.DishId;
                return {
                    _id: item._id,
                    dish: {
                        _id: dish._id,
                        DishName: dish.DishName,
                        DishType: dish.DishType,
                        DishPrice: dish.DishPrice,
                        DishDescription: dish.DishDescription,
                        DishImage: dish.DishImage
                    },
                    quantity: item.Quantity,
                    unitPrice: item.UnitPrice,
                    itemTotal: item.Quantity * item.UnitPrice
                };
            });

        // Populate order
        await order.populate('TableId');
        if (order.UserId) {
            await order.populate('UserId');
        }

        return {
            order: {
                _id: order._id,
                OrderDate: order.OrderDate,
                OrderStatus: order.OrderStatus,
                OrderType: order.OrderType,
                OrderDescription: order.OrderDescription,
                TableId: order.TableId,
                UserId: order.UserId,
                Total: order.Total,
                FinalPrice: order.FinalPrice
            },
            items: items,
            totalItems: items.length
        };
    }

    /**
     * UC-3: Thêm món vào order
     * @param {String} orderId - ID của order
     * @param {String} dishId - ID của món ăn
     * @param {Number} quantity - Số lượng
     * @param {String|null} userId - ID của user (null nếu Guest)
     * @returns {Promise<Object>} OrderItem đã được thêm
     */
    async addItemToOrder(orderId, dishId, quantity, userId = null) {
        // Kiểm tra order
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Đơn hàng không tồn tại');
        }

        // Kiểm tra quyền
        if (userId && order.UserId && order.UserId.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền sửa đơn hàng này');
        }

        // Chỉ cho phép thêm món khi order ở trạng thái Pending
        if (order.OrderStatus !== 'Pending') {
            throw new Error('Chỉ có thể thêm món khi đơn hàng ở trạng thái Pending');
        }

        // Kiểm tra món ăn
        const dish = await Dish.findById(dishId);
        if (!dish) {
            throw new Error('Món ăn không tồn tại');
        }

        if (dish.DishStatus && dish.DishStatus !== 'Available') {
            throw new Error('Món ăn hiện không khả dụng');
        }

        if (dish.IngredientStatus && dish.IngredientStatus !== 'Sufficient') {
            throw new Error('Món ăn hiện không đủ nguyên liệu');
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error('Số lượng phải là số nguyên >= 1');
        }

        // Tìm OrderItem đã tồn tại
        let orderItem = await OrderItem.findOne({
            OrderId: orderId,
            DishId: dishId
        });

        if (orderItem) {
            // Nếu đã có, tăng số lượng
            orderItem.Quantity += quantity;
            await orderItem.save();
        } else {
            // Nếu chưa có, tạo mới
            orderItem = new OrderItem({
                OrderId: orderId,
                DishId: dishId,
                Quantity: quantity,
                UnitPrice: dish.DishPrice
            });
            await orderItem.save();
        }

        // Cập nhật Total và FinalPrice của Order
        await this.recalculateOrderTotal(orderId);

        // Populate
        await orderItem.populate('DishId');

        return orderItem;
    }

    /**
     * UC-4: Sửa số lượng món trong order
     * @param {String} orderId - ID của order
     * @param {String} itemId - ID của OrderItem
     * @param {Number} quantity - Số lượng mới
     * @param {String|null} userId - ID của user (null nếu Guest)
     * @returns {Promise<Object>} OrderItem đã được cập nhật
     */
    async updateItemQuantity(orderId, itemId, quantity, userId = null) {
        // Kiểm tra order
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Đơn hàng không tồn tại');
        }

        // Kiểm tra quyền
        if (userId && order.UserId && order.UserId.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền sửa đơn hàng này');
        }

        // Chỉ cho phép sửa khi order ở trạng thái Pending
        if (order.OrderStatus !== 'Pending') {
            throw new Error('Chỉ có thể sửa món khi đơn hàng ở trạng thái Pending');
        }

        // Kiểm tra OrderItem
        const orderItem = await OrderItem.findById(itemId);
        if (!orderItem) {
            throw new Error('Món không tồn tại trong đơn hàng');
        }

        if (orderItem.OrderId.toString() !== orderId.toString()) {
            throw new Error('Món không thuộc đơn hàng này');
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error('Số lượng phải là số nguyên >= 1');
        }

        // Cập nhật số lượng
        orderItem.Quantity = quantity;
        await orderItem.save();

        // Cập nhật Total và FinalPrice của Order
        await this.recalculateOrderTotal(orderId);

        // Populate
        await orderItem.populate('DishId');

        return orderItem;
    }

    /**
     * UC-5: Xóa món trong order (chưa chế biến)
     * @param {String} orderId - ID của order
     * @param {String} itemId - ID của OrderItem
     * @param {String|null} userId - ID của user (null nếu Guest)
     * @returns {Promise<Object>} Thông tin xác nhận
     */
    async removeItemFromOrder(orderId, itemId, userId = null) {
        // Kiểm tra order
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Đơn hàng không tồn tại');
        }

        // Kiểm tra quyền
        if (userId && order.UserId && order.UserId.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền sửa đơn hàng này');
        }

        // Chỉ cho phép xóa khi order ở trạng thái Pending (chưa chế biến)
        if (order.OrderStatus !== 'Pending') {
            throw new Error('Chỉ có thể xóa món khi đơn hàng ở trạng thái Pending (chưa chế biến)');
        }

        // Kiểm tra OrderItem
        const orderItem = await OrderItem.findById(itemId);
        if (!orderItem) {
            throw new Error('Món không tồn tại trong đơn hàng');
        }

        if (orderItem.OrderId.toString() !== orderId.toString()) {
            throw new Error('Món không thuộc đơn hàng này');
        }

        // Xóa OrderItem
        await OrderItem.findByIdAndDelete(itemId);

        // Cập nhật Total và FinalPrice của Order
        await this.recalculateOrderTotal(orderId);

        return {
            message: 'Đã xóa món khỏi đơn hàng',
            itemId: itemId
        };
    }

    /**
     * UC-6: Xem lịch sử đặt món (Member)
     * @param {String} userId - ID của user
     * @param {Object} options - Phân trang và lọc
     * @returns {Promise<Object>} Danh sách orders
     */
    async getOrderHistory(userId, options = {}) {
        const { page = 1, limit = 10, status = null } = options;

        const query = { UserId: userId };
        if (status) {
            query.OrderStatus = status;
        }

        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find(query)
                .sort({ OrderDate: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('TableId')
                .lean(),
            Order.countDocuments(query)
        ]);

        // Lấy items cho mỗi order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await OrderItem.find({ OrderId: order._id })
                    .populate('DishId')
                    .lean();

                return {
                    ...order,
                    items: items.filter(item => item.DishId !== null).map(item => ({
                        dish: item.DishId,
                        quantity: item.Quantity,
                        unitPrice: item.UnitPrice,
                        itemTotal: item.Quantity * item.UnitPrice
                    }))
                };
            })
        );

        return {
            orders: ordersWithItems,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
    }

    /**
     * UC-7: Xóa lịch sử đơn hàng (Member) - Soft delete
     * @param {String} userId - ID của user
     * @param {String} orderId - ID của order
     * @returns {Promise<Object>} Thông tin xác nhận
     */
    async deleteOrderHistory(userId, orderId) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Đơn hàng không tồn tại');
        }

        // Kiểm tra quyền
        if (!order.UserId || order.UserId.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền xóa đơn hàng này');
        }

        // Chỉ cho phép xóa các order đã Completed hoặc Cancelled
        if (order.OrderStatus !== 'Completed' && order.OrderStatus !== 'Cancelled') {
            throw new Error('Chỉ có thể xóa đơn hàng đã hoàn thành hoặc đã hủy');
        }

        // Soft delete: xóa OrderItems và Order
        await OrderItem.deleteMany({ OrderId: orderId });
        await Order.findByIdAndDelete(orderId);

        return {
            message: 'Đã xóa đơn hàng khỏi lịch sử',
            orderId: orderId
        };
    }

    /**
     * UC-8: Đặt lại (Re-order) từ lịch sử (Member)
     * @param {String} userId - ID của user
     * @param {String} orderId - ID của order cũ
     * @param {Object} orderData - Thông tin order mới
     * @returns {Promise<Object>} Order mới đã được tạo
     */
    async reorderFromHistory(userId, orderId, orderData = {}) {
        // Lấy order cũ
        const oldOrder = await Order.findById(orderId);
        if (!oldOrder) {
            throw new Error('Đơn hàng không tồn tại');
        }

        // Kiểm tra quyền
        if (!oldOrder.UserId || oldOrder.UserId.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền đặt lại đơn hàng này');
        }

        // Lấy OrderItems từ order cũ
        const oldOrderItems = await OrderItem.find({ OrderId: orderId })
            .populate('DishId')
            .lean();

        if (!oldOrderItems || oldOrderItems.length === 0) {
            throw new Error('Đơn hàng cũ không có món nào');
        }

        // Validate và tính tổng tiền
        let total = 0;
        const orderItems = [];

        for (const oldItem of oldOrderItems) {
            const dish = oldItem.DishId;
            if (!dish) {
                continue; // Skip nếu dish đã bị xóa
            }

            // Kiểm tra món còn available
            if (dish.DishStatus && dish.DishStatus !== 'Available') {
                throw new Error(`Món ${dish.DishName} hiện không khả dụng`);
            }

            if (dish.IngredientStatus && dish.IngredientStatus !== 'Sufficient') {
                throw new Error(`Món ${dish.DishName} hiện không đủ nguyên liệu`);
            }

            const itemTotal = dish.DishPrice * oldItem.Quantity;
            total += itemTotal;

            orderItems.push({
                dishId: dish._id,
                quantity: oldItem.Quantity,
                unitPrice: dish.DishPrice
            });
        }

        if (orderItems.length === 0) {
            throw new Error('Không có món hợp lệ để đặt lại');
        }

        // Tạo Order mới
        const {
            OrderType = oldOrder.OrderType,
            TableId = oldOrder.TableId,
            OrderDescription = `Re-order từ đơn hàng #${orderId}`
        } = orderData;

        const order = new Order({
            UserId: userId,
            CustomerId: userId,
            TableId: TableId,
            OrderType: OrderType,
            OrderStatus: 'Pending',
            OrderDescription: OrderDescription,
            Total: total,
            FinalPrice: total,
            OrderDate: new Date()
        });

        await order.save();

        // Tạo OrderItems
        for (const item of orderItems) {
            const orderItem = new OrderItem({
                OrderId: order._id,
                DishId: item.dishId,
                Quantity: item.quantity,
                UnitPrice: item.unitPrice
            });
            await orderItem.save();
        }

        // Populate
        await order.populate('TableId');
        await order.populate('UserId');

        return order;
    }

    /**
     * UC-9: Nhận thông báo order mới (Staff/Kitchen Staff)
     * Lấy danh sách orders mới (Pending)
     * @param {Object} options - Phân trang
     * @returns {Promise<Object>} Danh sách orders mới
     */
    async getNewOrders(options = {}) {
        const { page = 1, limit = 20 } = options;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ OrderStatus: 'Pending' })
                .sort({ OrderDate: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('TableId')
                .populate('UserId')
                .lean(),
            Order.countDocuments({ OrderStatus: 'Pending' })
        ]);

        // Lấy items cho mỗi order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const items = await OrderItem.find({ OrderId: order._id })
                    .populate('DishId')
                    .lean();

                return {
                    ...order,
                    items: items.filter(item => item.DishId !== null).map(item => ({
                        dish: item.DishId,
                        quantity: item.Quantity,
                        unitPrice: item.UnitPrice
                    }))
                };
            })
        );

        return {
            orders: ordersWithItems,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
    }

    /**
     * UC-10: Theo dõi/Cập nhật trạng thái order (Staff/Kitchen Staff/Manager)
     * @param {String} orderId - ID của order
     * @param {String} newStatus - Trạng thái mới
     * @param {String} userId - ID của user (Staff/Kitchen Staff/Manager)
     * @returns {Promise<Object>} Order đã được cập nhật
     */
    async updateOrderStatus(orderId, newStatus, userId) {
        // Kiểm tra order
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Đơn hàng không tồn tại');
        }

        // Validate trạng thái
        const validStatuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Trạng thái không hợp lệ. Các trạng thái hợp lệ: ${validStatuses.join(', ')}`);
        }

        // Cập nhật trạng thái
        order.OrderStatus = newStatus;
        await order.save();

        // Populate
        await order.populate('TableId');
        if (order.UserId) {
            await order.populate('UserId');
        }

        // Lấy items
        const items = await OrderItem.find({ OrderId: orderId })
            .populate('DishId')
            .lean();

        return {
            order: {
                ...order.toObject(),
                items: items.filter(item => item.DishId !== null).map(item => ({
                    dish: item.DishId,
                    quantity: item.Quantity,
                    unitPrice: item.UnitPrice
                }))
            }
        };
    }

    /**
     * Helper: Tính lại tổng tiền của Order
     * @param {String} orderId - ID của order
     */
    async recalculateOrderTotal(orderId) {
        const orderItems = await OrderItem.find({ OrderId: orderId }).populate('DishId');
        
        let total = 0;
        for (const item of orderItems) {
            if (item.DishId) {
                total += item.Quantity * item.UnitPrice;
            }
        }

        const order = await Order.findById(orderId);
        order.Total = total;
        order.FinalPrice = total; // Có thể tính lại sau khi áp dụng coupon
        await order.save();
    }
}

module.exports = new OrderService();

