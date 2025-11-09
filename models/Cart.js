const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },
        CreatedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    }
);

// // Index gợi ý: tìm tất cả Cart của một Account theo thời gian
// cartSchema.index({ UserId: 1, CreatedAt: -1 });

// /**
//  * Static: tạo mới giỏ hàng cho user (có thể đảm bảo chỉ một giỏ đang mở nếu bạn thêm trạng thái sau này)
//  */
// cartSchema.statics.createForUser = async function (userId) {
//     return this.create({ UserId: userId });
// };

// /**
//  * Instance: cập nhật UpdatedAt thủ công nếu cần (timestamps đã lo, nhưng cung cấp tiện ích)
//  */
// cartSchema.methods.touch = async function () {
//     this.UpdatedAt = new Date();
//     return this.save();
// };

const Cart = mongoose.model('Cart', cartSchema, 'carts');

module.exports = Cart;