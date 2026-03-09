const express = require('express');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const { limit = 50, category } = req.query;
        const q = category ? { category } : {};
        const logs = await ActivityLog.find(q).sort({ createdAt: -1 }).limit(Number(limit))
            .populate('user', 'name email role');
        res.json(logs);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;