const express = require('express');

// Import các router modules
const viewRouter = require('../modules/view/view.router');
const menuRouter = require('../modules/menu/menu.router');
const accountRouter = require('../modules/account/account.router');
const managerRouter = require('../modules/manager/manager.router');
const favoriteRouter = require('../modules/favorite/favorite.router');
const tableRouter = require('../modules/table/table.router');
const cartRouter = require('../modules/cart/cart.router');
const reservationRouter = require('../modules/reservation/reservation.router');
const couponRouter = require('../modules/coupon/coupon.router');
const rewardRouter = require('../modules/reward/reward.router');
// const authRouter = require('../modules/auth/auth.router');
// const orderRouter = require('../modules/order/order.router');

/**
 * Khởi tạo và cấu hình tất cả routes cho ứng dụng
 * @param {Express} app - Express application instance
 */
const initRoutes = (app) => {
    // View routes (render EJS pages)
    app.use('/', viewRouter);

    // API routes
    app.use('/api/menu', menuRouter);
    app.use('/api/account', accountRouter);
    app.use('/api/manager', managerRouter);
    app.use('/api/favorite', favoriteRouter);
    app.use('/api/tables', tableRouter);
    app.use('/api/cart', cartRouter);
    app.use('/api/reservations', reservationRouter);
    app.use('/api/coupons', couponRouter);
    app.use('/api/reward', rewardRouter);
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
                manager: '/api/manager',
                favorite: '/api/favorite',
                tables: '/api/tables',
                cart: '/api/cart',
                coupons: '/api/coupons',
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
