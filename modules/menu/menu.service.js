const Dish = require('../../models/Dish');

class MenuService {
    /**
     * Lấy tất cả món ăn trong menu
     * @param {Object} filters - Bộ lọc (DishType, DishStatus, IngredientStatus)
     * @param {Object} options - Phân trang (page, limit, sort)
     * @returns {Promise<Object>} Danh sách món ăn và thông tin phân trang
     */
    async getAllDishes(filters = {}, options = {}) {
        const {
            DishType,
            DishStatus,
            IngredientStatus,
            search
        } = filters;

        const {
            page = 1,
            limit = 10,
            sortBy = 'CreatedAt',
            sortOrder = 'desc'
        } = options;

        // Xây dựng query
        const query = {};

        if (DishType) {
            query.DishType = DishType;
        }

        if (DishStatus) {
            query.DishStatus = DishStatus;
        }

        if (IngredientStatus) {
            query.IngredientStatus = IngredientStatus;
        }

        // Tìm kiếm theo tên món ăn
        if (search) {
            query.DishName = { $regex: search, $options: 'i' };
        }

        // Tính toán phân trang
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        // Lấy dữ liệu
        const [dishes, total] = await Promise.all([
            Dish.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Dish.countDocuments(query)
        ]);

        return {
            dishes,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        };
    }

    /**
     * Lấy chi tiết món ăn theo ID
     * @param {String} dishId - ID của món ăn
     * @returns {Promise<Object>} Thông tin món ăn
     */
    async getDishById(dishId) {
        const dish = await Dish.findById(dishId).lean();
        
        if (!dish) {
            throw new Error('Món ăn không tồn tại');
        }

        return dish;
    }

    /**
     * Lấy danh sách các loại món ăn (DishType)
     * @returns {Promise<Array>} Danh sách các loại món ăn
     */
    async getDishTypes() {
        const dishTypes = await Dish.distinct('DishType');
        return dishTypes;
    }

    /**
     * Lấy món ăn nổi bật (có thể mở rộng thêm logic)
     * @param {Number} limit - Số lượng món ăn
     * @returns {Promise<Array>} Danh sách món ăn nổi bật
     */
    async getFeaturedDishes(limit = 5) {
        const dishes = await Dish.find({
            DishStatus: 'Available',
            IngredientStatus: 'Sufficient'
        })
            .sort({ CreatedAt: -1 })
            .limit(limit)
            .lean();

        return dishes;
    }

    /**
     * Tìm kiếm món ăn theo tên
     * @param {String} keyword - Từ khóa tìm kiếm
     * @param {Number} limit - Số lượng kết quả
     * @returns {Promise<Array>} Danh sách món ăn
     */
    async searchDishes(keyword, limit = 10) {
        const dishes = await Dish.find({
            DishName: { $regex: keyword, $options: 'i' }
        })
            .limit(limit)
            .lean();

        return dishes;
    }

    /**
     * Thêm món ăn mới (chỉ Manager)
     * @param {Object} dishData - Dữ liệu món ăn mới
     * @returns {Promise<Object>} Món ăn vừa tạo
     */
    async createDish(dishData) {
        // Kiểm tra món ăn đã tồn tại chưa
        const existingDish = await Dish.findOne({ 
            DishName: dishData.DishName 
        });

        if (existingDish) {
            throw new Error('Món ăn đã tồn tại trong hệ thống');
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
}

module.exports = new MenuService();
