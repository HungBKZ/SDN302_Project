const accountService = require('./account.service');
const { Account } = require('../../models/Account');

/* ---------- Helper Functions (ĐÃ CHUYỂN RA NGOÀI CLASS) ---------- */

/**
 * helper: check admin/manager
 */
async function _checkManagerOrAdmin(req, res) {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return null;
    }
    // Phải dùng Account model trực tiếp
    const acc = await Account.findById(userId);
    if (!acc || !['Admin', 'Manager'].includes(acc.UserRole) || acc.IsDeleted) {
        res.status(403).json({ success: false, message: 'Forbidden: Admin or Manager only' });
        return null;
    }
    return acc;
}

/**
 * helper: check customer (self-delete)
 */
async function _checkCustomerSelf(req, res) {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return null;
    }
    const acc = await Account.findById(userId);
    if (!acc) {
        res.status(404).json({ success: false, message: 'Tài khoản không tồn tại' });
        return null;
    }
    if (acc.IsDeleted) {
        res.status(400).json({ success: false, message: 'Tài khoản đã bị xóa' });
        return null;
    }
    if (acc.UserRole !== 'Customer') {
        res.status(403).json({ success: false, message: 'Chỉ Customer mới được xóa tài khoản tự phục vụ' });
        return null;
    }
    return acc;
}

