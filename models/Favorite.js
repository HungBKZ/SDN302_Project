const mongoose = require('mongoose');

/**
 * Favorite model (Mongoose)
 * JSON mẫu:
 * {
 *   _id: ObjectId("4d473030312d443030340000"),
 *   UserId: ObjectId("4d4730303100000000000000"),
 *   DishId: ObjectId("443030340000000000000000"),
 *   IsDeleted: 0
 * }
 *
 * Mục đích: lưu món (Dish) mà người dùng (Account) đánh dấu yêu thích.
 * IsDeleted dùng như soft delete (0: hoạt động, 1: đã xóa).
 */

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
            // default: 0,
            // validate: {
            //     validator: (v) => v === 0 || v === 1,
            //     message: 'IsDeleted chỉ nhận 0 hoặc 1'
            // },
            index: true
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
//  * Unique index để mỗi (UserId, DishId) chỉ có một record
//  * (dù soft delete vẫn giữ entry cũ, khi thêm lại sẽ khôi phục).
//  */
// favoriteSchema.index({ UserId: 1, DishId: 1 }, { unique: true });

// /**
//  * Middleware cập nhật UpdatedAt trước save
//  */
// favoriteSchema.pre('save', function (next) {
//     this.UpdatedAt = new Date();
//     next();
// });

// /**
//  * Static: thêm yêu thích (nếu tồn tại và IsDeleted =1 -> khôi phục)
//  */
// favoriteSchema.statics.addFavorite = async function (userId, dishId) {
//     const existing = await this.findOne({ UserId: userId, DishId: dishId });
//     if (existing) {
//         if (existing.IsDeleted === 1) {
//             existing.IsDeleted = 0;
//             await existing.save();
//         }
//         return existing;
//     }
//     return this.create({ UserId: userId, DishId: dishId });
// };

// /**
//  * Static: xóa mềm yêu thích
//  */
// favoriteSchema.statics.removeFavorite = async function (userId, dishId) {
//     const fav = await this.findOne({ UserId: userId, DishId: dishId });
//     if (!fav) return null;
//     if (fav.IsDeleted === 0) {
//         fav.IsDeleted = 1;
//         await fav.save();
//     }
//     return fav;
// };

// /**
//  * Static: kiểm tra có đang yêu thích hay không
//  */
// favoriteSchema.statics.isFavorite = async function (userId, dishId) {
//     const fav = await this.findOne({ UserId: userId, DishId: dishId, IsDeleted: 0 });
//     return !!fav;
// };

// /**
//  * Static: danh sách Dish yêu thích của user (populate Dish)
//  */
// favoriteSchema.statics.listFavoritesByUser = function (userId, limit = 100) {
//     return this.find({ UserId: userId, IsDeleted: 0 })
//         .limit(limit)
//         .populate('DishId');
// };

// /**
//  * Instance: soft delete
//  */
// favoriteSchema.methods.softDelete = async function () {
//     if (this.IsDeleted === 0) {
//         this.IsDeleted = 1;
//         await this.save();
//     }
//     return this;
// };

// /**
//  * Instance: khôi phục
//  */
// favoriteSchema.methods.restore = async function () {
//     if (this.IsDeleted === 1) {
//         this.IsDeleted = 0;
//         await this.save();
//     }
//     return this;
// };

const Favorite = mongoose.model('Favorite', favoriteSchema, 'favorites');

module.exports = Favorite;