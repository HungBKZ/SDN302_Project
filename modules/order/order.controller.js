const orderService = require('./order.service');

class OrderController {
    /**
     * UC-1: Tạo order mới (Guest/Member)
     * POST /api/order
     */
    async createOrder(req, res, next) {
        try {
            const userId = req.user ? req.user._id : null;
            const orderData = req.body;

            const order = await orderService.createOrder(orderData, userId);

            return res.status(201).json({
                success: true,
                message: 'Tạo đơn hàng thành công',
                data: order
            });
        } catch (error) {
            if (error.message.includes('không tồn tại') ||
                error.message.includes('không khả dụng') ||
                error.message.includes('không đủ nguyên liệu') ||
                error.message.includes('Số lượng phải là số nguyên')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * UC-1: Tạo order từ giỏ hàng (Member)
     * POST /api/order/from-cart
     */
    async createOrderFromCart(req, res, next) {
        try {
            const userId = req.user._id;
            const orderData = req.body;

            const order = await orderService.createOrderFromCart(userId, orderData);

            return res.status(201).json({
                success: true,
                message: 'Tạo đơn hàng từ giỏ hàng thành công',
                data: order
            });
        } catch (error) {
            if (error.message === 'Giỏ hàng trống' ||
                error.message.includes('không khả dụng') ||
                error.message.includes('không đủ nguyên liệu') ||
                error.message.includes('không tồn tại')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * UC-2: Xem menu trong order
     * GET /api/order/:orderId/menu
     */
    async getOrderMenu(req, res, next) {
        try {
            const { orderId } = req.params;
            const userId = req.user ? req.user._id : null;

            const orderData = await orderService.getOrderMenu(orderId, userId);

            return res.status(200).json({
                success: true,
                message: 'Lấy thông tin đơn hàng thành công',
                data: orderData
            });
        } catch (error) {
            if (error.message === 'Đơn hàng không tồn tại' ||
                error.message === 'Bạn không có quyền xem đơn hàng này') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * UC-3: Thêm món vào order
     * POST /api/order/:orderId/items
     */
    async addItemToOrder(req, res, next) {
        try {
            const { orderId } = req.params;
            const { dishId, quantity } = req.body;
            const userId = req.user ? req.user._id : null;

            const orderItem = await orderService.addItemToOrder(orderId, dishId, quantity, userId);

            return res.status(200).json({
                success: true,
                message: 'Đã thêm món vào đơn hàng',
                data: {
                    _id: orderItem._id,
                    dish: orderItem.DishId,
                    quantity: orderItem.Quantity,
                    unitPrice: orderItem.UnitPrice
                }
            });
        } catch (error) {
            if (error.message === 'Đơn hàng không tồn tại' ||
                error.message === 'Bạn không có quyền sửa đơn hàng này' ||
                error.message === 'Chỉ có thể thêm món khi đơn hàng ở trạng thái Pending' ||
                error.message === 'Món ăn không tồn tại' ||
                error.message === 'Món ăn hiện không khả dụng' ||
                error.message === 'Món ăn hiện không đủ nguyên liệu' ||
                error.message === 'Số lượng phải là số nguyên >= 1') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * UC-4: Sửa số lượng món trong order
     * PUT /api/order/:orderId/items/:itemId
     */
    async updateItemQuantity(req, res, next) {
        try {
            const { orderId, itemId } = req.params;
            const { quantity } = req.body;
            const userId = req.user ? req.user._id : null;

            const orderItem = await orderService.updateItemQuantity(orderId, itemId, quantity, userId);

            return res.status(200).json({
                success: true,
                message: 'Đã cập nhật số lượng món',
                data: {
                    _id: orderItem._id,
                    dish: orderItem.DishId,
                    quantity: orderItem.Quantity,
                    unitPrice: orderItem.UnitPrice
                }
            });
        } catch (error) {
            if (error.message === 'Đơn hàng không tồn tại' ||
                error.message === 'Bạn không có quyền sửa đơn hàng này' ||
                error.message === 'Chỉ có thể sửa món khi đơn hàng ở trạng thái Pending' ||
                error.message === 'Món không tồn tại trong đơn hàng' ||
                error.message === 'Món không thuộc đơn hàng này' ||
                error.message === 'Số lượng phải là số nguyên >= 1') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * UC-5: Xóa món trong order
     * DELETE /api/order/:orderId/items/:itemId
     */
    async removeItemFromOrder(req, res, next) {
        try {
            const { orderId, itemId } = req.params;
            const userId = req.user ? req.user._id : null;

            const result = await orderService.removeItemFromOrder(orderId, itemId, userId);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    itemId: result.itemId
                }
            });
        } catch (error) {
            if (error.message === 'Đơn hàng không tồn tại' ||
                error.message === 'Bạn không có quyền sửa đơn hàng này' ||
                error.message.includes('Chỉ có thể xóa món khi đơn hàng ở trạng thái Pending') ||
                error.message === 'Món không tồn tại trong đơn hàng' ||
                error.message === 'Món không thuộc đơn hàng này') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * UC-6: Xem lịch sử đặt món (Member)
     * GET /api/order/history
     */
    async getOrderHistory(req, res, next) {
        try {
            const userId = req.user._id;
            const { page, limit, status } = req.query;

            const options = {
                page: page || 1,
                limit: limit || 10,
                status: status || null
            };

            const result = await orderService.getOrderHistory(userId, options);

            return res.status(200).json({
                success: true,
                message: 'Lấy lịch sử đơn hàng thành công',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * UC-7: Xóa lịch sử đơn hàng (Member)
     * DELETE /api/order/:orderId/history
     */
    async deleteOrderHistory(req, res, next) {
        try {
            const userId = req.user._id;
            const { orderId } = req.params;

            const result = await orderService.deleteOrderHistory(userId, orderId);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    orderId: result.orderId
                }
            });
        } catch (error) {
            if (error.message === 'Đơn hàng không tồn tại' ||
                error.message === 'Bạn không có quyền xóa đơn hàng này' ||
                error.message.includes('Chỉ có thể xóa đơn hàng đã hoàn thành')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * UC-8: Đặt lại (Re-order) từ lịch sử (Member)
     * POST /api/order/:orderId/reorder
     */
    async reorderFromHistory(req, res, next) {
        try {
            const userId = req.user._id;
            const { orderId } = req.params;
            const orderData = req.body;

            const order = await orderService.reorderFromHistory(userId, orderId, orderData);

            return res.status(201).json({
                success: true,
                message: 'Đặt lại đơn hàng thành công',
                data: order
            });
        } catch (error) {
            if (error.message === 'Đơn hàng không tồn tại' ||
                error.message === 'Bạn không có quyền đặt lại đơn hàng này' ||
                error.message.includes('không khả dụng') ||
                error.message.includes('không đủ nguyên liệu')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * UC-9: Nhận thông báo order mới (Staff/Kitchen Staff)
     * GET /api/order/new
     */
    async getNewOrders(req, res, next) {
        try {
            const { page, limit } = req.query;

            const options = {
                page: page || 1,
                limit: limit || 20
            };

            const result = await orderService.getNewOrders(options);

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách đơn hàng mới thành công',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * UC-10: Cập nhật trạng thái order (Staff/Kitchen Staff/Manager)
     * PUT /api/order/:orderId/status
     */
    async updateOrderStatus(req, res, next) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            const userId = req.user._id;

            const result = await orderService.updateOrderStatus(orderId, status, userId);

            return res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái đơn hàng thành công',
                data: result
            });
        } catch (error) {
            if (error.message === 'Đơn hàng không tồn tại' ||
                error.message.includes('Trạng thái không hợp lệ')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
}

module.exports = new OrderController();

