const mongoose = require('mongoose');

/**
 * Coupon model (đã đổi tên từ Copun thành Coupon)
 * Fields:
 * - DiscountAmount: số tiền giảm (>= 0)
 * - ExpirationDate: ngày hết hạn
 * - TimesUsed: số lần đã sử dụng
 * - Description: mô tả coupon
 * Virtual:
 * - IsExpired: kiểm tra hết hạn
 * Statics:
 * - findNotExpired(): lấy coupon còn hiệu lực
 * - incrementTimesUsed(id, inc): tăng TimesUsed (atomic)
 */

const couponSchema = new mongoose.Schema(
    {
        DiscountAmount: {
            type: Number,
            required: true,
            // min: [0, 'DiscountAmount phải >= 0']
        },
        ExpirationDate: {
            type: Date,
            required: true,
            index: true
        },
        TimesUsed: {
            type: Number,
            default: 0,
            // min: [0, 'TimesUsed phải >= 0'],
            index: true
        },
        Description: {
            type: String,
            trim: true,
            // default: ''
        },
        CreatedAt: {
            type: Date,
            default: Date.now
        },
        UpdatedAt: {
            type: Date,
            default: Date.now
        }
    }
);

// // Virtual: kiểm tra đã hết hạn chưa
// couponSchema.virtual('IsExpired').get(function () {
//     return this.ExpirationDate ? new Date() > this.ExpirationDate : false;
// });

// // Static: tìm coupon chưa hết hạn
// couponSchema.statics.findNotExpired = function () {
//     return this.find({ ExpirationDate: { $gte: new Date() } });
// };

// // Static: tăng số lần sử dụng (atomic)
// couponSchema.statics.incrementTimesUsed = function (id, inc = 1) {
//     if (inc === 0) return this.findById(id);
//     return this.findByIdAndUpdate(
//         id,
//         { $inc: { TimesUsed: inc } },
//         { new: true, runValidators: true }
//     );
// };

const Coupon = mongoose.model('Coupon', couponSchema, 'coupons');

module.exports = Coupon;