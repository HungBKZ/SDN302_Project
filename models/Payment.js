const mongoose = require('mongoose');

/**
 * Payment model (Mongoose)
 * Phù hợp với JSON mẫu:
 * {
 *   _id: ObjectId("504130303038000000000000"),
 *   OrderId: ObjectId("4f5230303700000000000000"),
 *   PaymentMethod: "Online",
 *   PaymentStatus: "Pending",
 *   TransactionRef: "TXN-OR007",
 *   PaymentDate: 2025-11-08T15:10:00.000Z
 * }
 */

const paymentSchema = new mongoose.Schema(
    {
        OrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            index: true
        },
        PaymentMethod: {
            type: String,
            required: true,
            trim: true,
            index: true
            // Ví dụ giá trị: "Cash", "Card", "Online", "QR", ...
        },
        PaymentStatus: {
            type: String,
            required: true,
            trim: true,
            default: 'Pending',
            index: true
            // Ví dụ giá trị: "Pending", "Completed", "Failed", "Refunded", ...
        },
        TransactionRef: {
            type: String,
            trim: true,
            default: null
            // Không bắt buộc. Nếu dùng, nên duy nhất theo giao dịch cổng thanh toán.
        },
        PaymentDate: {
            type: Date,
            required: true,
            default: Date.now,
            index: true
        },
        CreatedAt: {
            type: Date,
            default: Date.now
        },
        UpdatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: 'payments',
        timestamps: { createdAt: 'CreatedAt', updatedAt: 'UpdatedAt' }
    }
);

// // Unique index cho TransactionRef nhưng cho phép null (sparse)
// paymentSchema.index({ TransactionRef: 1 }, { unique: true, sparse: true });

// // Index hỗn hợp cho truy vấn trạng thái theo đơn hàng
// paymentSchema.index({ OrderId: 1, PaymentStatus: 1, PaymentDate: -1 });

// // Virtual: đã kết thúc (Completed/Failed/Refunded)
// paymentSchema.virtual('IsFinalized').get(function () {
//     const s = (this.PaymentStatus || '').toLowerCase();
//     return ['completed', 'failed', 'refunded'].includes(s);
// });

// // Middleware cập nhật UpdatedAt
// paymentSchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

// // Statics
// paymentSchema.statics.recordPayment = function (payload) {
//     return this.create(payload);
// };

// paymentSchema.statics.findByTransactionRef = function (ref) {
//     return this.findOne({ TransactionRef: ref });
// };

// // Instances
// paymentSchema.methods.markStatus = async function (nextStatus) {
//     this.PaymentStatus = nextStatus;
//     await this.save();
//     return this;
// };

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;