const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware xác thực tùy chọn (optional authentication)
 * Cho phép Guest (không có token) hoặc Member (có token) truy cập
 * Nếu có token hợp lệ, set req.user, nếu không có thì req.user = null
 */
function optionalAuth(req, res, next) {
    const header = req.headers.authorization;
    
    if (!header) {
        req.user = null;
        return next();
    }

    const token = header.split(' ')[1];
    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
            return next();
        }
        req.user = user;
        next();
    });
}

module.exports = optionalAuth;

