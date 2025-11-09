const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const auth = require('../../core/middlewares/auth');
const optionalAuth = require('../../core/middlewares/optionalAuth');
const { checkRole } = require('../../core/middlewares/roles');
const {
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
} = require('./order.validation');

/**
 * @route   POST /api/order/from-cart
 * @desc    UC-1: Tạo order từ giỏ hàng (Member)
 * @access  Private (cần token)
 */
router.post('/from-cart', auth, validateCreateOrderFromCart, orderController.createOrderFromCart);

/**
 * @route   GET /api/order/history
 * @desc    UC-6: Xem lịch sử đặt món (Member)
 * @access  Private (cần token)
 */
router.get('/history', auth, validateGetOrderHistory, orderController.getOrderHistory);

/**
 * @route   GET /api/order/new
 * @desc    UC-9: Nhận thông báo order mới (Staff/Kitchen Staff)
 * @access  Private (cần token + role Staff/Kitchen Staff)
 */
router.get('/new', auth, checkRole('Waiter', 'Kitchen staff'), validateGetNewOrders, orderController.getNewOrders);

/**
 * @route   POST /api/order
 * @desc    UC-1: Tạo order mới (Guest/Member)
 * @access  Public (optional auth)
 */
router.post('/', optionalAuth, validateCreateOrder, orderController.createOrder);

/**
 * @route   GET /api/order/:orderId/menu
 * @desc    UC-2: Xem menu trong order (Guest/Member)
 * @access  Public (optional auth)
 */
router.get('/:orderId/menu', optionalAuth, validateGetOrderMenu, orderController.getOrderMenu);

/**
 * @route   POST /api/order/:orderId/items
 * @desc    UC-3: Thêm món vào order (Guest/Member)
 * @access  Public (optional auth)
 */
router.post('/items/:orderId', optionalAuth, validateAddItemToOrder, orderController.addItemToOrder);

/**
 * @route   PUT /api/order/:orderId/items/:itemId
 * @desc    UC-4: Sửa số lượng món trong order (Guest/Member)
 * @access  Public (optional auth)
 */
router.put('/:orderId/items/:itemId', optionalAuth, validateUpdateItemQuantity, orderController.updateItemQuantity);

/**
 * @route   DELETE /api/order/:orderId/items/:itemId
 * @desc    UC-5: Xóa món trong order (chưa chế biến) (Guest/Member)
 * @access  Public (optional auth)
 */
router.delete('/:orderId/items/:itemId', optionalAuth, validateRemoveItemFromOrder, orderController.removeItemFromOrder);

/**
 * @route   DELETE /api/order/:orderId/history
 * @desc    UC-7: Xóa lịch sử đơn hàng (Member)
 * @access  Private (cần token)
 */
router.delete('/:orderId/history', auth, validateDeleteOrderHistory, orderController.deleteOrderHistory);

/**
 * @route   POST /api/order/:orderId/reorder
 * @desc    UC-8: Đặt lại (Re-order) từ lịch sử (Member)
 * @access  Private (cần token)
 */
router.post('/:orderId/reorder', auth, validateReorderFromHistory, orderController.reorderFromHistory);

/**
 * @route   PUT /api/order/:orderId/status
 * @desc    UC-10: Cập nhật trạng thái order (Staff/Kitchen Staff/Manager)
 * @access  Private (cần token + role Staff/Kitchen Staff/Manager)
 */
router.put('/:orderId/status', auth, checkRole('Waiter', 'Kitchen staff', 'Manager'), validateUpdateOrderStatus, orderController.updateOrderStatus);

module.exports = router;

