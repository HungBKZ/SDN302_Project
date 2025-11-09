const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const auth = require('../../core/middlewares/auth');

/**
 * @route GET /api/chat/messages/sent
 * @desc  Lấy tin nhắn mà user hiện tại đã gửi
 * @access Private
 */
router.get('/messages/sent', auth, chatController.getSentMessages);

/**
 * @route GET /api/chat/conversation/:otherId
 * @desc  Lấy hội thoại giữa user hiện tại và user khác
 * @access Private
 */
router.get('/conversation/:otherId', auth, chatController.getConversation);

/**
 * @route POST /api/chat/send
 * @desc  Gửi tin nhắn (body: receiverId, content)
 * @access Private
 */
router.post('/send', auth, chatController.sendMessage);

/**
 * @route PATCH /api/chat/conversation/:otherId/read
 * @desc  Đánh dấu tất cả tin nhắn từ otherId -> current user là đã xem
 * @access Private
 */
router.patch('/conversation/:otherId/read', auth, chatController.markConversationRead);

module.exports = router;
