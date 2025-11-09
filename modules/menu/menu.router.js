const express = require('express');
const router = express.Router();
const menuController = require('./menu.controller');
const {
    validateGetDishById,
    validateGetAllDishes,
    validateSearchDishes,
    validateGetFeaturedDishes,
    validateCreateDish
} = require('./menu.validation');
const auth = require('../../core/middlewares/auth');
const { isManager } = require('../../core/middlewares/roles');

/**
 * @route   POST /api/menu
 * @desc    Thêm món ăn mới
 * @access  Private (chỉ Manager)
 * @body    {String} DishName - Tên món ăn (bắt buộc)
 * @body    {String} DishType - Loại món ăn (bắt buộc)
 * @body    {Number} DishPrice - Giá món ăn (bắt buộc)
 * @body    {String} DishDescription - Mô tả món ăn
 * @body    {String} DishImage - Hình ảnh món ăn
 * @body    {String} DishStatus - Trạng thái món ăn (Available/Unavailable)
 * @body    {String} IngredientStatus - Trạng thái nguyên liệu (Sufficient/Insufficient)
 */
router.post('/', auth, isManager, validateCreateDish, menuController.createDish);

/**
 * @route   GET /api/menu
 * @desc    Lấy danh sách tất cả món ăn (có phân trang và lọc)
 * @access  Public
 * @query   {Number} page - Trang hiện tại (mặc định: 1)
 * @query   {Number} limit - Số lượng món ăn mỗi trang (mặc định: 10)
 * @query   {String} type - Lọc theo loại món ăn
 * @query   {String} status - Lọc theo trạng thái món ăn
 * @query   {String} ingredientStatus - Lọc theo trạng thái nguyên liệu
 * @query   {String} search - Tìm kiếm theo tên món ăn
 * @query   {String} sortBy - Sắp xếp theo trường (DishName, DishPrice, CreatedAt, UpdatedAt)
 * @query   {String} sortOrder - Thứ tự sắp xếp (asc, desc)
 */
router.get('/', validateGetAllDishes, menuController.getAllDishes);

/**
 * @route   GET /api/menu/types/list
 * @desc    Lấy danh sách các loại món ăn
 * @access  Public
 */
router.get('/types/list', menuController.getDishTypes);

/**
 * @route   GET /api/menu/featured
 * @desc    Lấy danh sách món ăn nổi bật
 * @access  Public
 * @query   {Number} limit - Số lượng món ăn (mặc định: 5)
 */
router.get('/featured', validateGetFeaturedDishes, menuController.getFeaturedDishes);

/**
 * @route   GET /api/menu/search
 * @desc    Tìm kiếm món ăn theo tên
 * @access  Public
 * @query   {String} keyword - Từ khóa tìm kiếm (bắt buộc)
 * @query   {Number} limit - Số lượng kết quả (mặc định: 10)
 */
router.get('/search', validateSearchDishes, menuController.searchDishes);

/**
 * @route   GET /api/menu/:id
 * @desc    Lấy chi tiết món ăn theo ID
 * @access  Public
 * @params  {String} id - ID của món ăn
 */
router.get('/:id', validateGetDishById, menuController.getDishById);

module.exports = router;
