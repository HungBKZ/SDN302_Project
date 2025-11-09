const Cart = require('../../models/Cart');
const CartItem = require('../../models/CartItem');
const Dish = require('../../models/Dish');
const mongoose = require('mongoose');

class CartService {
    /**
     * Lấy hoặc tạo giỏ hàng cho user
     * @param {String} userId - ID của user
     * @returns {Promise<Object>} Cart object
     */
    async getOrCreateCart(userId) {
        // Tìm giỏ hàng hiện tại của user (giả sử mỗi user chỉ có 1 giỏ hàng đang active)
        let cart = await Cart.findOne({ UserId: userId }).sort({ CreatedAt: -1 });

        // Nếu chưa có giỏ hàng, tạo mới
        if (!cart) {
            cart = new Cart({
                UserId: userId,
                CreatedAt: new Date()
            });
            await cart.save();
        }

        return cart;
    }

    /**
     * Thêm món vào giỏ hàng (UC-11)
     * @param {String} userId - ID của user
     * @param {String} dishId - ID của món ăn
     * @param {Number} quantity - Số lượng
     * @returns {Promise<Object>} CartItem đã được thêm/cập nhật
     */
    async addItemToCart(userId, dishId, quantity = 1) {
        // Kiểm tra món ăn tồn tại
        const dish = await Dish.findById(dishId);
        if (!dish) {
            throw new Error('Món ăn không tồn tại');
        }

        // Kiểm tra món ăn có sẵn
        if (dish.DishStatus && dish.DishStatus !== 'Available') {
            throw new Error('Món ăn hiện không khả dụng');
        }

        // Kiểm tra nguyên liệu
        if (dish.IngredientStatus && dish.IngredientStatus !== 'Sufficient') {
            throw new Error('Món ăn hiện không đủ nguyên liệu');
        }

        // Kiểm tra số lượng hợp lệ
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error('Số lượng phải là số nguyên >= 1');
        }

        // Lấy hoặc tạo giỏ hàng
        const cart = await this.getOrCreateCart(userId);

        // Sử dụng findOneAndUpdate với upsert để tránh race condition
        // Nếu đã có thì tăng số lượng, nếu chưa có thì tạo mới với Quantity = quantity
        // Lưu ý: với upsert, nếu document chưa tồn tại, $inc sẽ set giá trị ban đầu
        // Nhưng cần set cả CartId và DishId khi tạo mới
        let cartItem = await CartItem.findOneAndUpdate(
            {
                CartId: cart._id,
                DishId: dishId
            },
            {
                $inc: { Quantity: quantity },
                $setOnInsert: {
                    CartId: cart._id,
                    DishId: dishId
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        // Populate thông tin Dish
        await cartItem.populate('DishId');

        return cartItem;
    }

    /**
     * Xem giỏ hàng (UC-12)
     * @param {String} userId - ID của user
     * @returns {Promise<Object>} Thông tin giỏ hàng và các món
     */
    async getCart(userId) {
        // Lấy giỏ hàng
        const cart = await this.getOrCreateCart(userId);

        // Lấy tất cả items trong giỏ
        const cartItems = await CartItem.find({ CartId: cart._id })
            .populate('DishId')
            .lean();

        // Tính tổng tiền và filter các item có dish null (dish đã bị xóa)
        let totalAmount = 0;
        const items = cartItems
            .filter(item => item.DishId !== null) // Filter các dish đã bị xóa
            .map(item => {
                const dish = item.DishId;
                const itemTotal = dish.DishPrice * item.Quantity;
                totalAmount += itemTotal;

                return {
                    _id: item._id,
                    dish: {
                        _id: dish._id,
                        DishName: dish.DishName,
                        DishType: dish.DishType,
                        DishPrice: dish.DishPrice,
                        DishDescription: dish.DishDescription,
                        DishImage: dish.DishImage,
                        DishStatus: dish.DishStatus,
                        IngredientStatus: dish.IngredientStatus
                    },
                    quantity: item.Quantity,
                    itemTotal: itemTotal
                };
            });

        return {
            cart: {
                _id: cart._id,
                userId: cart.UserId,
                createdAt: cart.CreatedAt
            },
            items: items,
            totalAmount: totalAmount,
            totalItems: items.length
        };
    }

    /**
     * Sửa số lượng món (UC-13)
     * @param {String} userId - ID của user
     * @param {String} itemId - ID của CartItem
     * @param {Number} quantity - Số lượng mới
     * @returns {Promise<Object>} CartItem đã được cập nhật
     */
    async updateItemQuantity(userId, itemId, quantity) {
        // Kiểm tra số lượng hợp lệ
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error('Số lượng phải là số nguyên >= 1');
        }

        // Tìm CartItem
        const cartItem = await CartItem.findById(itemId).populate('CartId');
        if (!cartItem) {
            throw new Error('Món không tồn tại trong giỏ hàng');
        }

        // Kiểm tra CartItem thuộc về user
        const cart = cartItem.CartId;
        if (cart.UserId.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền sửa món này');
        }

        // Kiểm tra món ăn còn sẵn
        const dish = await Dish.findById(cartItem.DishId);
        if (!dish) {
            throw new Error('Món ăn không tồn tại');
        }
        if (dish.DishStatus && dish.DishStatus !== 'Available') {
            throw new Error('Món ăn hiện không khả dụng');
        }
        if (dish.IngredientStatus && dish.IngredientStatus !== 'Sufficient') {
            throw new Error('Món ăn hiện không đủ nguyên liệu');
        }

        // Cập nhật số lượng
        cartItem.Quantity = quantity;
        await cartItem.save();

        // Populate thông tin Dish
        await cartItem.populate('DishId');

        return cartItem;
    }

    /**
     * Xóa món khỏi giỏ (UC-14)
     * @param {String} userId - ID của user
     * @param {String} itemId - ID của CartItem
     * @returns {Promise<Object>} Thông tin xác nhận
     */
    async removeItemFromCart(userId, itemId) {
        // Tìm CartItem
        const cartItem = await CartItem.findById(itemId).populate('CartId');
        if (!cartItem) {
            throw new Error('Món không tồn tại trong giỏ hàng');
        }

        // Kiểm tra CartItem thuộc về user
        const cart = cartItem.CartId;
        if (cart.UserId.toString() !== userId.toString()) {
            throw new Error('Bạn không có quyền xóa món này');
        }

        // Xóa CartItem
        await CartItem.findByIdAndDelete(itemId);

        return {
            message: 'Đã xóa món khỏi giỏ hàng',
            itemId: itemId
        };
    }
}

module.exports = new CartService();

