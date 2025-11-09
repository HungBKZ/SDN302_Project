const express = require('express');
const router = express.Router();

/**
 * @route   GET /login
 * @desc    Render trang đăng nhập
 * @access  Public
 */
router.get('/login', (req, res) => {
    res.render('login');
});

/**
 * @route   GET /reset-password
 * @desc    Render trang quên mật khẩu
 * @access  Public
 */
router.get('/reset-password', (req, res) => {
    res.render('reset-password');
});

/**
 * @route   GET /register
 * @desc    Render trang đăng ký
 * @access  Public
 */
router.get('/register', (req, res) => {
    res.render('register');
});

/**
 * @route   GET /menu
 * @desc    Render trang menu
 * @access  Public
 */
router.get('/menu', (req, res) => {
    res.render('menu');
});

/**
 * @route   GET /cart
 * @desc    Render trang giỏ hàng
 * @access  Public
 */
router.get('/cart', (req, res) => {
    res.render('cart');
});

/**
 * @route   GET /profile
 * @desc    Render trang hồ sơ cá nhân
 * @access  Public
 */
router.get('/profile', (req, res) => {
    res.render('profile');
});

/**
 * @route   GET /favorites
 * @desc    Render trang món yêu thích
 * @access  Public
 */
router.get('/favorites', (req, res) => {
    res.render('favorites');
});

/**
 * @route   GET /dish-detail
 * @desc    Render trang chi tiết món ăn
 * @access  Public
 */
router.get('/dish-detail', (req, res) => {
    res.render('dish-detail');
});

/**
 * @route   GET /manager/dashboard
 * @desc    Render trang quản lý
 * @access  Manager only
 */
router.get('/manager/dashboard', (req, res) => {
    res.render('manager-dashboard');
});

/**
 * @route GET /chat
 * @desc  Render chat page (basic realtime UI)
 */
router.get('/chat', (req, res) => {
    res.render('chat');
});

/**
 * @route   GET /manager-dashboard
 * @desc    Render trang quản lý (alternative route)
 * @access  Manager only
 */
router.get('/manager-dashboard', (req, res) => {
    res.render('manager-dashboard');
});

/**
 * @route   GET /cou pon
 * @desc    Render trang quản lý khuyến mãi
 * @access  Manager only
 */
router.get('/coupon', (req, res) => {
    res.render('coupon');
});

module.exports = router;
