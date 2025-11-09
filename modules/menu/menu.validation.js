const { param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Middleware để kiểm tra kết quả validation
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors.array()
        });
    }
    next();
};

// Validation cho việc lấy chi tiết món ăn
const validateGetDishById = [
    param('id')
        .notEmpty()
        .withMessage('ID món ăn không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID món ăn không hợp lệ');
            }
            return true;
        }),
    validate
];

// Validation cho query parameters khi lấy danh sách món ăn
const validateGetAllDishes = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Trang phải là số nguyên dương'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Giới hạn phải từ 1 đến 100'),
    query('sortBy')
        .optional()
        .isIn(['DishName', 'DishPrice', 'CreatedAt', 'UpdatedAt'])
        .withMessage('Sắp xếp không hợp lệ'),
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Thứ tự sắp xếp phải là asc hoặc desc'),
    query('type')
        .optional()
        .isString()
        .withMessage('Loại món ăn phải là chuỗi'),
    query('status')
        .optional()
        .isString()
        .withMessage('Trạng thái món ăn phải là chuỗi'),
    query('ingredientStatus')
        .optional()
        .isString()
        .withMessage('Trạng thái nguyên liệu phải là chuỗi'),
    query('search')
        .optional()
        .isString()
        .withMessage('Từ khóa tìm kiếm phải là chuỗi'),
    validate
];

// Validation cho tìm kiếm món ăn
const validateSearchDishes = [
    query('keyword')
        .notEmpty()
        .withMessage('Từ khóa tìm kiếm không được để trống')
        .isString()
        .withMessage('Từ khóa tìm kiếm phải là chuỗi')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Từ khóa tìm kiếm phải từ 1 đến 100 ký tự'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Giới hạn phải từ 1 đến 50'),
    validate
];

// Validation cho lấy món ăn nổi bật
const validateGetFeaturedDishes = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Giới hạn phải từ 1 đến 20'),
    validate
];

// Validation cho việc tạo món ăn mới
const validateCreateDish = [
    require('express-validator').body('DishName')
        .notEmpty()
        .withMessage('Tên món ăn không được để trống')
        .isString()
        .withMessage('Tên món ăn phải là chuỗi')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên món ăn phải từ 2 đến 100 ký tự'),
    require('express-validator').body('DishType')
        .notEmpty()
        .withMessage('Loại món ăn không được để trống')
        .isString()
        .withMessage('Loại món ăn phải là chuỗi')
        .trim(),
    require('express-validator').body('DishPrice')
        .notEmpty()
        .withMessage('Giá món ăn không được để trống')
        .isNumeric()
        .withMessage('Giá món ăn phải là số')
        .custom((value) => {
            if (value < 0) {
                throw new Error('Giá món ăn phải lớn hơn hoặc bằng 0');
            }
            return true;
        }),
    require('express-validator').body('DishDescription')
        .optional()
        .isString()
        .withMessage('Mô tả món ăn phải là chuỗi')
        .trim()
        .isLength({ max: 500 })
        .withMessage('Mô tả không được vượt quá 500 ký tự'),
    require('express-validator').body('DishImage')
        .optional()
        .isString()
        .withMessage('Hình ảnh món ăn phải là chuỗi')
        .trim(),
    require('express-validator').body('DishStatus')
        .optional()
        .isString()
        .withMessage('Trạng thái món ăn phải là chuỗi')
        .isIn(['Available', 'Unavailable'])
        .withMessage('Trạng thái món ăn phải là Available hoặc Unavailable'),
    require('express-validator').body('IngredientStatus')
        .optional()
        .isString()
        .withMessage('Trạng thái nguyên liệu phải là chuỗi')
        .isIn(['Sufficient', 'Insufficient'])
        .withMessage('Trạng thái nguyên liệu phải là Sufficient hoặc Insufficient'),
    validate
];

module.exports = {
    validateGetDishById,
    validateGetAllDishes,
    validateSearchDishes,
    validateGetFeaturedDishes,
    validateCreateDish
};
