const ReservationController = require('./reservation.controller');
const express = require('express');
const router = express.Router();
const auth = require('../../core/middlewares/auth');

router.post('/', auth, ReservationController.createReservation);
router.get('/schedule/:id', auth, ReservationController.viewScheduleBooking);
router.put('/:id', auth, ReservationController.updateStatusReservation);
router.delete('/:id', auth, ReservationController.deleteReservation);

module.exports = router;