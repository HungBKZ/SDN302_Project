const mongoose = require('mongoose');

/**
 * Message model (updated: IsRead chuyển sang Boolean)
 * JSON mẫu:
 * {
 *   _id: ObjectId("4d3030380000000000000000"),
 *   SenderId: ObjectId("575430303100000000000000"),
 *   ReceiverId: ObjectId("414d30303100000000000000"),
 *   Content: "Your reservation has been cancelled.",
 *   SentAt: 2025-11-08T12:21:00.000Z,
 *   IsRead: false
 * }
 */

const messageSchema = new mongoose.Schema(
    {
        SenderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },
        ReceiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },
        Content: {
            type: String,
            required: true,
            trim: true
        },
        SentAt: {
            type: Date,
            required: true,
            default: Date.now,
            index: true
        },
        // ĐÃ ĐỔI: Boolean thay vì Number
        IsRead: {
            type: Boolean,
            default: false,
            index: true
        },
        ReadAt: {
            type: Date,
            default: null,
            index: true
        },
        // // Giữ soft delete như cũ (có thể đổi sang Boolean nếu muốn nhất quán)
        // IsDeleted: {
        //     type: Number,
        //     default: 0,
        //     validate: {
        //         validator: (v) => v === 0 || v === 1,
        //         message: 'IsDeleted chỉ nhận 0 hoặc 1'
        //     },
        //     index: true
        // },
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

// // Index hội thoại
// messageSchema.index({ SenderId: 1, ReceiverId: 1, SentAt: -1 });

// /**
//  * Instance: đánh dấu đã đọc
//  */
// messageSchema.methods.markRead = async function () {
//     if (!this.IsRead) {
//         this.IsRead = true;
//         this.ReadAt = new Date();
//         await this.save();
//     }
//     return this;
// };

// /**
//  * Static: lấy hội thoại (song phương) giới hạn
//  */
// messageSchema.statics.getConversation = function (aId, bId, limit = 100) {
//     return this.find({
//         $or: [
//             { SenderId: aId, ReceiverId: bId },
//             { SenderId: bId, ReceiverId: aId }
//         ],
//         IsDeleted: 0
//     })
//         .sort({ SentAt: -1 })
//         .limit(limit);
// };

// /**
//  * Static: lấy tin chưa đọc của một user
//  */
// messageSchema.statics.findUnreadByUser = function (userId, limit = 50) {
//     return this.find({ ReceiverId: userId, IsRead: false, IsDeleted: 0 })
//         .sort({ SentAt: -1 })
//         .limit(limit);
// };

// messageSchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

const Message = mongoose.model('Message', messageSchema, 'messages');

module.exports = Message;