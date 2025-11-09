const mongoose = require('mongoose');

/**
 * OrderItem model (Mongoose)
 * Phù hợp với JSON mẫu:
 * {
 *   _id: ObjectId("4f4430303800000000000000"),
 *   OrderId: ObjectId("4f5230303600000000000000"),
 *   DishId: ObjectId("443030330000000000000000"),
 *   Quantity: 4,
 *   UnitPrice: 30.5
 * }
 *
 * Tham chiếu:
 * - OrderId -> model 'Order' (collection Orders)
 * - DishId  -> model 'Dish' (collection Dishes)
 */

const orderItemSchema = new mongoose.Schema(
    {
        OrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
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
        UnitPrice: {
            type: Number,
            required: true,
            // min: [0, 'UnitPrice phải >= 0']
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

// Mỗi (OrderId, DishId) chỉ có một dòng để tránh trùng món trong cùng đơn
orderItemSchema.index({ OrderId: 1, DishId: 1 }, { unique: true });

// // Virtual: tổng tiền dòng = Quantity * UnitPrice, làm tròn 2 chữ số
// orderItemSchema.virtual('LineTotal').get(function () {
//     if (typeof this.Quantity === 'number' && typeof this.UnitPrice === 'number') {
//         return +(this.Quantity * this.UnitPrice).toFixed(2);
//     }
//     return undefined;
// });

// // Middleware cập nhật UpdatedAt
// orderItemSchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

// /**
//  * Static: thêm/cập nhật số lượng và đơn giá cho món trong đơn (upsert)
//  */
// orderItemSchema.statics.upsertItem = async function (orderId, dishId, quantity, unitPrice) {
//     if (!Number.isInteger(quantity) || quantity < 1) {
//         throw new Error('Quantity phải là số nguyên >= 1');
//     }
//     if (!(unitPrice >= 0)) {
//         throw new Error('UnitPrice phải >= 0');
//     }
//     return this.findOneAndUpdate(
//         { OrderId: orderId, DishId: dishId },
//         { $set: { Quantity: quantity, UnitPrice: unitPrice } },
//         { upsert: true, new: true, runValidators: true }
//     );
// };

// /**
//  * Static: tăng/giảm số lượng theo delta (kết quả cuối phải >= 1)
//  */
// orderItemSchema.statics.incrementQuantity = async function (orderId, dishId, delta) {
//     const doc = await this.findOne({ OrderId: orderId, DishId: dishId });
//     const nextQty = (doc?.Quantity || 0) + delta;
//     if (!Number.isInteger(nextQty) || nextQty < 1) {
//         throw new Error('Kết quả Quantity không hợp lệ (phải là số nguyên >= 1)');
//     }
//     return this.findOneAndUpdate(
//         { OrderId: orderId, DishId: dishId },
//         { $set: { Quantity: nextQty } },
//         { upsert: true, new: true, runValidators: true }
//     );
// };

// /**
//  * Static: lấy tất cả item theo OrderId
//  */
// orderItemSchema.statics.listByOrder = function (orderId) {
//     return this.find({ OrderId: orderId }).populate('DishId');
// };

const OrderItem = mongoose.model('OrderItem', orderItemSchema, 'order_items');

module.exports = OrderItem;