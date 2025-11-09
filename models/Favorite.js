const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required: true,
            index: true
        },
        DishId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish',
            required: true,
            index: true
        },
        IsDeleted: {
            type: Number,
            default: 0,
            enum: [0, 1]
        },
        CreatedAt: {
            type: Date,
            default: Date.now
        }
    }
);

// Compound index để tránh trùng lặp UserId + DishId
favoriteSchema.index({ UserId: 1, DishId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema, 'favorites');

module.exports = Favorite;
