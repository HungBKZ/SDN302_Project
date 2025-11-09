const { body, param, validationResult } = require('express-validator');

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

// Validation cho thêm món ăn mới
const validateCreateDish = [
    body('DishName')
        .notEmpty()
        .withMessage('Tên món ăn không được để trống')
        .isString()
        .withMessage('Tên món ăn phải là chuỗi')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Tên món ăn phải từ 2 đến 200 ký tự'),
    body('DishType')
        .notEmpty()
        .withMessage('Loại món ăn không được để trống')
        .isString()
        .withMessage('Loại món ăn phải là chuỗi')
        .trim(),
    body('DishPrice')
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
    body('DishDescription')
        .optional()
        .isString()
        .withMessage('Mô tả món ăn phải là chuỗi')
        .trim(),
    body('DishImage')
        .optional()
        .isString()
        .withMessage('Hình ảnh món ăn phải là chuỗi')
        .trim(),
    body('DishStatus')
        .optional()
        .isString()
        .withMessage('Trạng thái món ăn phải là chuỗi')
        .trim()
        .isIn(['Available', 'Unavailable'])
        .withMessage('Trạng thái món ăn phải là Available hoặc Unavailable'),
    body('IngredientStatus')
        .optional()
        .isString()
        .withMessage('Trạng thái nguyên liệu phải là chuỗi')
        .trim()
        .isIn(['Sufficient', 'Insufficient'])
        .withMessage('Trạng thái nguyên liệu phải là Sufficient hoặc Insufficient'),
    validate
];

// Validation cho cập nhật món ăn
const validateUpdateDish = [
    param('id')
        .notEmpty()
        .withMessage('ID món ăn không được để trống')
        .isMongoId()
        .withMessage('ID món ăn không hợp lệ'),
    body('DishName')
        .optional()
        .isString()
        .withMessage('Tên món ăn phải là chuỗi')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Tên món ăn phải từ 2 đến 200 ký tự'),
    body('DishType')
        .optional()
        .isString()
        .withMessage('Loại món ăn phải là chuỗi')
        .trim(),
    body('DishPrice')
        .optional()
        .isNumeric()
        .withMessage('Giá món ăn phải là số')
        .custom((value) => {
            if (value < 0) {
                throw new Error('Giá món ăn phải lớn hơn hoặc bằng 0');
            }
            return true;
        }),
    body('DishDescription')
        .optional()
        .isString()
        .withMessage('Mô tả món ăn phải là chuỗi')
        .trim(),
    body('DishImage')
        .optional()
        .isString()
        .withMessage('Hình ảnh món ăn phải là chuỗi')
        .trim(),
    body('DishStatus')
        .optional()
        .isString()
        .withMessage('Trạng thái món ăn phải là chuỗi')
        .trim()
        .isIn(['Available', 'Unavailable'])
        .withMessage('Trạng thái món ăn phải là Available hoặc Unavailable'),
    body('IngredientStatus')
        .optional()
        .isString()
        .withMessage('Trạng thái nguyên liệu phải là chuỗi')
        .trim()
        .isIn(['Sufficient', 'Insufficient'])
        .withMessage('Trạng thái nguyên liệu phải là Sufficient hoặc Insufficient'),
    validate
];

// Validation cho xem chi tiết món ăn
const validateDishId = [
    param('id')
        .notEmpty()
        .withMessage('ID món ăn không được để trống')
        .isMongoId()
        .withMessage('ID món ăn không hợp lệ'),
    validate
];

module.exports = {
    validateCreateDish,
    validateUpdateDish,
    validateDishId
};
