const mongoose = require('mongoose');

const dishInventorySchema = new mongoose.Schema(
    {
        DishId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish',
            required: true,
            index: true
        },
        ItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory',
            required: true,
            index: true
        },
        QuantityUsed: {
            type: Number,
            required: true,
            // min: [0, 'QuantityUsed phải >= 0']
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

// Đảm bảo mỗi (DishId, ItemId) là duy nhất
// dishInventorySchema.index({ DishId: 1, ItemId: 1 }, { unique: true });

// // Helper statics (tùy chọn)
// dishInventorySchema.statics.upsertQuantity = async function (dishId, itemId, quantity) {
//     if (quantity < 0) throw new Error('QuantityUsed phải >= 0');
//     return this.findOneAndUpdate(
//         { DishId: dishId, ItemId: itemId },
//         { $set: { QuantityUsed: quantity } },
//         { upsert: true, new: true, runValidators: true }
//     );
// };

// dishInventorySchema.statics.incrementQuantity = async function (dishId, itemId, delta) {
//     const doc = await this.findOne({ DishId: dishId, ItemId: itemId });
//     const next = (doc?.QuantityUsed || 0) + delta;
//     if (next < 0) throw new Error('QuantityUsed sau khi cập nhật < 0');
//     return this.findOneAndUpdate(
//         { DishId: dishId, ItemId: itemId },
//         { $set: { QuantityUsed: next } },
//         { upsert: true, new: true, runValidators: true }
//     );
// };

const DishInventory = mongoose.model('DishInventory', dishInventorySchema, 'dish_inventories');

module.exports = DishInventory;