const express = require('express');
const router = express.Router();
const favoriteController = require('./favorite.controller');
const auth = require('../../core/middlewares/auth');
const {
    validateAddFavorite,
    validateDishId
} = require('./favorite.validation');

/**
 * @route   POST /api/favorite/add
 * @desc    Thêm món vào danh sách yêu thích
 * @access  Private
 */
router.post('/add', auth, validateAddFavorite, favoriteController.addFavorite);

/**
 * @route   DELETE /api/favorite/remove/:dishId
 * @desc    Xóa món khỏi danh sách yêu thích
 * @access  Private
 */
router.delete('/remove/:dishId', auth, validateDishId, favoriteController.removeFavorite);

/**
 * @route   GET /api/favorite/list
 * @desc    Lấy danh sách món yêu thích của user hiện tại
 * @access  Private
 */
router.get('/list', auth, favoriteController.getFavorites);

/**
 * @route   GET /api/favorite/check/:dishId
 * @desc    Kiểm tra món ăn đã được yêu thích chưa
 * @access  Private
 */
router.get('/check/:dishId', auth, validateDishId, favoriteController.checkFavorite);

/**
 * @route   GET /api/favorite/count
 * @desc    Đếm số lượng món yêu thích
 * @access  Private
 */
router.get('/count', auth, favoriteController.countFavorites);

module.exports = router;
