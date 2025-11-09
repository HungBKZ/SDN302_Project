const { Account } = require('../../models/Account');
const Payment = require('../../models/Payment');
const Order = require('../../models/Order');



exports.viewHistoryOrder = async (req, res) => {
    try {
        const userId = req.user?._id;
        const account = await Account.findById(userId);

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        if (account.UserRole === 'Customer') {
            let payments = await Payment.find()
                .populate({
                    path: 'OrderId',
                    select: 'UserId OrderDate Total FinalPrice OrderStatus',
                    populate: {
                        path: 'UserId',
                        select: 'Name UserEmail UserPhone'
                    }
                });

            payments = payments.filter(p =>
                p.OrderId?.UserId?._id.toString() === userId.toString()
            );
            res.status(200).json({ payments });
        }
        else if (account.UserRole === 'Manager') {
            const payments = await Payment.find()
                .populate({
                    path: 'OrderId',
                    select: 'UserId OrderDate Total FinalPrice OrderStatus',
                    populate: {
                        path: 'UserId',
                        select: 'Name UserEmail UserPhone'
                    }
                });
            res.status(200).json({ payments });

        }
        else {
            return res.status(403).json({ message: 'Forbidden: You do not have access to view order history' });
        }

    } catch (error) {
        console.error('Error viewing order history:', error);
        res.status(500).json({ message: 'Error viewing order history', error: error.message });
    }
};
