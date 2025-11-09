const mongoose = require('mongoose');

const userCouponSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true,
        },
        // Discount amount in the currency unit (copied from Coupon or computed from points)
        DiscountAmount: {
            type: Number,
            required: true,
        },
        Description: {
            type: String,
            trim: true,
        },
        Code: {
            type: String,
            required: true,
            unique: true, // nếu áp dụng mã một lần/duy nhất
            trim: true,
        },
        Status: {
            type: String,
            enum: ['unused', 'used', 'expired', 'canceled'],
            default: 'unused',
            index: true,
        },
        IssuedAt: {
            type: Date,
            default: Date.now,
        },
        ExpiresAt: {
            type: Date, // thường copy từ Coupon.ExpirationDate tại thời điểm cấp
            required: true,
            index: true,
        },
        UsedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

userCouponSchema.index({ UserId: 1, Status: 1, ExpiresAt: 1 });

const UserCoupon = mongoose.model('UserCoupon', userCouponSchema, 'user_coupons');
module.exports = UserCoupon;