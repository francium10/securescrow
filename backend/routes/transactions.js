const express = require('express');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const q = status ? { status } : {};
        const txs = await Transaction.find(q).sort({ createdAt: -1 })
            .limit(limit * 1).skip((page - 1) * limit)
            .populate('verifiedBy createdBy', 'name email');
        res.json({ transactions: txs, total: await Transaction.countDocuments(q) });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
    try {
        const tx = await Transaction.create({ ...req.body, createdBy: req.user._id });
        await ActivityLog.create({ user: req.user._id, action: `Created transaction ${tx.transactionId}`, category: 'transaction', resourceId: tx._id });
        res.status(201).json(tx);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/verify', protect, async (req, res) => {
    try {
        const tx = await Transaction.findByIdAndUpdate(req.params.id,
            { status: 'verified', verifiedBy: req.user._id, verificationMethod: req.body.method || 'phone' },
            { new: true });
        await ActivityLog.create({ user: req.user._id, action: `Verified transaction ${tx.transactionId}`, category: 'transaction' });
        res.json(tx);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/flag', protect, async (req, res) => {
    try {
        const tx = await Transaction.findByIdAndUpdate(req.params.id,
            { status: 'flagged', notes: req.body.reason },
            { new: true });
        await ActivityLog.create({ user: req.user._id, action: `Flagged transaction ${tx.transactionId}: ${req.body.reason}`, category: 'transaction' });
        res.json(tx);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;