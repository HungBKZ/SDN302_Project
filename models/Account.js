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
        },
        UserPhone: {
            type: String,
            required: true,
            trim: true
        },
        UserPassword: {
            type: String,
            required: true,
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
            required: true,
            trim: true,
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
