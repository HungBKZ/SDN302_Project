const ReservationController = require('./reservation.controller');
const express = require('express');
const router = express.Router();
const auth = require('../../core/middlewares/auth');

router.post('/', auth, ReservationController.createReservation);
router.get('/schedule/:id', auth, ReservationController.viewScheduleBooking);
router.patch('/:id/status', auth, ReservationController.updateStatusReservation);
router.put('/:id', auth, ReservationController.updateInformationReservation);
router.delete('/:id', auth, ReservationController.deleteReservation);

module.exports = router;