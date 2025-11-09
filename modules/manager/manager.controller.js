const managerService = require('./manager.service');

class ManagerController {
    /**
     * POST /api/manager/dishes
     * Thêm món ăn mới (chỉ Manager)
     */
    async createDish(req, res, next) {
        try {
            const dishData = req.body;
            const newDish = await managerService.createDish(dishData);

            return res.status(201).json({
                success: true,
                message: 'Thêm món ăn thành công',
                data: newDish
            });
        } catch (error) {
            if (error.message === 'Món ăn đã tồn tại') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * GET /api/manager/dishes/:id
     * Xem chi tiết món ăn (chỉ Manager)
     */
    async getDishDetail(req, res, next) {
        try {
            const { id } = req.params;
            const dish = await managerService.getDishDetail(id);

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
     * PUT /api/manager/dishes/:id
     * Cập nhật thông tin món ăn (chỉ Manager)
     */
    async updateDish(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedDish = await managerService.updateDish(id, updateData);

            return res.status(200).json({
                success: true,
                message: 'Cập nhật món ăn thành công',
                data: updatedDish
            });
        } catch (error) {
            if (error.message === 'Món ăn không tồn tại') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message === 'Tên món ăn đã được sử dụng') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            next(error);
        }
    }

    /**
     * DELETE /api/manager/dishes/:id
     * Xóa món ăn (chỉ Manager)
     */
    async deleteDish(req, res, next) {
        try {
            const { id } = req.params;
            const deletedDish = await managerService.deleteDish(id);

            return res.status(200).json({
                success: true,
                message: 'Xóa món ăn thành công',
                data: deletedDish
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
}

module.exports = new ManagerController();
