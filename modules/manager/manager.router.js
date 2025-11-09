const express = require('express');
const router = express.Router();
const managerController = require('./manager.controller');
const auth = require('../../core/middlewares/auth');
const { isManager } = require('../../core/middlewares/roles');
const {
    validateCreateDish,
    validateUpdateDish,
    validateDishId
} = require('./manager.validation');

/**
 * @route   POST /api/manager/dishes
 * @desc    Thêm món ăn mới
 * @access  Private (Manager only)
 */
router.post('/dishes', auth, isManager, validateCreateDish, managerController.createDish);

/**
 * @route   GET /api/manager/dishes/:id
 * @desc    Xem chi tiết món ăn
 * @access  Private (Manager only)
 */
router.get('/dishes/:id', auth, isManager, validateDishId, managerController.getDishDetail);

/**
 * @route   PUT /api/manager/dishes/:id
 * @desc    Cập nhật thông tin món ăn
 * @access  Private (Manager only)
 */
router.put('/dishes/:id', auth, isManager, validateUpdateDish, managerController.updateDish);

/**
 * @route   DELETE /api/manager/dishes/:id
 * @desc    Xóa món ăn
 * @access  Private (Manager only)
 */
router.delete('/dishes/:id', auth, isManager, validateDishId, managerController.deleteDish);

module.exports = router;
