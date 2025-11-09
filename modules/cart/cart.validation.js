const { body, param, validationResult } = require('express-validator');
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

// Validation cho thêm món vào giỏ (UC-11)
const validateAddItemToCart = [
    body('dishId')
        .notEmpty()
        .withMessage('ID món ăn không được để trống')
        .isString()
        .withMessage('ID món ăn phải là chuỗi')
        .trim()
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID món ăn không hợp lệ');
            }
            return true;
        }),
    body('quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Số lượng phải là số nguyên >= 1')
        .toInt(),
    validate
];

// Validation cho sửa số lượng món (UC-13)
const validateUpdateItemQuantity = [
    param('itemId')
        .notEmpty()
        .withMessage('ID món trong giỏ không được để trống')
        .isString()
        .withMessage('ID món trong giỏ phải là chuỗi')
        .trim()
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID món trong giỏ không hợp lệ');
            }
            return true;
        }),
    body('quantity')
        .notEmpty()
        .withMessage('Số lượng không được để trống')
        .isInt({ min: 1 })
        .withMessage('Số lượng phải là số nguyên >= 1')
        .toInt(),
    validate
];

// Validation cho xóa món khỏi giỏ (UC-14)
const validateRemoveItemFromCart = [
    param('itemId')
        .notEmpty()
        .withMessage('ID món trong giỏ không được để trống')
        .isString()
        .withMessage('ID món trong giỏ phải là chuỗi')
        .trim()
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID món trong giỏ không hợp lệ');
            }
            return true;
        }),
    validate
];

module.exports = {
    validateAddItemToCart,
    validateUpdateItemQuantity,
    validateRemoveItemFromCart
};

