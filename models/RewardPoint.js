const mongoose = require('mongoose');

/**
 * RewardPoint model (Mongoose)
 * JSON mẫu bạn cung cấp:
 * {
 *   _id: ObjectId("523031310000000000000000"),
 *   UserId: ObjectId("555330303300000000000000"),
 *   Points: 150
 * }
 *
 * Thiết kế:
 * - Mỗi UserId có tối đa 1 record (unique) để quản lý điểm thưởng.
 * - Points >= 0.
 * - Cung cấp các helper statics để cộng / trừ điểm an toàn.
 */

const rewardPointSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },
        Points: {
            type: Number,
            required: true,
            // min: [0, 'Points phải >= 0'],
            default: 0
        },
        // CreatedAt: {
        //     type: Date,
        //     default: Date.now
        // },
        // UpdatedAt: {
        //     type: Date,
        //     default: Date.now
        // }
    }
);

// // Đảm bảo 1 user chỉ có một ví điểm
// rewardPointSchema.index({ UserId: 1 }, { unique: true });

// /**
//  * Static: khởi tạo ví điểm cho user nếu chưa có
//  */
// rewardPointSchema.statics.ensureWallet = async function (userId) {
//     let doc = await this.findOne({ UserId: userId });
//     if (!doc) {
//         doc = await this.create({ UserId: userId, Points: 0 });
//     }
//     return doc;
// };

// /**
//  * Static: cộng điểm (atomic)
//  * amount > 0
//  */
// rewardPointSchema.statics.addPoints = async function (userId, amount) {
//     if (amount <= 0) throw new Error('amount phải > 0');
//     return this.findOneAndUpdate(
//         { UserId: userId },
//         { $inc: { Points: amount } },
//         { new: true, upsert: true, runValidators: true }
//     );
// };

// /**
//  * Static: trừ điểm (redeem) – đảm bảo không âm
//  * amount > 0
//  */
// rewardPointSchema.statics.redeemPoints = async function (userId, amount) {
//     if (amount <= 0) throw new Error('amount phải > 0');
//     const updated = await this.findOneAndUpdate(
//         { UserId: userId, Points: { $gte: amount } },
//         { $inc: { Points: -amount } },
//         { new: true }
//     );
//     if (!updated) {
//         throw new Error('Không đủ điểm để trừ');
//     }
//     return updated;
// };

// /**
//  * Static: lấy số điểm hiện tại
//  */
// rewardPointSchema.statics.getBalance = async function (userId) {
//     const doc = await this.findOne({ UserId: userId });
//     return doc ? doc.Points : 0;
// };

// /**
//  * Middleware: cập nhật UpdatedAt trước save
//  */
// rewardPointSchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

const RewardPoint = mongoose.model('RewardPoint', rewardPointSchema, 'reward_points');

module.exports = RewardPoint;