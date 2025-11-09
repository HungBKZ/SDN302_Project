const express = require('express');
const router = express.Router();
const rewardController = require('./reward.controller');
const auth = require('../../core/middlewares/auth');

/**
 * @route GET /api/reward/history
 * @desc  Lấy lịch sử thay đổi/đổi điểm của người dùng (phân trang)
 * @access Private
 */
router.get('/history', auth, rewardController.getHistory);

/**
 * @route POST /api/reward/earn
 * @desc  Tích điểm cho người dùng (mặc định là chính user), Admin/Manager có thể tích cho user khác
 * @access Private
 */
router.post('/earn', auth, rewardController.earnPoints);
/**
 * @route POST /api/reward/redeem
 * @desc  Đổi điểm lấy ưu đãi (tạo UserCoupon)
 * @access Private
 */
router.post('/redeem', auth, rewardController.redeemPoints);

module.exports = router;
