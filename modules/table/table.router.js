const TableController = require('./table.controller');
const express = require('express');
const router = express.Router();
// const auth = require('../../core/middlewares/auth');

router.post('/', TableController.createTable);
router.get('/', TableController.getTables);
router.get('/:id', TableController.getTableById);
router.put('/:id', TableController.updateTable);
router.delete('/:id', TableController.deleteTable);

module.exports = router;