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
        const { status } = req.body;
        const account = await Account.findById(userId);

        if (!account || (account.UserRole !== 'Manager')) {
            return res.status(403).json({ message: 'Forbidden: Managers and Customers only' });
        }
        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        const updateStatus = await Reservation.findByIdAndUpdate(id, { status: status }, { new: true });
        await updateStatus.save();
        res.status(200).json({
            message: 'Reservation status updated successfully',
            reservation: updateStatus
        });

    } catch (error) {
        console.error('Error updating reservation status:', error);
        res.status(500).json({ message: 'Error updating reservation status', error: error.message });
    }
}

