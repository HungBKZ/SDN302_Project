
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
    {
        CartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cart',
            required: true,
            index: true
        },
        DishId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish',
            required: true,
            index: true
        },
        Quantity: {
            type: Number,
            required: true,
            // min: [1, 'Quantity phải >= 1'],
            // validate: {
            //     validator: Number.isInteger,
            //     message: 'Quantity phải là số nguyên'
            // }
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

// Mỗi (CartId, DishId) chỉ có một dòng để tránh trùng món trong cùng giỏ
cartItemSchema.index({ CartId: 1, DishId: 1 }, { unique: true });

// /**
//  * Static: thêm/cập nhật số lượng cho món trong giỏ (upsert)
//  */
// cartItemSchema.statics.upsertItem = async function (cartId, dishId, quantity) {
//     if (!Number.isInteger(quantity) || quantity < 1) {
//         throw new Error('Quantity phải là số nguyên >= 1');
//     }
//     return this.findOneAndUpdate(
//         { CartId: cartId, DishId: dishId },
//         { $set: { Quantity: quantity } },
//         { upsert: true, new: true, runValidators: true }
//     );
// };

// /**
//  * Static: tăng/giảm số lượng theo delta (delta có thể âm, nhưng kết quả cuối phải >= 1)
//  */
// cartItemSchema.statics.incrementItem = async function (cartId, dishId, delta) {
//     const doc = await this.findOne({ CartId: cartId, DishId: dishId });
//     const nextQty = (doc?.Quantity || 0) + delta;
//     if (!Number.isInteger(nextQty) || nextQty < 1) {
//         throw new Error('Kết quả Quantity không hợp lệ (phải là số nguyên >= 1)');
//     }
//     return this.findOneAndUpdate(
//         { CartId: cartId, DishId: dishId },
//         { $set: { Quantity: nextQty } },
//         { upsert: true, new: true, runValidators: true }
//     );
// };

const CartItem = mongoose.model('CartItem', cartItemSchema, 'cartItems');

module.exports = CartItem;