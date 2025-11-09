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
 * @route   GET /manager/dashboard
 * @desc    Render trang quản lý
 * @access  Manager only
 */
router.get('/manager/dashboard', (req, res) => {
    res.render('manager-dashboard');
});

module.exports = router;
