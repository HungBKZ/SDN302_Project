const Message = require('../../models/Message');
const { Account } = require('../../models/Account');

class ChatService {
    /**
     * Lấy tin nhắn do user gửi (SenderId = userId)
     * @param {String} userId
     * @param {Number} limit
     */
    async getSentMessages(userId, limit = 100) {
        const l = Math.min(Math.max(parseInt(limit) || 100, 1), 1000);
        return Message.find({ SenderId: userId })
            .sort({ SentAt: -1 })
            .limit(l)
            .populate('ReceiverId', 'Name UserEmail UserImage UserRole');
    }

    /**
     * Gửi tin nhắn từ userId tới receiverId
     * @param {String} userId
     * @param {String} receiverId
     * @param {String} content
     */
    async sendMessage(userId, receiverId, content) {
        if (!receiverId) {
            throw new Error('ReceiverId is required');
        }
        if (!content || String(content).trim() === '') {
            throw new Error('Content is required');
        }

        // Kiểm tra receiver tồn tại
        const receiver = await Account.findById(receiverId);
        if (!receiver || receiver.IsDeleted) {
            throw new Error('Receiver not found');
        }

        const msg = new Message({
            SenderId: userId,
            ReceiverId: receiverId,
            Content: String(content).trim(),
            SentAt: new Date(),
            IsRead: false
        });

        const saved = await msg.save();

        // Populate sender/receiver for response
        await saved.populate('SenderId', 'Name UserEmail UserImage');
        await saved.populate('ReceiverId', 'Name UserEmail UserImage');

        return saved;
    }

    /**
     * Đánh dấu hội thoại (tất cả messages từ otherId -> userId) là đã đọc
     * @param {String} userId
     * @param {String} otherId
     * @returns {Object} { modifiedCount }
     */
    async markConversationRead(userId, otherId) {
        if (!otherId) {
            throw new Error('otherId is required');
        }

        const now = new Date();
        const res = await Message.updateMany(
            { SenderId: otherId, ReceiverId: userId, IsRead: false },
            { $set: { IsRead: true, ReadAt: now } }
        );

        // res may contain modifiedCount (modern mongoose) or nModified (older)
        const modified = res.modifiedCount !== undefined ? res.modifiedCount : (res.nModified || 0);
        return { modifiedCount: modified };
    }

    /**
     * Lấy hội thoại giữa user và anotherUser (hai chiều)
     * @param {String} userId
     * @param {String} otherId
     * @param {Number} limit
     */
    async getConversation(userId, otherId, limit = 200) {
        const l = Math.min(Math.max(parseInt(limit) || 200, 1), 2000);
        return Message.find({
            $or: [
                { SenderId: userId, ReceiverId: otherId },
                { SenderId: otherId, ReceiverId: userId }
            ]
        })
            .sort({ SentAt: -1 })
            .limit(l)
            .populate('SenderId', 'Name UserEmail UserImage')
            .populate('ReceiverId', 'Name UserEmail UserImage');
    }
}

module.exports = new ChatService();
