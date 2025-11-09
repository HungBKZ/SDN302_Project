const Favorite = require('../../models/Favorite');
const Dish = require('../../models/Dish');

class FavoriteService {
    /**
     * Thêm món vào danh sách yêu thích
     * @param {String} userId - ID của user
     * @param {String} dishId - ID của món ăn
     * @returns {Promise<Object>} Favorite vừa tạo
     */
    async addFavorite(userId, dishId) {
        console.log('📌 Service addFavorite - UserId:', userId, 'DishId:', dishId);
        
        // Kiểm tra món ăn có tồn tại không
        const dish = await Dish.findById(dishId);
        console.log('🍽️ Dish found:', dish ? 'Yes' : 'No');
        if (!dish) {
            throw new Error('Món ăn không tồn tại');
        }

        // Kiểm tra đã favorite chưa
        const existingFavorite = await Favorite.findOne({
            UserId: userId,
            DishId: dishId
        });
        console.log('💾 Existing favorite:', existingFavorite ? 'Yes' : 'No');

        if (existingFavorite) {
            // Nếu đã tồn tại nhưng đã xóa (IsDeleted = 1), khôi phục lại
            if (existingFavorite.IsDeleted === 1) {
                existingFavorite.IsDeleted = 0;
                existingFavorite.CreatedAt = new Date();
                await existingFavorite.save();
                return existingFavorite;
            }
            throw new Error('Món ăn đã có trong danh sách yêu thích');
        }

        // Tạo favorite mới
        const newFavorite = new Favorite({
            UserId: userId,
            DishId: dishId,
            IsDeleted: 0,
            CreatedAt: new Date()
        });

        await newFavorite.save();
        return newFavorite;
    }

    /**
     * Xóa món khỏi danh sách yêu thích (soft delete)
     * @param {String} userId - ID của user
     * @param {String} dishId - ID của món ăn
     * @returns {Promise<Object>} Favorite đã xóa
     */
    async removeFavorite(userId, dishId) {
        const favorite = await Favorite.findOne({
            UserId: userId,
            DishId: dishId,
            IsDeleted: 0
        });

        if (!favorite) {
            throw new Error('Món ăn không có trong danh sách yêu thích');
        }

        // Soft delete
        favorite.IsDeleted = 1;
        await favorite.save();

        return favorite;
    }

    /**
     * Lấy danh sách món yêu thích của user
     * @param {String} userId - ID của user
     * @returns {Promise<Array>} Danh sách món yêu thích
     */
    async getFavorites(userId) {
        const favorites = await Favorite.find({
            UserId: userId,
            IsDeleted: 0
        })
        .populate('DishId', 'DishName DishType DishPrice DishDescription DishImage DishStatus')
        .sort({ CreatedAt: -1 });

        // Map để trả về data dễ đọc hơn
        const result = favorites.map(fav => ({
            _id: fav._id,
            dish: fav.DishId,
            createdAt: fav.CreatedAt
        }));

        return result;
    }

    /**
     * Kiểm tra món ăn đã được yêu thích chưa
     * @param {String} userId - ID của user
     * @param {String} dishId - ID của món ăn
     * @returns {Promise<Boolean>} True nếu đã yêu thích
     */
    async checkFavorite(userId, dishId) {
        const favorite = await Favorite.findOne({
            UserId: userId,
            DishId: dishId,
            IsDeleted: 0
        });

        return !!favorite;
    }

    /**
     * Đếm số lượng món yêu thích của user
     * @param {String} userId - ID của user
     * @returns {Promise<Number>} Số lượng món yêu thích
     */
    async countFavorites(userId) {
        const count = await Favorite.countDocuments({
            UserId: userId,
            IsDeleted: 0
        });

        return count;
    }
}

module.exports = new FavoriteService();
