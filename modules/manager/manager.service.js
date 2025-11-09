const Dish = require('../../models/Dish');

class ManagerService {
    /**
     * Thêm món ăn mới
     * @param {Object} dishData - Thông tin món ăn
     * @returns {Promise<Object>} Món ăn vừa tạo
     */
    async createDish(dishData) {
        // Kiểm tra món ăn đã tồn tại
        const existingDish = await Dish.findOne({ 
            DishName: dishData.DishName 
        });
        
        if (existingDish) {
            throw new Error('Món ăn đã tồn tại');
        }

        // Tạo món ăn mới
        const newDish = new Dish({
            DishName: dishData.DishName,
            DishType: dishData.DishType,
            DishPrice: dishData.DishPrice,
            DishDescription: dishData.DishDescription || '',
            DishImage: dishData.DishImage || 'default-dish.jpg',
            DishStatus: dishData.DishStatus || 'Available',
            IngredientStatus: dishData.IngredientStatus || 'Sufficient',
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        });

        await newDish.save();
        return newDish;
    }

    /**
     * Xem chi tiết món ăn theo ID
     * @param {String} dishId - ID của món ăn
     * @returns {Promise<Object>} Thông tin món ăn
     */
    async getDishDetail(dishId) {
        const dish = await Dish.findById(dishId);
        
        if (!dish) {
            throw new Error('Món ăn không tồn tại');
        }

        return dish;
    }

    /**
     * Cập nhật thông tin món ăn
     * @param {String} dishId - ID của món ăn
     * @param {Object} updateData - Dữ liệu cập nhật
     * @returns {Promise<Object>} Món ăn đã cập nhật
     */
    async updateDish(dishId, updateData) {
        const dish = await Dish.findById(dishId);
        
        if (!dish) {
            throw new Error('Món ăn không tồn tại');
        }

        // Nếu cập nhật tên món, kiểm tra trùng tên với món khác
        if (updateData.DishName && updateData.DishName !== dish.DishName) {
            const existingDish = await Dish.findOne({ 
                DishName: updateData.DishName,
                _id: { $ne: dishId }
            });
            
            if (existingDish) {
                throw new Error('Tên món ăn đã được sử dụng');
            }
        }

        // Các field được phép cập nhật
        const allowedUpdates = [
            'DishName', 
            'DishType', 
            'DishPrice', 
            'DishDescription', 
            'DishImage', 
            'DishStatus', 
            'IngredientStatus'
        ];
        
        allowedUpdates.forEach(field => {
            if (updateData[field] !== undefined) {
                dish[field] = updateData[field];
            }
        });

        dish.UpdatedAt = new Date();
        await dish.save();

        return dish;
    }

    /**
     * Xóa món ăn
     * @param {String} dishId - ID của món ăn
     * @returns {Promise<Object>} Món ăn đã xóa
     */
    async deleteDish(dishId) {
        const dish = await Dish.findById(dishId);
        
        if (!dish) {
            throw new Error('Món ăn không tồn tại');
        }

        await Dish.findByIdAndDelete(dishId);
        return dish;
    }
}

module.exports = new ManagerService();
