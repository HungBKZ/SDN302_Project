const { body, validationResult } = require('express-validator');
const { ACCOUNT_ROLES } = require('../../models/Account'); // <-- added


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

// Validation cho đăng ký
const validateRegister = [
    body('UserCode')
        .notEmpty()
        .withMessage('Mã người dùng không được để trống')
        .isString()
        .withMessage('Mã người dùng phải là chuỗi')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Mã người dùng phải từ 3 đến 20 ký tự'),
    body('UserEmail')
        .notEmpty()
        .withMessage('Email không được để trống')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail()
        .toLowerCase(),
    body('UserPhone')
        .notEmpty()
        .withMessage('Số điện thoại không được để trống')
        .isString()
        .withMessage('Số điện thoại phải là chuỗi')
        .trim()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại phải có 10-11 chữ số'),
    body('UserPassword')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống')
        .isString()
        .withMessage('Mật khẩu phải là chuỗi')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('Name')
        .notEmpty()
        .withMessage('Tên không được để trống')
        .isString()
        .withMessage('Tên phải là chuỗi')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên phải từ 2 đến 100 ký tự'),
    body('IdentityCard')
        .notEmpty()
        .withMessage('CMND/CCCD không được để trống')
        .isString()
        .withMessage('CMND/CCCD phải là chuỗi')
        .trim()
        .matches(/^[0-9]{9,12}$/)
        .withMessage('CMND/CCCD phải có 9-12 chữ số'),
    body('UserAddress')
        .optional()
        .isString()
        .withMessage('Địa chỉ phải là chuỗi')
        .trim(),
    body('UserImage')
        .optional()
        .isString()
        .withMessage('Hình ảnh phải là chuỗi')
        .trim(),
    validate
];

// Validation cho đăng nhập
const validateLogin = [
    body('email')
        .notEmpty()
        .withMessage('Email không được để trống')
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail()
        .toLowerCase(),
    body('password')
        .notEmpty()
        .withMessage('Mật khẩu không được để trống')
        .isString()
        .withMessage('Mật khẩu phải là chuỗi'),
    validate
];

// Validation cho cập nhật profile
const validateUpdateProfile = [
    body('Name')
        .optional()
        .isString()
        .withMessage('Tên phải là chuỗi')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên phải từ 2 đến 100 ký tự'),
    body('UserPhone')
        .optional()
        .isString()
        .withMessage('Số điện thoại phải là chuỗi')
        .trim()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại phải có 10-11 chữ số'),
    body('UserAddress')
        .optional()
        .isString()
        .withMessage('Địa chỉ phải là chuỗi')
        .trim(),
    body('UserImage')
        .optional()
        .isString()
        .withMessage('Hình ảnh phải là chuỗi')
        .trim(),
    validate
];

// Validation cho đổi mật khẩu
const validateChangePassword = [
    body('oldPassword')
        .notEmpty()
        .withMessage('Mật khẩu cũ không được để trống')
        .isString()
        .withMessage('Mật khẩu cũ phải là chuỗi'),
    body('newPassword')
        .notEmpty()
        .withMessage('Mật khẩu mới không được để trống')
        .isString()
        .withMessage('Mật khẩu mới phải là chuỗi')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
        .custom((value, { req }) => {
            if (value === req.body.oldPassword) {
                throw new Error('Mật khẩu mới phải khác mật khẩu cũ');
            }
            return true;
        }),
    validate
];

// ---------- VALIDATION MỚI CHO TẠO STAFF ----------
const validateCreateStaff = [
    body('UserCode')
        .notEmpty().withMessage('Mã người dùng không được để trống')
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage('Mã người dùng phải từ 3 đến 20 ký tự'),
    body('UserEmail')
        .notEmpty().withMessage('Email không được để trống')
        .isEmail().withMessage('Email không hợp lệ')
        .normalizeEmail().toLowerCase(),
    body('UserPassword')
        .notEmpty().withMessage('Mật khẩu không được để trống')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
    body('Name')
        .notEmpty().withMessage('Tên không được để trống')
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2 đến 100 ký tự'),
    body('UserRole')
        .notEmpty().withMessage('UserRole không được để trống')
        .isIn([ACCOUNT_ROLES[3], ACCOUNT_ROLES[4]]) // [ 'Waiter', 'Kitchen staff' ]
        .withMessage('UserRole phải là "Waiter" hoặc "Kitchen staff"'),
    body('UserPhone')
        .optional({ checkFalsy: true }) // Cho phép rỗng hoặc undefined
        .isString().withMessage('Số điện thoại phải là chuỗi')
        .trim()
        .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại phải có 10-11 chữ số'),
    body('IdentityCard')
        .optional({ checkFalsy: true })
        .isString().withMessage('CMND/CCCD phải là chuỗi')
        .trim()
        .matches(/^[0-9]{9,12}$/).withMessage('CMND/CCCD phải có 9-12 chữ số'),
    validate
];
// ----------------------------------------------------

module.exports = {
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword,
    validateCreateStaff // ⚡ Export validation mới
};