class AccountController {
    /**
     * POST /api/account/register
     * Đăng ký tài khoản Customer mới
     */
    async register(req, res, next) {
        try {
            const userData = req.body;
            const newAccount = await accountService.register(userData);

            return res.status(201).json({
                success: true,
                message: 'Đăng ký tài khoản thành công',
                data: newAccount
            });
        } catch (error) {
            if (error.message === 'Email đã được sử dụng' ||
                error.message === 'Mã người dùng đã được sử dụng' ||
                error.message === 'Số điện thoại đã được sử dụng') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * POST /api/account/login
     * Đăng nhập
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await accountService.login(email, password);

            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                data: result
            });
        } catch (error) {
            if (error.message === 'Email hoặc mật khẩu không đúng') {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * POST /api/account/logout
     * Đăng xuất (client sẽ xóa token)
     */
    async logout(req, res, next) {
        try {
            // Với JWT, logout chủ yếu xử lý ở client (xóa token)
            // Server có thể log hoặc thêm token vào blacklist nếu cần

            return res.status(200).json({
                success: true,
                message: 'Đăng xuất thành công'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/account/me
     * Lấy thông tin tài khoản hiện tại
     */
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.user._id;
            const user = await accountService.getCurrentUser(userId);

            return res.status(200).json({
                success: true,
                message: 'Lấy thông tin tài khoản thành công',
                data: user
            });
        } catch (error) {
            if (error.message === 'Tài khoản không tồn tại' ||
                error.message === 'Tài khoản đã bị xóa') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * PUT /api/account/profile
     * Cập nhật thông tin tài khoản
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user._id;
            const updateData = req.body;
            const updatedUser = await accountService.updateProfile(userId, updateData);

            return res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                data: updatedUser
            });
        } catch (error) {
            if (error.message === 'Tài khoản không tồn tại' ||
                error.message === 'Tài khoản đã bị xóa') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * PUT /api/account/change-password
     * Đổi mật khẩu
     */
    async changePassword(req, res, next) {
        try {
            const userId = req.user._id;
            const { oldPassword, newPassword } = req.body;

            await accountService.changePassword(userId, oldPassword, newPassword);

            return res.status(200).json({
                success: true,
                message: 'Đổi mật khẩu thành công'
            });
        } catch (error) {
            if (error.message === 'Tài khoản không tồn tại') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message === 'Mật khẩu cũ không đúng') {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * POST /api/account/google-login
     * Đăng nhập bằng Google
     */
    async googleLogin(req, res, next) {
        try {
            const { credential } = req.body;

            if (!credential) {
                return res.status(400).json({
                    success: false,
                    message: 'Thiếu Google credential'
                });
            }

            // Decode Google JWT token
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const googleProfile = JSON.parse(jsonPayload);

            // Xử lý đăng nhập
            const result = await accountService.loginWithGoogle(googleProfile);

            return res.status(200).json({
                success: true,
                message: 'Đăng nhập bằng Google thành công',
                data: result
            });
        } catch (error) {
            console.error('Google login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Đăng nhập Google thất bại'
            });
        }
    }

    /**
     * GET /api/account/profile
     * Lấy thông tin profile của user đang đăng nhập
     */
    async getProfile(req, res, next) {
        try {
            // req.user được set bởi auth middleware (_id từ JWT)
            const userId = req.user._id;
            const profile = await accountService.getProfileById(userId);

            return res.status(200).json({
                success: true,
                message: 'Lấy thông tin profile thành công',
                data: profile
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy tài khoản') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
    /* ---------- New features - Nhu (ĐÃ TÁI CẤU TRÚC) ---------- */

    /**
     * DELETE /api/account/me
     * Self soft-delete (Customer only)
     */
    async selfDelete(req, res, next) {
        try {
            // ⚡ Sửa lỗi: Gọi hàm helper bên ngoài (không dùng 'this')
            const acc = await _checkCustomerSelf(req, res);
            if (!acc) return;

            await accountService.selfDelete(acc._id);
            return res.status(200).json({ success: true, message: 'Tài khoản đã bị vô hiệu hóa' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/account/profile
     * Cập nhật thông tin profile
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user._id;
            const updateData = req.body;
            
            const updatedProfile = await accountService.updateProfile(userId, updateData);

            return res.status(200).json({
                success: true,
                message: 'Cập nhật profile thành công',
                data: updatedProfile
            });
        } catch (error) {
            if (error.message === 'Không tìm thấy tài khoản' ||
                error.message === 'Số điện thoại đã được sử dụng') {
                return res.status(400).json({
     * POST /api/account/staff
     * Create staff account (Manager or Admin)
     */
    async createStaffAccount(req, res, next) {
        try {
            // ⚡ Sửa lỗi: Gọi hàm helper bên ngoài (không dùng 'this')
            const admin = await _checkManagerOrAdmin(req, res);
            if (!admin) return;

            const newStaffAccount = await accountService.createStaffAccount(req.body);

            return res.status(201).json({
                success: true,
                message: 'Tạo tài khoản nhân viên thành công',
                data: newStaffAccount
            });
        } catch (error) {
            // Xử lý lỗi trùng lặp từ service
            if (error.message === 'Email đã được sử dụng' ||
                error.message === 'Mã người dùng đã được sử dụng' ||
                error.message === 'Số điện thoại đã được sử dụng') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * GET /api/account/list
     * List accounts (Admin/Manager)
     */
    async listAccounts(req, res, next) {
        try {
            // ⚡ Sửa lỗi: Gọi hàm helper bên ngoài (không dùng 'this')
            const admin = await _checkManagerOrAdmin(req, res);
            if (!admin) return;

            const accounts = await accountService.listAccounts();
            return res.status(200).json({ success: true, data: accounts });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/account/:id
     * Get account details (Admin/Manager)
     */
    async getAccountDetails(req, res, next) {
        try {
            // ⚡ Sửa lỗi: Gọi hàm helper bên ngoài (không dùng 'this')
            const admin = await _checkManagerOrAdmin(req, res);
            if (!admin) return;

            const { id } = req.params;
            const acc = await accountService.getAccountDetails(id);

            return res.status(200).json({ success: true, data: acc });
            _
        } catch (error) {
            if (error.message === 'Tài khoản không tồn tại') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * DELETE /api/account/:id
     * Soft delete account (Admin/Manager)
     */
    async softDeleteAccount(req, res, next) {
        try {
            // ⚡ Sửa lỗi: Gọi hàm helper bên ngoài (không dùng 'this')
            const admin = await _checkManagerOrAdmin(req, res);
            if (!admin) return;

            const { id } = req.params;

            // Không cho admin tự xóa mình bằng API này
            if (admin._id.toString() === id) {
                return res.status(400).json({ success: false, message: 'Không thể tự xóa tài khoản của mình.' });
            }

            await accountService.softDeleteAccount(id);
            return res.status(200).json({ success: true, message: 'Tài khoản đã được vô hiệu hóa' });
        } catch (error) {
            if (error.message === 'Tài khoản không tồn tại hoặc đã bị xóa') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}

module.exports = new AccountController();