const { body, param, query, validationResult } = require('express-validator');
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

// Validation cho tạo order (UC-1)
const validateCreateOrder = [
    body('OrderType')
        .optional()
        .isString()
        .withMessage('Loại đơn hàng phải là chuỗi')
        .isIn(['Dine-in', 'Takeaway'])
        .withMessage('Loại đơn hàng phải là Dine-in hoặc Takeaway'),
    body('TableId')
        .optional()
        .custom((value) => {
            if (value !== null && !mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID bàn không hợp lệ');
            }
            return true;
        }),
    body('CustomerPhone')
        .optional()
        .isString()
        .withMessage('Số điện thoại phải là chuỗi')
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại phải có 10-11 chữ số'),
    body('OrderDescription')
        .optional()
        .isString()
        .withMessage('Mô tả đơn hàng phải là chuỗi')
        .trim(),
    body('items')
        .optional()
        .isArray()
        .withMessage('Items phải là mảng'),
    body('items.*.dishId')
        .if(body('items').exists())
        .notEmpty()
        .withMessage('ID món ăn không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID món ăn không hợp lệ');
            }
            return true;
        }),
    body('items.*.quantity')
        .if(body('items').exists())
        .isInt({ min: 1 })
        .withMessage('Số lượng phải là số nguyên >= 1')
        .toInt(),
    validate
];

// Validation cho tạo order từ giỏ hàng
const validateCreateOrderFromCart = [
    body('OrderType')
        .optional()
        .isString()
        .withMessage('Loại đơn hàng phải là chuỗi')
        .isIn(['Dine-in', 'Takeaway'])
        .withMessage('Loại đơn hàng phải là Dine-in hoặc Takeaway'),
    body('TableId')
        .optional()
        .custom((value) => {
            if (value !== null && !mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID bàn không hợp lệ');
            }
            return true;
        }),
    body('OrderDescription')
        .optional()
        .isString()
        .withMessage('Mô tả đơn hàng phải là chuỗi')
        .trim(),
    validate
];

// Validation cho xem menu trong order (UC-2)
const validateGetOrderMenu = [
    param('orderId')
        .notEmpty()
        .withMessage('ID đơn hàng không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID đơn hàng không hợp lệ');
            }
            return true;
        }),
    validate
];

// Validation cho thêm món vào order (UC-3)
const validateAddItemToOrder = [
    param('orderId')
        .notEmpty()
        .withMessage('ID đơn hàng không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID đơn hàng không hợp lệ');
            }
            return true;
        }),
    body('dishId')
        .notEmpty()
        .withMessage('ID món ăn không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID món ăn không hợp lệ');
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

// Validation cho sửa số lượng món (UC-4)
const validateUpdateItemQuantity = [
    param('orderId')
        .notEmpty()
        .withMessage('ID đơn hàng không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID đơn hàng không hợp lệ');
            }
            return true;
        }),
    param('itemId')
        .notEmpty()
        .withMessage('ID món trong đơn không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID món trong đơn không hợp lệ');
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

// Validation cho xóa món (UC-5)
const validateRemoveItemFromOrder = [
    param('orderId')
        .notEmpty()
        .withMessage('ID đơn hàng không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID đơn hàng không hợp lệ');
            }
            return true;
        }),
    param('itemId')
        .notEmpty()
        .withMessage('ID món trong đơn không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID món trong đơn không hợp lệ');
            }
            return true;
        }),
    validate
];

// Validation cho xem lịch sử (UC-6)
const validateGetOrderHistory = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page phải là số nguyên >= 1')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit phải là số nguyên từ 1 đến 100')
        .toInt(),
    query('status')
        .optional()
        .isString()
        .withMessage('Status phải là chuỗi')
        .isIn(['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'])
        .withMessage('Status không hợp lệ'),
    validate
];

// Validation cho xóa lịch sử (UC-7)
const validateDeleteOrderHistory = [
    param('orderId')
        .notEmpty()
        .withMessage('ID đơn hàng không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID đơn hàng không hợp lệ');
            }
            return true;
        }),
    validate
];

// Validation cho reorder (UC-8)
const validateReorderFromHistory = [
    param('orderId')
        .notEmpty()
        .withMessage('ID đơn hàng không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID đơn hàng không hợp lệ');
            }
            return true;
        }),
    body('OrderType')
        .optional()
        .isString()
        .withMessage('Loại đơn hàng phải là chuỗi')
        .isIn(['Dine-in', 'Takeaway'])
        .withMessage('Loại đơn hàng phải là Dine-in hoặc Takeaway'),
    body('TableId')
        .optional()
        .custom((value) => {
            if (value !== null && !mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID bàn không hợp lệ');
            }
            return true;
        }),
    body('OrderDescription')
        .optional()
        .isString()
        .withMessage('Mô tả đơn hàng phải là chuỗi')
        .trim(),
    validate
];

// Validation cho lấy đơn hàng mới (UC-9)
const validateGetNewOrders = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page phải là số nguyên >= 1')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit phải là số nguyên từ 1 đến 100')
        .toInt(),
    validate
];

// Validation cho cập nhật trạng thái (UC-10)
const validateUpdateOrderStatus = [
    param('orderId')
        .notEmpty()
        .withMessage('ID đơn hàng không được để trống')
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new Error('ID đơn hàng không hợp lệ');
            }
            return true;
        }),
    body('status')
        .notEmpty()
        .withMessage('Trạng thái không được để trống')
        .isString()
        .withMessage('Trạng thái phải là chuỗi')
        .isIn(['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'])
        .withMessage('Trạng thái không hợp lệ'),
    validate
];

module.exports = {
    validateCreateOrder,
    validateCreateOrderFromCart,
    validateGetOrderMenu,
    validateAddItemToOrder,
    validateUpdateItemQuantity,
    validateRemoveItemFromOrder,
    validateGetOrderHistory,
    validateDeleteOrderHistory,
    validateReorderFromHistory,
    validateGetNewOrders,
    validateUpdateOrderStatus
};

