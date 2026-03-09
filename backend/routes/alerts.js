const express = require('express');
const Alert = require('../models/Alert');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const { status, severity } = req.query;
        const q = {};
        if (status) q.status = status;
        if (severity) q.severity = severity;
        const alerts = await Alert.find(q).sort({ createdAt: -1 })
            .populate('relatedUser', 'name email').populate('relatedTransaction', 'transactionId property');
        res.json(alerts);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
    try {
        const alert = await Alert.create(req.body);
        await ActivityLog.create({ user: req.user._id, action: `Created alert: ${alert.title}`, category: 'alert' });
        res.status(201).json(alert);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/resolve', protect, async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(req.params.id,
            { status: 'resolved', resolvedBy: req.user._id, resolvedAt: new Date() },
            { new: true });
        await ActivityLog.create({ user: req.user._id, action: `Resolved alert: ${alert.title}`, category: 'alert' });
        res.json(alert);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;