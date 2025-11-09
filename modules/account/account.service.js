const { Account, ACCOUNT_ROLES } = require('../../models/Account');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AccountService {
    /**
     * Đăng ký tài khoản Customer mới
     * @param {Object} userData - Thông tin người dùng
     * @returns {Promise<Object>} Tài khoản vừa tạo
     */
    async register(userData) {
        // Kiểm tra email đã tồn tại
        const existingEmail = await Account.findOne({ 
            UserEmail: userData.UserEmail.toLowerCase() 
        });
        if (existingEmail) {
            throw new Error('Email đã được sử dụng');
        }

        // Kiểm tra UserCode đã tồn tại
        const existingUserCode = await Account.findOne({ 
            UserCode: userData.UserCode 
        });
        if (existingUserCode) {
            throw new Error('Mã người dùng đã được sử dụng');
        }

        // Kiểm tra số điện thoại đã tồn tại
        const existingPhone = await Account.findOne({ 
            UserPhone: userData.UserPhone 
        });
        if (existingPhone) {
            throw new Error('Số điện thoại đã được sử dụng');
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.UserPassword, salt);

        // Tạo tài khoản mới với role Customer
        const newAccount = new Account({
            UserCode: userData.UserCode,
            UserEmail: userData.UserEmail.toLowerCase(),
            UserPhone: userData.UserPhone,
            UserPassword: hashedPassword,
            Name: userData.Name,
            UserRole: ACCOUNT_ROLES[5], // 'Customer' - Luôn là Customer khi đăng ký
            IdentityCard: userData.IdentityCard,
            UserAddress: userData.UserAddress || '',
            UserImage: userData.UserImage || 'default-avatar.jpg',
            IsDeleted: false,
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        });

        await newAccount.save();

        // Không trả về password
        const accountData = newAccount.toObject();
        delete accountData.UserPassword;
        delete accountData.IdentityCard;

        return accountData;
    }

    /**
     * Đăng nhập
     * @param {String} email - Email đăng nhập
     * @param {String} password - Mật khẩu
     * @returns {Promise<Object>} Token và thông tin user
     */
    async login(email, password) {
        // Tìm tài khoản theo email
        const account = await Account.findOne({ 
            UserEmail: email.toLowerCase(),
            IsDeleted: false 
        });

        if (!account) {
            throw new Error('Email hoặc mật khẩu không đúng');
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, account.UserPassword);
        if (!isPasswordValid) {
            throw new Error('Email hoặc mật khẩu không đúng');
        }

        // Tạo JWT token
        const token = jwt.sign(
            {
                _id: account._id,
                UserCode: account.UserCode,
                UserEmail: account.UserEmail,
                UserRole: account.UserRole,
                Name: account.Name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token hết hạn sau 7 ngày
        );

        // Trả về token và thông tin user (không có password)
        const userData = account.toObject();
        delete userData.UserPassword;
        delete userData.IdentityCard;

        return {
            token,
            user: userData
        };
    }

    /**
     * Lấy thông tin tài khoản hiện tại
     * @param {String} userId - ID của user
     * @returns {Promise<Object>} Thông tin user
     */
    async getCurrentUser(userId) {
        const account = await Account.findById(userId).select('-UserPassword -IdentityCard');
        
        if (!account) {
            throw new Error('Tài khoản không tồn tại');
        }

        if (account.IsDeleted) {
            throw new Error('Tài khoản đã bị xóa');
        }

        return account;
    }

    /**
     * Cập nhật thông tin tài khoản
     * @param {String} userId - ID của user
     * @param {Object} updateData - Dữ liệu cập nhật
     * @returns {Promise<Object>} Thông tin user đã cập nhật
     */
    async updateProfile(userId, updateData) {
        const account = await Account.findById(userId);
        
        if (!account) {
            throw new Error('Tài khoản không tồn tại');
        }

        if (account.IsDeleted) {
            throw new Error('Tài khoản đã bị xóa');
        }

        // Các field được phép cập nhật
        const allowedUpdates = ['Name', 'UserPhone', 'UserAddress', 'UserImage'];
        
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                account[field] = updateData[field];
            }
        });

        account.UpdatedAt = new Date();
        await account.save();

        // Không trả về password
        const userData = account.toObject();
        delete userData.UserPassword;
        delete userData.IdentityCard;

        return userData;
    }

    /**
     * Đổi mật khẩu
     * @param {String} userId - ID của user
     * @param {String} oldPassword - Mật khẩu cũ
     * @param {String} newPassword - Mật khẩu mới
     * @returns {Promise<Boolean>} Thành công hay không
     */
    async changePassword(userId, oldPassword, newPassword) {
        const account = await Account.findById(userId);
        
        if (!account) {
            throw new Error('Tài khoản không tồn tại');
        }

        // Kiểm tra mật khẩu cũ
        const isPasswordValid = await bcrypt.compare(oldPassword, account.UserPassword);
        if (!isPasswordValid) {
            throw new Error('Mật khẩu cũ không đúng');
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        account.UserPassword = hashedPassword;
        account.UpdatedAt = new Date();
        await account.save();

        return true;
    }

    /**
     * Đăng nhập hoặc tạo tài khoản bằng Google
     * @param {Object} googleProfile - Thông tin từ Google
     * @returns {Promise<Object>} Token và thông tin user
     */
    async loginWithGoogle(googleProfile) {
        const { sub: googleId, email, name, picture } = googleProfile;

        // Tìm tài khoản theo GoogleId
        let account = await Account.findOne({ 
            GoogleId: googleId,
            IsDeleted: false 
        });

        // Nếu chưa có, tìm theo email
        if (!account) {
            account = await Account.findOne({ 
                UserEmail: email.toLowerCase(),
                IsDeleted: false 
            });
        }

        // Nếu tìm thấy theo email, cập nhật GoogleId
        if (account && !account.GoogleId) {
            account.GoogleId = googleId;
            if (picture && picture !== account.UserImage) {
                account.UserImage = picture;
            }
            account.UpdatedAt = new Date();
            await account.save();
        }

        // Nếu không tìm thấy, tạo tài khoản mới
        if (!account) {
            // Tạo UserCode tự động
            const userCount = await Account.countDocuments();
            const userCode = `GOOGLE${Date.now().toString().slice(-8)}${userCount + 1}`;

            account = new Account({
                UserCode: userCode,
                UserEmail: email.toLowerCase(),
                UserPhone: '', // Để trống, có thể cập nhật sau
                GoogleId: googleId,
                Name: name,
                UserRole: ACCOUNT_ROLES[5], // 'Customer'
                IdentityCard: '', // Để trống
                UserAddress: '',
                UserImage: picture || 'default-avatar.jpg',
                IsDeleted: false,
                CreatedAt: new Date(),
                UpdatedAt: new Date()
            });

            await account.save();
        }

        // Tạo JWT token
        const token = jwt.sign(
            {
                _id: account._id,
                UserCode: account.UserCode,
                UserEmail: account.UserEmail,
                UserRole: account.UserRole,
                Name: account.Name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Không trả về sensitive data
        const userData = account.toObject();
        delete userData.UserPassword;
        delete userData.IdentityCard;
        delete userData.GoogleId;

        return {
            token,
            user: userData
        };
    }
}

module.exports = new AccountService();
