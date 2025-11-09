const PaymentController = require('./payment.controller');
const express = require('express');
const router = express.Router();
const auth = require('../../core/middlewares/auth');

router.get('/history', auth, PaymentController.viewHistoryOrder);

module.exports = router;