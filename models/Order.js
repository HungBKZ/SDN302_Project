const mongoose = require('mongoose');

/**
 * Order model (cập nhật đầy đủ theo JSON mới)
 * JSON mẫu:
 * {
 *   _id: ObjectId("4f5230303100000000000000"),
 *   UserId: ObjectId("575430303100000000000000"),   // nhân viên (Account) tạo đơn, có thể null nếu khách tự đặt
 *   CustomerId: null | ObjectId,                     // khách vãng lai (Customer) nếu có
 *   CouponId: null | ObjectId,                       // coupon áp dụng nếu có
 *   TableId: ObjectId("544131303100000000000000"),   // bàn (có thể null với Takeaway)
 *   OrderDate: Date,
 *   OrderStatus: "Completed" | ...,
 *   OrderType: "Dine-in" | "Takeaway" | ...,
 *   OrderDescription: "Lunch order by waiter",
 *   CustomerPhone: null | string,
 *   Total: 16.5,          // tổng trước giảm giá / điều chỉnh
 *   FinalPrice: 16.5      // số tiền cuối sau giảm giá, thuế...
 * }
 *
 * Ghi chú:
 * - Không ép enum cứng để linh hoạt.
 * - Nếu dùng soft delete có thể thêm IsDeleted giống các model khác.
 * - Có thể mở rộng với trường PaymentStatus, PaymentMethod, TaxAmount, DiscountAmount...
 */

const orderSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null,
            index: true
        },
        CustomerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            default: null,
            index: true
        },
        CouponId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon',
            default: null,
            index: true
        },
        TableId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            default: null,
            index: true
        },
        OrderDate: {
            type: Date,
            required: true,
            default: Date.now,
            index: true
        },
        OrderStatus: {
            type: String,
            required: true,
            trim: true,
            default: 'Pending',
            index: true
        },
        OrderType: {
            type: String,
            trim: true,
            default: 'Dine-in',
            index: true
        },
        OrderDescription: {
            type: String,
            trim: true,
            default: ''
        },
        CustomerPhone: {
            type: String,
            trim: true,
            default: null,
            // validate: {
            //     validator: (v) => v === null || /^[0-9]{9,15}$/.test(v),
            //     message: 'CustomerPhone không hợp lệ'
            // }
        },
        Total: {
            type: Number,
            required: true,
            min: [0, 'Total phải >= 0']
        },
        FinalPrice: {
            type: Number,
            required: true,
            min: [0, 'FinalPrice phải >= 0']
        },
        // CreatedAt: {
        //     type: Date,
        //     default: Date.now
        // },
        // UpdatedAt: {
        //     type: Date,
        //     default: Date.now
        // }
    }
);

// /**
//  * Index bổ sung cho truy vấn báo cáo
//  */
// orderSchema.index({ OrderType: 1, OrderStatus: 1 });
// orderSchema.index({ CouponId: 1, OrderDate: -1 });

// /**
//  * Virtual: chênh lệch giữa Total và FinalPrice (ví dụ giảm giá)
//  */
// orderSchema.virtual('DiscountValue').get(function () {
//     if (typeof this.Total === 'number' && typeof this.FinalPrice === 'number') {
//         return +(this.Total - this.FinalPrice).toFixed(2);
//     }
//     return null;
// });

// /**
//  * Middleware cập nhật UpdatedAt trước save
//  */
// orderSchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

// /**
//  * Static: tạo đơn (tự động set FinalPrice nếu chưa truyền)
//  */
// orderSchema.statics.createOrder = async function (payload) {
//     if (payload.FinalPrice == null) {
//         payload.FinalPrice = payload.Total;
//     }
//     return this.create(payload);
// };

// /**
//  * Static: tìm đơn theo trạng thái mới nhất (limit)
//  */
// orderSchema.statics.findLatestByStatus = function (status, limit = 50) {
//     return this.find({ OrderStatus: status }).sort({ OrderDate: -1 }).limit(limit);
// };

// /**
//  * Instance: cập nhật trạng thái
//  */
// orderSchema.methods.updateStatus = async function (nextStatus) {
//     this.OrderStatus = nextStatus;
//     await this.save();
//     return this;
// };

// /**
//  * Instance: áp dụng coupon (giảm giá) -> FinalPrice
//  * Bạn có thể truyền logic giảm giá từ bên ngoài.
//  */
// orderSchema.methods.applyDiscount = async function (finalPrice, couponId = null) {
//     if (finalPrice < 0) throw new Error('FinalPrice không hợp lệ');
//     this.FinalPrice = finalPrice;
//     if (couponId) this.CouponId = couponId;
//     await this.save();
//     return this;
// };

const Order = mongoose.model('Order', orderSchema, 'orders');

module.exports = Order;