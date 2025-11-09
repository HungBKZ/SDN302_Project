const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
    {
        DishName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        DishType: {
            type: String,
            required: true,
            trim: true
        },
        DishPrice: {
            type: Number,
            required: true,
            // min: [0, 'DishPrice phải >= 0']
        },
        DishDescription: {
            type: String,
            trim: true,
            // default: ''
        },
        DishImage: {
            type: String,
            trim: true,
            default: 'default-dish.jpg'
        },
        DishStatus: {
            type: String,
            trim: true,
            // default: 'Available',
            index: true
        },
        IngredientStatus: {
            type: String,
            trim: true,
            // default: 'Sufficient',
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
    }
);

// Index gợi ý cho tìm kiếm theo tên + trạng thái
// dishSchema.index({ DishName: 1, DishStatus: 1 });

// // Static helpers (tùy chọn)
// dishSchema.statics.findAvailable = function () {
//     return this.find({ DishStatus: 'Available' });
// };

// dishSchema.statics.findByName = function (name) {
//     return this.findOne({ DishName: name });
// };

// // Instance helpers (tùy chọn)
// dishSchema.methods.markUnavailable = async function () {
//     this.DishStatus = 'Unavailable';
//     await this.save();
//     return this;
// };

const Dish = mongoose.model('Dish', dishSchema, 'dishs');

module.exports = Dish;