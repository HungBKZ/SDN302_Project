const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const chatService = require('../modules/chat/chat.service');
require('dotenv').config();

let io = null;
const userSocketMap = new Map(); // userId -> socket.id (or array if multiple sockets per user)

function init(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', async (socket) => {
        try {
            // Use auth token from handshake (client should send { auth: { token } })
            const token = socket.handshake.auth && socket.handshake.auth.token;
            if (!token) {
                // disconnect unauthenticated sockets
                socket.emit('error', 'Authentication token required');
                socket.disconnect(true);
                return;
            }

            let payload;
            try {
                // Accept token either as raw JWT or 'Bearer <token>'
                const raw = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
                payload = jwt.verify(raw, process.env.JWT_SECRET);
            } catch (err) {
                socket.emit('error', 'Invalid token');
                socket.disconnect(true);
                return;
            }

            const userId = payload._id;
            if (!userId) {
                socket.emit('error', 'Invalid token payload');
                socket.disconnect(true);
                return;
            }

            // store socket id for this user (support multiple sockets per user)
            const existing = userSocketMap.get(userId) || new Set();
            existing.add(socket.id);
            userSocketMap.set(userId, existing);

            // attach userId to socket for cleanup
            socket.data.userId = userId;

            // Inform client connected
            socket.emit('connected', { userId });

            // If client provided otherId in handshake, load conversation history and send
            const otherId = socket.handshake.auth && socket.handshake.auth.otherId;
            if (otherId) {
                try {
                    console.log(`[socket] user ${userId} requested history with ${otherId}`);
                    const history = await chatService.getConversation(userId, otherId, 500);
                    console.log(`[socket] sending history to ${userId}, count=${Array.isArray(history) ? history.length : 0}`);
                    // send history (server returns newest-first; client can reverse if needed)
                    socket.emit('history', history);
                } catch (e) {
                    console.error('[socket] history load error', e && e.message);
                    // ignore history load errors
                }
            }

            // Listen for private messages from client
            socket.on('private_message', async (payload, ack) => {
                try {
                    const { to, content } = payload || {};
                    if (!to || !content) {
                        if (typeof ack === 'function') ack({ success: false, message: 'to and content required' });
                        return;
                    }

                    // Save message via service
                    const saved = await chatService.sendMessage(userId, to, content);

                    // Emit to recipient sockets if connected
                    const targets = userSocketMap.get(String(to));
                    if (targets && targets.size > 0) {
                        for (const sid of targets) {
                            io.to(sid).emit('message', saved);
                        }
                    }

                    // Also emit to sender(s) to confirm/send back
                    const senderSockets = userSocketMap.get(String(userId));
                    if (senderSockets) {
                        for (const sid of senderSockets) {
                            io.to(sid).emit('message', saved);
                        }
                    }

                    if (typeof ack === 'function') ack({ success: true, data: saved });
                } catch (err) {
                    if (typeof ack === 'function') ack({ success: false, message: err.message });
                }
            });

            socket.on('disconnect', () => {
                const uid = socket.data.userId;
                if (uid) {
                    const set = userSocketMap.get(uid);
                    if (set) {
                        set.delete(socket.id);
                        if (set.size === 0) userSocketMap.delete(uid);
                        else userSocketMap.set(uid, set);
                    }
                }
            });
        } catch (e) {
            socket.emit('error', e.message);
            socket.disconnect(true);
        }
    });
}

function sendToUser(userId, event, payload) {
    if (!io) return false;
    const targets = userSocketMap.get(String(userId));
    if (!targets) return false;
    for (const sid of targets) {
        io.to(sid).emit(event, payload);
    }
    return true;
}

module.exports = { init, sendToUser };
