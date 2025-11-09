const mongoose = require('mongoose');

/**
 * Notification model (Mongoose)
 * Dựa trên JSON mẫu:
 * {
 *   _id: ObjectId("6e6f74660000000100000000"),
 *   UserId: ObjectId("414d30303100000000000000"),
 *   NotificationContent: "Monthly sales report for April 2025 is ready for review",
 *   UserRole: "Admin",
 *   UserName: "Nguyen Van An",
 *   CreatorId: ObjectId("414d30303100000000000000")
 * }
 *
 * Ghi chú:
 * - UserId: người nhận thông báo.
 * - CreatorId: người tạo ra thông báo (có thể trùng UserId).
 * - UserRole/UserName lưu snapshot tại thời điểm tạo để tránh hiển thị sai nếu role/name thay đổi sau này.
 * - Có thể bổ sung các trường như ReadAt, IsRead, Type, Priority… nếu cần mở rộng.
 */

const notificationSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },
        NotificationContent: {
            type: String,
            required: true,
            trim: true
        },
        UserRole: {
            type: String,
            trim: true,
            index: true
        },
        UserName: {
            type: String,
            trim: true
        },
        CreatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },
        // Trạng thái đọc (0: chưa đọc, 1: đã đọc) giữ kiểu Number để thống nhất với cách bạn dùng 0/1
        IsRead: {
            type: Number,
            default: 0,
            // validate: {
            //     validator: (v) => v === 0 || v === 1,
            //     message: 'IsRead chỉ nhận 0 hoặc 1'
            // },
            index: true
        },
    }
);

// // Index kết hợp để truy vấn nhanh thông báo chưa đọc của user
// notificationSchema.index({ UserId: 1, IsRead: 1, CreatedAt: -1 });

// /**
//  * Instance: đánh dấu đã đọc
//  */
// notificationSchema.methods.markRead = async function () {
//     if (this.IsRead === 0) {
//         this.IsRead = 1;
//         this.ReadAt = new Date();
//         await this.save();
//     }
//     return this;
// };

// /**
//  * Static: lấy danh sách chưa đọc của một user
//  */
// notificationSchema.statics.findUnreadByUser = function (userId, limit = 50) {
//     return this.find({ UserId: userId, IsRead: 0 }).sort({ CreatedAt: -1 }).limit(limit);
// };

// /**
//  * Static: tạo thông báo mới
//  */
// notificationSchema.statics.createNotification = async function ({
//     userId,
//     content,
//     userRole,
//     userName,
//     creatorId
// }) {
//     return this.create({
//         UserId: userId,
//         NotificationContent: content,
//         UserRole: userRole,
//         UserName: userName,
//         CreatorId: creatorId
//     });
// };

const Notification = mongoose.model('Notification', notificationSchema, 'notifications');

module.exports = Notification;