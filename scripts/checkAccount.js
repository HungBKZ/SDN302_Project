const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Account } = require('../models/Account');
require('dotenv').config();

async function checkAccount() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');

        // Tìm tài khoản manager
        const account = await Account.findOne({ UserEmail: 'manager@gmail.com' });
        
        if (!account) {
            console.log('❌ Không tìm thấy tài khoản manager@gmail.com');
            
            // Thử tìm với regex (không phân biệt hoa thường)
            const accountInsensitive = await Account.findOne({ 
                UserEmail: /^manager@gmail\.com$/i 
            });
            
            if (accountInsensitive) {
                console.log('✅ Tìm thấy với email:', accountInsensitive.UserEmail);
                console.log('📧 Email trong DB:', JSON.stringify(accountInsensitive.UserEmail));
            } else {
                console.log('❌ Không tìm thấy tài khoản nào tương tự');
                
                // Liệt kê tất cả email
                const allAccounts = await Account.find({}, 'UserEmail UserRole');
                console.log('\n📋 Danh sách tất cả email trong database:');
                allAccounts.forEach(acc => {
                    console.log(`   - ${acc.UserEmail} (${acc.UserRole})`);
                });
            }
        } else {
            console.log('✅ Tìm thấy tài khoản!');
            console.log('📧 Email:', account.UserEmail);
            console.log('👤 Role:', account.UserRole);
            console.log('🔐 Password (hash):', account.UserPassword);
            console.log('🗑️  IsDeleted:', account.IsDeleted);
            
            // Test password
            console.log('\n🧪 Test mật khẩu "123456":');
            const isMatch = await bcrypt.compare('123456', account.UserPassword);
            console.log('   Kết quả:', isMatch ? '✅ ĐÚNG' : '❌ SAI');
            
            if (!isMatch) {
                console.log('\n💡 Mật khẩu trong database KHÔNG PHẢI là "123456"');
                console.log('   Có thể đã được hash từ mật khẩu khác.');
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

checkAccount();
