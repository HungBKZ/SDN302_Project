const rewardService = require('./reward.service');
const accountService = require('../account/account.service');

/**
 * GET /api/reward/history
 * Query params: page, limit
 * Auth: required (req.user)
 */
exports.getHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const page = parseInt(req.query.page, 10) || 1;
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

        const result = await rewardService.listHistory(userId, { page, limit });
        console.log('Reward history fetched for user:', userId);

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('Error in getHistory:', err);
        return res.status(500).json({ success: false, message: 'Error fetching reward history', error: err.message });
    }
};


/**
 * POST /api/reward/earn
 * Body: { points: Number, action?: String, userId?: String }
 * - If userId is provided and different from the authenticated user, only Admin/Manager can credit others.
 */
exports.earnPoints = async (req, res) => {
    try {
        const targetUserId = req.user?.id || req.user?._id;
        if (!targetUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { points, action } = req.body;

        // Validate actor exists
        if (await accountService.isUserExist(targetUserId) == null) {
            return res.status(400).json({
                success: false,
                message: 'User does not exist.'
            });
        }

        const result = await rewardService.addPoints(targetUserId, points, action || 'Tích điểm', { targetUserId });

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('Error in earnPoints:', err);
        return res.status(400).json({ success: false, message: err.message });
    }
};


/**
 * POST /api/reward/redeem
 * Body: { points: Number, action?: String, expirationDays?: Number, description?: String, userId?: String }
 * - By default redeem for authenticated user; if userId provided and different, only Admin/Manager/Staff can redeem for others.
 */
exports.redeemPoints = async (req, res) => {
    try {
        const targetUserId = req.user?.id || req.user?._id;
        if (!targetUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const { points, action, description } = req.body;

        // Validate actor exists
        if (await accountService.isUserExist(targetUserId) == null) {
            return res.status(400).json({ success: false, message: 'User does not exist.' });
        }

        const result = await rewardService.redeemPoints(targetUserId, points, { action, description });

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error('Error in redeemPoints:', err);
        const status = err.message === 'Insufficient points' ? 400 : 400;
        return res.status(status).json({ success: false, message: err.message });
    }
};


