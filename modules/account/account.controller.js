const accountService = require('./account.service');

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
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
}

module.exports = new AccountController();
