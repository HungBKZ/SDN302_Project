// ...existing code...
const express = require('express');
const router = express.Router();
const CouponCtrl = require('./coupon.controller');
const auth = require('../../core/middlewares/auth');

// create (Admin or Manager)
router.post('/', auth, CouponCtrl.createCoupon);

// list (public)
router.get('/', CouponCtrl.listCoupons);

// get by id (public)
router.get('/:id', CouponCtrl.getCoupon);

// update (Admin or Manager)
router.put('/:id', auth, CouponCtrl.updateCoupon);

// delete (Admin or Manager)
router.delete('/:id', auth, CouponCtrl.deleteCoupon);

module.exports = router;
