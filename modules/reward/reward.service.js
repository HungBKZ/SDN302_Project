const RewardHistory = require('../../models/RewardHistory');
const RewardPoint = require('../../models/RewardPoint');
const UserCoupon = require('../../models/UserCoupon');

// Reward conversion configuration (kept in-code per request)
const REWARD_POINT_VALUE = 100; // base currency units per point
const BULK_THRESHOLD = 100; // points threshold to consider "bulk" redemption
const BULK_MULTIPLIER = 1.2; // 20% more discount value for bulk redemptions
const BULK_EXTRA_EXPIRE_DAYS = 7; // extra days of expiry for bulk redemptions
const DEFAULT_EXPIRE_DAYS = 7; // default expiry when not provided

/**
 * List reward history for a user with pagination
 * @param {String|ObjectId} userId
 * @param {Object} options
 * @param {Number} options.page
 * @param {Number} options.limit
 * @returns {Object} { items, total, page, limit, totalPages }
 */
exports.listHistory = async function (userId, options = {}) {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.max(1, parseInt(options.limit, 10) || 20);

    const filter = { UserId: userId };

    const [total, items] = await Promise.all([
        RewardHistory.countDocuments(filter),
        RewardHistory.find(filter)
            .sort({ CreatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
        items,
        total,
        page,
        limit,
        totalPages
    };
};


/**
 * Add points to a user's reward wallet and log history.
 * @param {String|ObjectId} targetUserId
 * @param {Number} points - positive integer to add
 * @param {String} action - description for history
 * @param {Object} meta - optional meta like { actorId }
 * @returns {Object} { balance, history }
 */
exports.addPoints = async function (targetUserId, points, action = 'Tích điểm', meta = {}) {
    if (!targetUserId) throw new Error('targetUserId required');
    points = parseInt(points, 10);
    if (!points || points <= 0) throw new Error('points must be a positive integer');

    // Atomic upsert increment balance
    const updated = await RewardPoint.findOneAndUpdate(
        { UserId: targetUserId },
        { $inc: { Points: points } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    // Create history entry
    const historyDoc = await RewardHistory.create({
        UserId: targetUserId,
        PointsChange: points,
        Action: action + (meta && meta.actorId ? ` (by ${meta.actorId})` : '')
    });

    return {
        balance: updated.Points,
        history: historyDoc
    };
};


/**
 * Redeem points from a user's wallet to create a coupon (user-specific).
 * - Deducts points atomically (ensures not negative)
 * - Creates a RewardHistory entry with negative PointsChange
 * - Creates a Coupon document (system) representing the discount and then issues a UserCoupon linked to it
 * @param {String|ObjectId} userId
 * @param {Number} points - positive integer to redeem
 * @param {Object} options - { action?: String, expirationDays?: Number, description?: String }
 * @returns {Object} { balance, history, coupon, userCoupon }
 */
exports.redeemPoints = async function (userId, points, options = {}) {
    if (!userId) throw new Error('userId required');
    points = parseInt(points, 10);
    if (!points || points <= 0) throw new Error('points must be a positive integer');

    // Atomically decrement points only if enough balance
    const updated = await RewardPoint.findOneAndUpdate(
        { UserId: userId, Points: { $gte: points } },
        { $inc: { Points: -points } },
        { new: true }
    ).lean();

    if (!updated) {
        throw new Error('Insufficient points');
    }

    // Compute discount amount directly from points (no system Coupon created)
    const basePointValue = REWARD_POINT_VALUE; // use in-file constant
    let discountAmount = points * basePointValue;
    // expiration days: prefer options.expirationDays, otherwise default
    let expireDays = DEFAULT_EXPIRE_DAYS;

    // Bulk redemption rules: better rate and longer expiry when redeeming above threshold
    let actionText = options.action || 'Đổi điểm lấy ưu đãi';
    if (points > BULK_THRESHOLD) {
        discountAmount = Math.floor(points * basePointValue * BULK_MULTIPLIER);
        expireDays = expireDays + BULK_EXTRA_EXPIRE_DAYS;
        actionText = actionText + ' (Quy mô lớn - có ưu đãi)';
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expireDays);

    // Log history (negative change)
    const historyDoc = await RewardHistory.create({
        UserId: userId,
        PointsChange: -points,
        Action: actionText
    });

    // Generate a unique code for the UserCoupon
    const generateCode = () => {
        const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
        return `UC-${Date.now().toString().slice(-6)}-${rnd}`;
    };

    let userCoupon;
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = generateCode();
        try {
            userCoupon = await UserCoupon.create({
                UserId: userId,
                // no CouponId, embed discount directly
                DiscountAmount: discountAmount,
                Description: options.description || `Coupon đổi từ ${points} điểm${points > BULK_THRESHOLD ? ' (bonus)' : ''}`,
                Code: code,
                Status: 'unused',
                IssuedAt: new Date(),
                ExpiresAt: expirationDate
            });
            break;
        } catch (err) {
            if (err && err.code === 11000) {
                // duplicate code, retry
                if (attempt === maxAttempts - 1) throw new Error('Failed to generate unique coupon code');
                continue;
            }
            throw err;
        }
    }

    return {
        balance: updated.Points,
        history: historyDoc,
        userCoupon
    };
};


