const express = require('express');
const router = express.Router();
const accountController = require('./account.controller');
const auth = require('../../core/middlewares/auth');
const {
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    validateChangePassword,
    validateCreateStaff
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


/* ---------- New features - Nhu (ĐÃ THÊM ROUTES) ---------- */

/**
 * @route   DELETE /api/account/me
 * @desc    Customer tự vô hiệu hóa tài khoản
 * @access  Private (Customer only, check trong controller)
 */
router.delete('/me', auth, accountController.selfDelete);

/**
 * @route   POST /api/account/staff
 * @desc    Admin/Manager tạo tài khoản nhân viên
 * @access  Private (Admin/Manager, check trong controller)
 */
router.post('/staff', auth, validateCreateStaff, accountController.createStaffAccount);

/**
 * @route   GET /api/account/list
 * @desc    Admin/Manager lấy danh sách tài khoản
 * @access  Private (Admin/Manager, check trong controller)
 */
router.get('/list', auth, accountController.listAccounts);

/**
D* @route   GET /api/account/:id
 * @desc    Admin/Manager lấy chi tiết 1 tài khoản
 * @access  Private (Admin/Manager, check trong controller)
 */
router.get('/:id', auth, accountController.getAccountDetails);

/**
 * @route   DELETE /api/account/:id
 * @desc    Admin/Manager vô hiệu hóa 1 tài khoản
 * @access  Private (Admin/Manager, check trong controller)
 */
router.delete('/:id', auth, accountController.softDeleteAccount);


module.exports = router;


