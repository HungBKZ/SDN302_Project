// ...existing code...
const Coupon = require('../../models/Coupon');
const { Account } = require('../../models/Account');

exports.listCoupons = async (req, res) => {
    try {
        const { q } = req.query;
        const filter = { IsDeleted: { $ne: true } };
        if (q) filter.Description = { $regex: q, $options: 'i' };

        const coupons = await Coupon.find(filter).sort({ CreatedAt: -1 });
        return res.status(200).json(coupons);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Unable to load coupon list.' });
    }
};

exports.getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ _id: req.params.id, IsDeleted: { $ne: true } });
        if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });

        const result = coupon.toObject();
        result.IsExpired = coupon.ExpirationDate ? new Date() > coupon.ExpirationDate : false;
        return res.status(200).json(result);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching coupon.' });
    }
};

async function checkManagerOrAdmin(req, res) {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized: Missing user info' });
        return null;
    }
    const account = await Account.findById(userId);
    if (!account || !['Admin', 'Manager'].includes(account.UserRole)) {
        res.status(403).json({ message: 'Forbidden: Admin or Manager only' });
        return null;
    }
    return account;
}

exports.createCoupon = async (req, res) => {
    try {
        const account = await checkManagerOrAdmin(req, res);
        if (!account) return;

        const errors = [];
        const { DiscountAmount, ExpirationDate, Description } = req.body;

        if (typeof DiscountAmount === 'undefined') {
            errors.push({ field: 'DiscountAmount', message: 'DiscountAmount is required.' });
        } else if (isNaN(Number(DiscountAmount)) || Number(DiscountAmount) < 0) {
            errors.push({ field: 'DiscountAmount', message: 'DiscountAmount must be >= 0.' });
        }

        if (!ExpirationDate) {
            errors.push({ field: 'ExpirationDate', message: 'ExpirationDate is required.' });
        } else {
            const d = new Date(ExpirationDate);
            if (isNaN(d.getTime())) errors.push({ field: 'ExpirationDate', message: 'Invalid date.' });
        }

        if (errors.length) return res.status(400).json({ errors });

        const coupon = new Coupon({
            DiscountAmount: Number(DiscountAmount),
            ExpirationDate: new Date(ExpirationDate),
            Description: Description ? String(Description).trim() : undefined,
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        });

        const saved = await coupon.save();
        return res.status(201).json({message: 'Coupon created.', coupon: saved });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error creating coupon.' });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const account = await checkManagerOrAdmin(req, res);
        if (!account) return;

        const errors = [];
        const payload = {};

        if ('DiscountAmount' in req.body) {
            if (isNaN(Number(req.body.DiscountAmount)) || Number(req.body.DiscountAmount) < 0) {
                errors.push({ field: 'DiscountAmount', message: 'DiscountAmount must be >= 0.' });
            } else payload.DiscountAmount = Number(req.body.DiscountAmount);
        }

        if ('ExpirationDate' in req.body) {
            const d = new Date(req.body.ExpirationDate);
            if (isNaN(d.getTime())) errors.push({ field: 'ExpirationDate', message: 'Invalid date.' });
            else payload.ExpirationDate = d;
        }

        if ('Description' in req.body) payload.Description = req.body.Description ? String(req.body.Description).trim() : '';

        if (errors.length) return res.status(400).json({ errors });

        payload.UpdatedAt = new Date();

        const updated = await Coupon.findOneAndUpdate(
            { _id: req.params.id, IsDeleted: { $ne: true } },
            payload,
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: 'Coupon not found.' });
        return res.status(200).json({ message: 'Coupon updated.', coupon: updated });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error updating coupon.' });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const account = await checkManagerOrAdmin(req, res);
        if (!account) return;

        const updated = await Coupon.findOneAndUpdate(
            { _id: req.params.id, IsDeleted: { $ne: true } },
            { IsDeleted: true, UpdatedAt: new Date() },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Coupon not found.' });
        return res.status(200).json({ message: 'Coupon deleted (soft).' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error deleting coupon.' });
    }
};
