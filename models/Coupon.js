const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        DiscountAmount: {
            type: Number,
            required: true,
            min: [0, 'DiscountAmount phải >= 0']
        },
        ExpirationDate: {
            type: Date,
            required: true,
            index: true
        },
        TimesUsed: {
            type: Number,
            default: 0,
            min: [0, 'TimesUsed phải >= 0'],
            index: true
        },
        Description: {
            type: String,
            trim: true
        },
        IsDeleted: {
            type: Boolean,
            default: false,
            index: true
        },
        CreatedAt: {
            type: Date,
            default: Date.now
        },
        UpdatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual: kiểm tra đã hết hạn chưa (vẫn để virtual để dễ sử dụng ở controller/view)
couponSchema.virtual('IsExpired').get(function () {
    return this.ExpirationDate ? new Date() > this.ExpirationDate : false;
});

const Coupon = mongoose.model('Coupon', couponSchema, 'coupons');

module.exports = Coupon;
