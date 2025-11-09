const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');
const auth = require('../../core/middlewares/auth');
const {
    validateAddItemToCart,
    validateUpdateItemQuantity,
    validateRemoveItemFromCart
} = require('./cart.validation');

/**
 * @route   POST /api/cart/items
 * @desc    UC-11: Thêm món vào giỏ hàng
 * @access  Private (cần token)
 * @body    {String} dishId - ID của món ăn (bắt buộc)
 * @body    {Number} quantity - Số lượng (tùy chọn, mặc định: 1)
 */
router.post('/items', auth, validateAddItemToCart, cartController.addItemToCart);

/**
 * @route   GET /api/cart
 * @desc    UC-12: Xem giỏ hàng
 * @access  Private (cần token)
 */
router.get('/', auth, cartController.getCart);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    UC-13: Sửa số lượng món trong giỏ hàng
 * @access  Private (cần token)
 * @params  {String} itemId - ID của món trong giỏ hàng
 * @body    {Number} quantity - Số lượng mới (bắt buộc)
 */
router.put('/items/:itemId', auth, validateUpdateItemQuantity, cartController.updateItemQuantity);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    UC-14: Xóa món khỏi giỏ hàng
 * @access  Private (cần token)
 * @params  {String} itemId - ID của món trong giỏ hàng
 */
router.delete('/items/:itemId', auth, validateRemoveItemFromCart, cartController.removeItemFromCart);

module.exports = router;

