const menuService = require('./menu.service');

class MenuController {
    /**
     * GET /api/menu
     * Lấy danh sách tất cả món ăn
     */
    async getAllDishes(req, res, next) {
        try {
            const filters = {
                DishType: req.query.type,
                DishStatus: req.query.status,
                IngredientStatus: req.query.ingredientStatus,
                search: req.query.search
            };

            const options = {
                page: req.query.page || 1,
                limit: req.query.limit || 10,
                sortBy: req.query.sortBy || 'CreatedAt',
                sortOrder: req.query.sortOrder || 'desc'
            };

            const result = await menuService.getAllDishes(filters, options);

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách món ăn thành công',
                data: result.dishes,
                pagination: result.pagination
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/menu/:id
     * Lấy chi tiết món ăn theo ID
     */
    async getDishById(req, res, next) {
        try {
            const { id } = req.params;
            const dish = await menuService.getDishById(id);

            return res.status(200).json({
                success: true,
                message: 'Lấy thông tin món ăn thành công',
                data: dish
            });
        } catch (error) {
            if (error.message === 'Món ăn không tồn tại') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * GET /api/menu/types/list
     * Lấy danh sách các loại món ăn
     */
    async getDishTypes(req, res, next) {
        try {
            const dishTypes = await menuService.getDishTypes();

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách loại món ăn thành công',
                data: dishTypes
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/menu/featured
     * Lấy danh sách món ăn nổi bật
     */
    async getFeaturedDishes(req, res, next) {
        try {
            const limit = req.query.limit || 5;
            const dishes = await menuService.getFeaturedDishes(limit);

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách món ăn nổi bật thành công',
                data: dishes
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/menu/search
     * Tìm kiếm món ăn
     */
    async searchDishes(req, res, next) {
        try {
            const { keyword } = req.query;
            const limit = req.query.limit || 10;

            if (!keyword) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập từ khóa tìm kiếm'
                });
            }

            const dishes = await menuService.searchDishes(keyword, limit);

            return res.status(200).json({
                success: true,
                message: 'Tìm kiếm món ăn thành công',
                data: dishes
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/menu
     * Thêm món ăn mới (chỉ Manager)
     */
    async createDish(req, res, next) {
        try {
            const dishData = req.body;
            const newDish = await menuService.createDish(dishData);

            return res.status(201).json({
                success: true,
                message: 'Thêm món ăn mới thành công',
                data: newDish
            });
        } catch (error) {
            if (error.message === 'Món ăn đã tồn tại trong hệ thống') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }
}

module.exports = new MenuController();
