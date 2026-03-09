const express = require('express');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const docs = await Document.find().sort({ createdAt: -1 })
            .populate('uploadedBy', 'name email').populate('transaction', 'transactionId property');
        res.json(docs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
    try {
        const doc = await Document.create({ ...req.body, uploadedBy: req.user._id });
        await ActivityLog.create({ user: req.user._id, action: `Uploaded document: ${doc.name}`, category: 'document' });
        res.status(201).json(doc);
    } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/access', protect, async (req, res) => {
    try {
        const doc = await Document.findByIdAndUpdate(req.params.id,
            { $push: { accessLog: { user: req.user._id, action: req.body.action || 'view', ip: req.ip } } },
            { new: true });
        await ActivityLog.create({ user: req.user._id, action: `${req.body.action || 'Viewed'} document: ${doc.name}`, category: 'document' });
        res.json({ message: 'Access logged' });
    } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;