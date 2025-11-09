const cartService = require('./cart.service');

class CartController {
    /**
     * POST /api/cart/items
     * UC-11: Thêm món vào giỏ
     */
    async addItemToCart(req, res, next) {
        try {
            const userId = req.user._id;
            const { dishId, quantity } = req.body;

            const cartItem = await cartService.addItemToCart(
                userId,
                dishId,
                quantity || 1);

            return res.status(200).json({
                success: true,
                message: 'Đã thêm món vào giỏ hàng',
                data: {
                    _id: cartItem._id,
                    dish: cartItem.DishId,
                    quantity: cartItem.Quantity
                }
            });
        } catch (error) {
            if (error.message === 'Món ăn không tồn tại' ||
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
     * GET /api/cart
     * UC-12: Xem giỏ hàng
     */
    async getCart(req, res, next) {
        try {
            const userId = req.user._id;
            const cartData = await cartService.getCart(userId);

            return res.status(200).json({
                success: true,
                message: 'Lấy thông tin giỏ hàng thành công',
                data: cartData
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/cart/items/:itemId
     * UC-13: Sửa số lượng món
     */
    async updateItemQuantity(req, res, next) {
        try {
            const userId = req.user._id;
            const { itemId } = req.params;
            const { quantity } = req.body;

            const cartItem = await cartService.updateItemQuantity(userId, itemId, quantity);

            return res.status(200).json({
                success: true,
                message: 'Đã cập nhật số lượng món',
                data: {
                    _id: cartItem._id,
                    dish: cartItem.DishId,
                    quantity: cartItem.Quantity
                }
            });
        } catch (error) {
            if (error.message === 'Món không tồn tại trong giỏ hàng' ||
                error.message === 'Bạn không có quyền sửa món này' ||
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
     * DELETE /api/cart/items/:itemId
     * UC-14: Xóa món khỏi giỏ
     */
    async removeItemFromCart(req, res, next) {
        try {
            const userId = req.user._id;
            const { itemId } = req.params;

            const result = await cartService.removeItemFromCart(userId, itemId);

            return res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    itemId: result.itemId
                }
            });
        } catch (error) {
            if (error.message === 'Món không tồn tại trong giỏ hàng' ||
                error.message === 'Bạn không có quyền xóa món này') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
}

module.exports = new CartController();

