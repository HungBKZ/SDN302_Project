const ReservationController = require('./reservation.controller');
const express = require('express');
const router = express.Router();
const auth = require('../../core/middlewares/auth');

router.post('/', auth, ReservationController.createReservation);
// router.get('/', ReservationController.getReservations);
// router.get('/:id', ReservationController.getReservationById);
// router.put('/:id', auth, ReservationController.updateReservation);
// router.delete('/:id', auth, ReservationController.deleteReservation);

module.exports = router;