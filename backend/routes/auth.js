const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { sendMFA } = require('../utils/email');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const { protect } = require('../middleware/auth');

const router = express.Router();
const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
        await User.create({ name, email, password, role });
        res.status(201).json({ message: 'Account created. Please log in.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/login  — step 1
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ message: 'Invalid email or password' });
        const code = generateOTP();
        user.mfaCode = code;
        user.mfaExpiry = getOTPExpiry(10);
        await user.save();
        await sendMFA(email, code);
        res.json({ message: 'MFA code sent to your email', mfaRequired: true, email });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/auth/verify-mfa  — step 2
router.post('/verify-mfa', async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.mfaCode !== code || new Date() > user.mfaExpiry)
            return res.status(401).json({ message: 'Invalid or expired MFA code' });
        user.mfaCode = undefined;
        user.mfaExpiry = undefined;
        user.lastLogin = new Date();
        await user.save();
        await ActivityLog.create({ user: user._id, action: 'User logged in', category: 'auth', ip: req.ip });
        res.json({
            token: signToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role, lastLogin: user.lastLogin },
        });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

// POST /api/auth/logout
router.post('/logout', protect, async (req, res) => {
    await ActivityLog.create({ user: req.user._id, action: 'User logged out', category: 'auth', ip: req.ip });
    res.json({ message: 'Logged out' });
});

module.exports = router;