const orderDetailController = require('./orderDetail.controller');
const express = require('express');
const router = express.Router();
const auth = require('../../core/middlewares/auth');

router.get('/', auth, orderDetailController.orderDetail);

module.exports = router;