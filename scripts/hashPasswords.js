const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Account } = require('../models/Account');
require('dotenv').config();

/**
 * Script để hash lại tất cả mật khẩu plain text trong database
 * Chỉ chạy 1 lần để migrate dữ liệu
 */
async function hashExistingPasswords() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        // Lấy tất cả tài khoản
        const accounts = await Account.find({});
        console.log(`📊 Tìm thấy ${accounts.length} tài khoản`);

        let updatedCount = 0;

        for (const account of accounts) {
            try {
                // Kiểm tra xem password đã được hash chưa
                // Bcrypt hash luôn bắt đầu bằng $2a$, $2b$, hoặc $2y$
                const isHashed = /^\$2[aby]\$/.test(account.UserPassword);

                if (!isHashed) {
                    console.log(`🔄 Đang hash password cho: ${account.UserEmail}`);
                    
                    // Hash password
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(account.UserPassword, salt);
                    
                    // Cập nhật vào database
                    account.UserPassword = hashedPassword;
                    account.UpdatedAt = new Date();
                    await account.save();
                    
                    updatedCount++;
                    console.log(`✅ Đã hash password cho: ${account.UserEmail}`);
                } else {
                    console.log(`⏭️  Password đã được hash: ${account.UserEmail}`);
                }
            } catch (error) {
                console.error(`❌ Lỗi khi xử lý ${account.UserEmail}:`, error.message);
            }
        }

        console.log('\n📈 Tóm tắt:');
        console.log(`   - Tổng số tài khoản: ${accounts.length}`);
        console.log(`   - Đã cập nhật: ${updatedCount}`);
        console.log(`   - Đã có sẵn hash: ${accounts.length - updatedCount}`);
        
        console.log('\n✅ Hoàn thành!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

// Chạy script
hashExistingPasswords();
