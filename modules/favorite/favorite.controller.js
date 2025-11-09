const favoriteService = require('./favorite.service');

class FavoriteController {
    /**
     * POST /api/favorite/add
     * Thêm món vào danh sách yêu thích
     */
    async addFavorite(req, res, next) {
        try {
            const userId = req.user._id;
            const { dishId } = req.body;

            const favorite = await favoriteService.addFavorite(userId, dishId);

            return res.status(201).json({
                success: true,
                message: 'Thêm món vào danh sách yêu thích thành công',
                data: favorite
            });
        } catch (error) {
            if (error.message === 'Món ăn không tồn tại') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message === 'Món ăn đã có trong danh sách yêu thích') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * DELETE /api/favorite/remove/:dishId
     * Xóa món khỏi danh sách yêu thích
     */
    async removeFavorite(req, res, next) {
        try {
            const userId = req.user._id;
            const { dishId } = req.params;

            const favorite = await favoriteService.removeFavorite(userId, dishId);

            return res.status(200).json({
                success: true,
                message: 'Xóa món khỏi danh sách yêu thích thành công',
                data: favorite
            });
        } catch (error) {
            if (error.message === 'Món ăn không có trong danh sách yêu thích') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * GET /api/favorite/list
     * Lấy danh sách món yêu thích của user hiện tại
     */
    async getFavorites(req, res, next) {
        try {
            const userId = req.user._id;
            const favorites = await favoriteService.getFavorites(userId);

            return res.status(200).json({
                success: true,
                message: 'Lấy danh sách món yêu thích thành công',
                data: favorites,
                count: favorites.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/favorite/check/:dishId
     * Kiểm tra món ăn đã được yêu thích chưa
     */
    async checkFavorite(req, res, next) {
        try {
            const userId = req.user._id;
            const { dishId } = req.params;

            const isFavorite = await favoriteService.checkFavorite(userId, dishId);

            return res.status(200).json({
                success: true,
                message: 'Kiểm tra trạng thái yêu thích thành công',
                data: {
                    dishId: dishId,
                    isFavorite: isFavorite
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/favorite/count
     * Đếm số lượng món yêu thích
     */
    async countFavorites(req, res, next) {
        try {
            const userId = req.user._id;
            const count = await favoriteService.countFavorites(userId);

            return res.status(200).json({
                success: true,
                message: 'Đếm số lượng món yêu thích thành công',
                data: {
                    count: count
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FavoriteController();
