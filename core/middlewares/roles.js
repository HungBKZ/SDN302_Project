const { ACCOUNT_ROLES } = require('../../models/Account');

/**
 * Middleware kiểm tra role của user
 * @param  {...string} allowedRoles - Các role được phép truy cập
 * @returns {Function} Middleware function
 */
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized - Vui lòng đăng nhập'
            });
        }

        const userRole = req.user.UserRole;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Forbidden - Chỉ ${allowedRoles.join(', ')} mới có quyền truy cập`
            });
        }

        next();
    };
};

/**
 * Middleware kiểm tra có phải Admin không
 */
const isAdmin = checkRole('Admin');

/**
 * Middleware kiểm tra có phải Manager không
 */
const isManager = checkRole('Manager');

/**
 * Middleware kiểm tra có phải Admin hoặc Manager không
 */
const isAdminOrManager = checkRole('Admin', 'Manager');

module.exports = {
    checkRole,
    isAdmin,
    isManager,
    isAdminOrManager,
    ACCOUNT_ROLES
};
