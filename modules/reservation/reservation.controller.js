const Table = require('../../models/Table');
const Reservation = require('../../models/Reservation');
const { Account } = require('../../models/Account');

exports.createReservation = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;

        const account = await Account.findById(userId);
        if (!account || (account.UserRole !== 'Manager' && account.UserRole !== 'Customer')) {
            return res.status(403).json({ message: 'Forbidden: Managers and Customers only' });
        }

        const { TableId, CustomerId, ReservationTime, NumberOfGuests } = req.body;

        if (!TableId || !ReservationTime || !NumberOfGuests) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const table = await Table.findById(TableId);
        if (!table || table.IsDeleted === 1) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const newReservation = new Reservation({
            TableId,
            CustomerId: CustomerId || null,
            UserId: userId || null,
            ReservationTime,
            NumberOfGuests
        });

        await newReservation.save();

        res.status(201).json({
            message: 'Reservation created successfully',
            reservation: newReservation
        });
    } catch (error) {
        console.error('Error creating reservation:', error);
        res.status(500).json({ message: 'Error creating reservation', error: error.message });
    }
}

exports.updateStatusReservation = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { id } = req.params;
        const { Status } = req.body;
        const account = await Account.findById(userId);

        if (!account) {
            return res.status(403).json({ message: 'Unauthorized: Account not found' });
        }

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        if (account.UserRole === 'Manager') {
            if (Status === 'Confirmed' || Status === 'Cancelled' || Status === 'Completed') {
                const updatedReservation = await Reservation.findByIdAndUpdate(id, { Status }, { new: true });

                if (Status === 'Confirmed') {
                    await Table.findByIdAndUpdate(reservation.TableId, { TableStatus: 'Occupied' });
                } else if (Status === 'Cancelled' || Status === 'Completed') {
                    await Table.findByIdAndUpdate(reservation.TableId, { TableStatus: 'Available' });
                }

                return res.status(200).json({
                    message: 'Reservation status updated successfully by Manager',
                    reservation: updatedReservation
                });
            } else {
                return res.status(400).json({ message: 'Manager can only update status to Confirmed, Cancelled, or Completed' });
            }
        }

        else if (account.UserRole === 'Customer') {
            if (Status !== 'Cancelled') {
                return res.status(403).json({ message: 'Customers can only cancel reservations' });
            }

            const now = new Date();
            const createdAt = new Date(reservation.CreatedAt);

            const timeDiffMs = now - createdAt;
            const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

            if (timeDiffHours >= 1) {
                return res.status(400).json({
                    message: 'Cannot cancel — more than 1 hour has passed since reservation time'
                });
            }

            const updatedReservation = await Reservation.findByIdAndUpdate(id, { Status }, { new: true });
            await Table.findByIdAndUpdate(reservation.TableId, { TableStatus: 'Available' });

            return res.status(200).json({
                message: 'Reservation cancelled successfully by Customer',
                reservation: updatedReservation
            });
        }
        return res.status(403).json({ message: 'Forbidden: Only Managers or Customers can update reservations' });

    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({ message: 'Error updating reservation status', error: error.message });
    }
};


exports.viewScheduleBooking = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const account = await Account.findById(userId);
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Missing reservation ID' });
        }

        if (!account || (account.UserRole !== 'Manager' && account.UserRole !== 'Customer')) {
            return res.status(403).json({ message: 'Forbidden: Managers and Customers only' });
        }

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        if (account.UserRole === 'Customer' && reservation.userId?.toString() === userId?.toString()) {
            return res.status(200).json({
                message: 'Schedule retrieved successfully',
                reservation
            });
        }
        else if (account.UserRole === 'Manager') {
            return res.status(200).json({
                message: 'Schedule retrieved successfully',
                reservation
            });
        }

        else {
            return res.status(403).json({ message: 'Forbidden: You cannot view this reservation' });
        }

    } catch (error) {
        console.error('Error retrieving schedule:', error);
        res.status(500).json({ message: 'Error retrieving schedule', error: error.message });
    }
};
exports.deleteReservation = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const account = await Account.findById(userId);
        const { id } = req.params;
        const reservations = await Reservation.find({ _id: id });

        if (!id) {
            return res.status(400).json({ message: 'Missing reservation ID' });
        }

        if (account.UserRole === 'Manager') {
            const deletedReservation = await Reservation.findByIdAndDelete(id);

            res.status(200).json({
                message: 'Reservation deleted successfully',
                deletedReservation
            });
        }
        else {
            return res.status(403).json({ message: 'Forbidden: You cannot delete this reservation' });

        }

    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Error deleting reservation', error: error.message });
    }
}