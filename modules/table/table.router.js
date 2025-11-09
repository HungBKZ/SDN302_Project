const TableController = require('./table.controller');
const express = require('express');
const router = express.Router();
const auth = require('../../core/middlewares/auth');

router.post('/', auth, TableController.createTable);
router.get('/', TableController.getTables);
router.get('/:id', TableController.getTableById);
router.put('/:id', auth, TableController.updateTable);
router.delete('/:id', auth, TableController.deleteTable);

module.exports = router;