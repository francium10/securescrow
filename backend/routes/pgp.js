const express = require('express');
const PGPKey = require('../models/PGPKey');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/pgp/my-keys  — get current user's stored public keys
router.get('/my-keys', protect, async (req, res) => {
    try {
        const k = await PGPKey.findOne({ user: req.user._id });
        res.json(k || null);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/pgp/store-keys  — store/update public keys for current user
router.post('/store-keys', protect, async (req, res) => {
    try {
        const { encPublicKey, sigPublicKey } = req.body;
        if (!encPublicKey || !sigPublicKey)
            return res.status(400).json({ message: 'Both encPublicKey and sigPublicKey are required' });
        const key = await PGPKey.findOneAndUpdate(
            { user: req.user._id },
            { encPublicKey, sigPublicKey },
            { upsert: true, new: true }
        );
        await ActivityLog.create({ user: req.user._id, action: 'Registered PGP public keys', category: 'system' });
        res.json({ message: 'PGP keys stored successfully', key });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/pgp/user/:userId  — get any user's public keys (for encryption)
router.get('/user/:userId', protect, async (req, res) => {
    try {
        const k = await PGPKey.findOne({ user: req.params.userId }).select('encPublicKey sigPublicKey user');
        if (!k) return res.status(404).json({ message: 'No PGP keys registered for this user' });
        res.json(k);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/pgp/all  — list all users with registered keys (admin)
router.get('/all', protect, async (req, res) => {
    try {
        const keys = await PGPKey.find().populate('user', 'name email role');
        res.json(keys);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;