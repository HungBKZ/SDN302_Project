const express = require('express');
const router = express.Router();
const accountController = require('./account.controller');
const auth = require('../../core/middlewares/auth');
const {
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword
} = require('./account.validation');

/**
 * @route   POST /api/account/register
 * @desc    Đăng ký tài khoản Customer mới
 * @access  Public
 */
router.post('/register', validateRegister, accountController.register);

/**
 * @route   POST /api/account/login
 * @desc    Đăng nhập
 * @access  Public
 */
router.post('/login', validateLogin, accountController.login);

/**
 * @route   POST /api/account/google-login
 * @desc    Đăng nhập bằng Google
 * @access  Public
 */
router.post('/google-login', accountController.googleLogin);

/**
 * @route   POST /api/account/logout
 * @desc    Đăng xuất
 * @access  Private
 */
router.post('/logout', auth, accountController.logout);

/**
 * @route   GET /api/account/me
 * @desc    Lấy thông tin tài khoản hiện tại
 * @access  Private
 */
router.get('/me', auth, accountController.getCurrentUser);

/**
 * @route   PUT /api/account/profile
 * @desc    Cập nhật thông tin tài khoản
 * @access  Private
 */
router.put('/profile', auth, validateUpdateProfile, accountController.updateProfile);

/**
 * @route   PUT /api/account/change-password
 * @desc    Đổi mật khẩu
 * @access  Private
 */
router.put('/change-password', auth, validateChangePassword, accountController.changePassword);

module.exports = router;
