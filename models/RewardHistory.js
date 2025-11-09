const mongoose = require('mongoose');

/**
 * RewardHistory model (Mongoose)
 * JSON mẫu:
 * {
 *   _id: ObjectId("524830303600000000000000"),
 *   UserId: ObjectId("555330303300000000000000"),
 *   PointsChange: -15,
 *   Action: "Redeemed points for order OR005",
 *   CreatedAt: 2025-11-08T14:40:00.000Z
 * }
 *
 * Ghi chú:
 * - PointsChange có thể âm (trừ điểm) hoặc dương (cộng điểm). Nên là số nguyên.
 * - Action mô tả ngắn gọn hành động/nguồn phát sinh điểm.
 */

const rewardHistorySchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },
        PointsChange: {
            type: Number,
            required: true,
        },
        Action: {
            type: String,
            required: true,
            trim: true,
        },
        CreatedAt: {
            type: Date,
            default: Date.now
        }
    }
);

// // Truy vấn lịch sử theo user, mới nhất trước
// rewardHistorySchema.index({ UserId: 1, CreatedAt: -1 });

// /**
//  * Static: ghi log thay đổi điểm
//  * - createdAtOptional: nếu truyền, sẽ dùng làm CreatedAt (ví dụ import dữ liệu cũ)
//  */
// rewardHistorySchema.statics.logChange = function ({
//     userId,
//     pointsChange,
//     action,
//     createdAt: createdAtOptional
// }) {
//     const doc = {
//         UserId: userId,
//         PointsChange: pointsChange,
//         Action: action
//     };
//     if (createdAtOptional) doc.CreatedAt = createdAtOptional;
//     return this.create(doc);
// };

// /**
//  * Static: danh sách lịch sử theo user
//  */
// rewardHistorySchema.statics.listByUser = function (userId, limit = 100) {
//     return this.find({ UserId: userId })
//         .sort({ CreatedAt: -1 })
//         .limit(limit);
// };

// rewardHistorySchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

const RewardHistory = mongoose.model('RewardHistory', rewardHistorySchema, 'reward_histories');

module.exports = RewardHistory;