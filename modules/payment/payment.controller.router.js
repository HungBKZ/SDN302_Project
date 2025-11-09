const PaymentController = require('./payment.controller');
const express = require('express');
const router = express.Router();
const auth = require('../../core/middlewares/auth');

router.get('/history', auth, PaymentController.viewHistoryOrder);
// New route: GET /api/payments/completed -> list only completed payments
router.get('/completed', auth, PaymentController.listCompletedPayments);
// View payment detail by id
router.get('/detail/:id', auth, PaymentController.viewPaymentDetail);
// Process a payment
router.post('/pay', auth, PaymentController.processPayment);

module.exports = router;