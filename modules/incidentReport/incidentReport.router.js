const IncidentReportController = require('./incidentReport.controller');
const express = require('express');
const router = express.Router();
const auth = require('../../core/middlewares/auth');

router.post('/', auth, IncidentReportController.createIncidentReport);
router.get('/', IncidentReportController.getAllIncidentReports);
router.put('/:id', auth, IncidentReportController.updateIncidentReport);
router.delete('/:id', auth, IncidentReportController.deleteIncidentReport);
router.put('/:id/status', auth, IncidentReportController.updateStatusIncidentReport);

module.exports = router;