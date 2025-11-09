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

// Validation cho thêm món vào yêu thích
const validateAddFavorite = [
    body('dishId')
        .notEmpty()
        .withMessage('ID món ăn không được để trống')
        .isMongoId()
        .withMessage('ID món ăn không hợp lệ'),
    validate
];

// Validation cho xóa/kiểm tra món yêu thích (dishId trong params)
const validateDishId = [
    param('dishId')
        .notEmpty()
        .withMessage('ID món ăn không được để trống')
        .isMongoId()
        .withMessage('ID món ăn không hợp lệ'),
    validate
];

module.exports = {
    validateAddFavorite,
    validateDishId
};
