const mongoose = require('mongoose');

const ACCOUNT_ROLES = [
    'Admin',
    'Manager',
    'Cashier',
    'Waiter',
    'Kitchen staff',
    'Customer'
];

const accountSchema = new mongoose.Schema(
    {
        UserCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        UserEmail: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            // validate: {
            //     validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            //     message: 'Email không hợp lệ'
            // }
        },
        UserPhone: {
            type: String,
            required: false, // Không bắt buộc cho Google login
            trim: true,
            default: ''
        },
        UserPassword: {
            type: String,
            required: false, // Không bắt buộc nếu đăng nhập bằng Google
            // minlength: 6,
            // select: false // Không trả về mặc định
        },
        GoogleId: {
            type: String,
            sparse: true, // Index nhưng cho phép null
            unique: true
        },
        Name: {
            type: String,
            required: true,
            trim: true
        },
        UserRole: {
            type: String,
            enum: ACCOUNT_ROLES,
            required: true
        },
        IdentityCard: {
            type: String,
            required: false, // Không bắt buộc cho Google login
            trim: true,
            default: ''
            // select: false // Ẩn mặc định
        },
        UserAddress: {
            type: String,
            trim: true
        },
        UserImage: {
            type: String,
            trim: true,
            default: 'default-avatar.jpg'
        },
        IsDeleted: {
            type: Boolean,
            default: false,
            // index: true
        },
        CreatedAt: {
            type: Date,
            default: Date.now
        },
        UpdatedAt: {
            type: Date,
            default: Date.now
        }
    }
);

const Account = mongoose.model('Account', accountSchema, 'accounts');

module.exports = {
    Account,
    ACCOUNT_ROLES
};