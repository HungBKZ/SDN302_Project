const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
    {
        CustomerCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        CustomerName: {
            type: String,
            required: true,
            trim: true
        },
        CustomerPhone: {
            type: String,
            required: true,
            trim: true,
            // Regex cơ bản cho số điện thoại (linh hoạt, tránh quá chặt)
            // validate: {
            //     validator: (v) => /^[0-9+\-\s()]{6,20}$/.test(v),
            //     message: 'Số điện thoại không hợp lệ'
            // },
            // index: true
        },
        NumberOfPayment: {
            type: Number,
            default: 0,
            min: 0
        }
    }
);

const Customer = mongoose.model('Customer', customerSchema, 'customers');

module.exports = Customer;