const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Account } = require('../models/Account');
require('dotenv').config();

/**
 * Test đăng nhập trực tiếp
 */
async function testLogin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');

        const testEmail = 'manager@gmail.com';
        const testPassword = '123456';

        console.log('📝 Test với:');
        console.log('   Email:', testEmail);
        console.log('   Password:', testPassword);
        console.log('');

        // Bước 1: Tìm account
        console.log('🔍 Bước 1: Tìm tài khoản...');
        const account = await Account.findOne({ 
            UserEmail: testEmail.toLowerCase(),
            IsDeleted: false 
        });

        if (!account) {
            console.log('❌ Không tìm thấy tài khoản');
            process.exit(1);
        }

        console.log('✅ Tìm thấy tài khoản:', account.UserEmail);
        console.log('');

        // Bước 2: Kiểm tra password
        console.log('🔐 Bước 2: Kiểm tra mật khẩu...');
        const isPasswordValid = await bcrypt.compare(testPassword, account.UserPassword);
        
        if (!isPasswordValid) {
            console.log('❌ Mật khẩu không đúng');
            process.exit(1);
        }

        console.log('✅ Mật khẩu đúng');
        console.log('');

        // Bước 3: Tạo token
        console.log('🎫 Bước 3: Tạo JWT token...');
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

        console.log('✅ Token đã tạo:', token.substring(0, 50) + '...');
        console.log('');

        // Kết quả
        console.log('🎉 Đăng nhập thành công!');
        console.log('');
        console.log('📋 Thông tin user:');
        console.log('   _id:', account._id);
        console.log('   UserCode:', account.UserCode);
        console.log('   Email:', account.UserEmail);
        console.log('   Name:', account.Name);
        console.log('   Role:', account.UserRole);
        console.log('');
        console.log('🎫 Full Token:');
        console.log(token);

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

testLogin();
