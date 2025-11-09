const express = require('express');

// Import các router modules
const menuRouter = require('../modules/menu/menu.router');
const accountRouter = require('../modules/account/account.router');
// const authRouter = require('../modules/auth/auth.router');
// const orderRouter = require('../modules/order/order.router');

/**
 * Khởi tạo và cấu hình tất cả routes cho ứng dụng
 * @param {Express} app - Express application instance
 */
const initRoutes = (app) => {
    // API routes
    app.use('/api/menu', menuRouter);
    app.use('/api/account', accountRouter);
    // Uncomment khi đã có router tương ứng
    // app.use('/api/auth', authRouter);
    // app.use('/api/order', orderRouter);

    // Health check route
    app.get('/health', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Server is running',
            timestamp: new Date().toISOString()
        });
    });

    // Root route
    app.get('/', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'Welcome to Restaurant API',
            version: '1.0.0',
            endpoints: {
                menu: '/api/menu',
                account: '/api/account',
                // auth: '/api/auth',
                // order: '/api/order',
                health: '/health'
            }
        });
    });

    // 404 handler - phải đặt cuối cùng
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Route not found',
            path: req.originalUrl
        });
    });
};

module.exports = initRoutes;
