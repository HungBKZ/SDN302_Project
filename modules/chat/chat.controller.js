const chatService = require('./chat.service');

class ChatController {
    /**
     * GET /api/chat/messages/sent
     * Trả về danh sách tin nhắn mà user hiện tại đã gửi
     */
    async getSentMessages(req, res, next) {
        try {
            const userId = req.user._id;
            const { limit } = req.query;

            const messages = await chatService.getSentMessages(userId, limit);

            return res.status(200).json({
                success: true,
                message: 'Lấy tin nhắn đã gửi thành công',
                data: messages,
                count: messages.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/chat/conversation/:otherId
     * Lấy hội thoại giữa user hiện tại và user khác
     */
    async getConversation(req, res, next) {
        try {
            const userId = req.user._id;
            const { otherId } = req.params;
            const { limit } = req.query;

            if (!userId) {
                return res.status(400).json({ success: false, message: 'You must to logging' });
            }

            if (!otherId) {
                return res.status(400).json({ success: false, message: 'otherId is required' });
            }

            const messages = await chatService.getConversation(userId, otherId, limit);

            return res.status(200).json({
                success: true,
                message: 'Lấy hội thoại thành công',
                data: messages,
                count: messages.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/chat/send
     * Gửi tin nhắn từ user hiện tại tới một user khác
     */
    async sendMessage(req, res, next) {
        try {
            const userId = req.user._id;
            const { receiverId, content } = req.body;

            if (!userId) {
                return res.status(400).json({ success: false, message: 'You must be logged in' });
            }

            const message = await chatService.sendMessage(userId, receiverId, content);

            // Emit via socket if possible (optional - loaders/socket exposes sendToUser)
            try {
                const socketLoader = require('../../loaders/socket');
                const rid = (message.ReceiverId && message.ReceiverId._id) ? String(message.ReceiverId._id) : String(message.ReceiverId);
                socketLoader.sendToUser(rid, 'message', message);
            } catch (e) {
                // ignore if socket loader not available
            }

            return res.status(201).json({
                success: true,
                message: 'Gửi tin nhắn thành công',
                data: message
            });
        } catch (error) {
            if (error.message === 'Receiver not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            if (error.message === 'Content is required' || error.message === 'ReceiverId is required') {
                return res.status(400).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * PATCH /api/chat/conversation/:otherId/read
     * Đánh dấu tất cả tin nhắn từ otherId -> user là đã đọc
     */
    async markConversationRead(req, res, next) {
        try {
            const userId = req.user._id;
            const { otherId } = req.params;

            if (!userId) {
                return res.status(400).json({ success: false, message: 'You must be logged in' });
            }

            if (!otherId) {
                return res.status(400).json({ success: false, message: 'otherId is required' });
            }

            const result = await chatService.markConversationRead(userId, otherId);

            return res.status(200).json({
                success: true,
                message: 'Đã đánh dấu là đã xem',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChatController();
