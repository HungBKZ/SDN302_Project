const Order = require('../../models/Order');
const { Account } = require('../../models/Account');


exports.orderDetail = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const account = await Account.findById(userId);

        const order = await Order.findOne({ UserId: userId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        if (account.UserRole === 'Customer') {
            const order = await Order.find({ UserId: userId }).populate({
                path: 'UserId',
                select: 'Name UserEmail UserPhone'
            });
            return res.status(200).json({ order });
        }
        else if (account.UserRole === 'Manager') {
            const order = await Order.find();
            return res.status(200).json({ order });
        }
        else {
            return res.status(403).json({ message: 'Forbidden: You do not have access to view order details' });
        }

    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: 'Error fetching order details', error: error.message });
    }
}