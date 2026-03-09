const express = require('express');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Document = require('../models/Document');
const Alert = require('../models/Alert');
const ActivityLog = require('../models/ActivityLog');

const router = express.Router();

router.get('/summary', protect, async (req, res) => {
    try {
        const [
            totalTransactions, pendingTransactions, flaggedTransactions,
            openAlerts, criticalAlerts, totalDocuments,
            recentAlerts, recentTransactions, recentDocuments, recentActivity,
        ] = await Promise.all([
            Transaction.countDocuments(),
            Transaction.countDocuments({ status: 'pending' }),
            Transaction.countDocuments({ status: 'flagged' }),
            Alert.countDocuments({ status: { $in: ['open', 'investigating'] } }),
            Alert.countDocuments({ status: { $in: ['open', 'investigating'] }, severity: 'critical' }),
            Document.countDocuments(),
            Alert.find({ status: { $in: ['open', 'investigating'] } }).sort({ createdAt: -1 }).limit(5)
                .populate('relatedTransaction', 'transactionId property'),
            Transaction.find().sort({ createdAt: -1 }).limit(6)
                .populate('verifiedBy', 'name').populate('createdBy', 'name'),
            Document.find().sort({ createdAt: -1 }).limit(5)
                .populate('uploadedBy', 'name email').populate('transaction', 'transactionId'),
            ActivityLog.find().sort({ createdAt: -1 }).limit(10)
                .populate('user', 'name email role'),
        ]);
        res.json({ stats: { totalTransactions, pendingTransactions, flaggedTransactions, openAlerts, criticalAlerts, totalDocuments }, recentAlerts, recentTransactions, recentDocuments, recentActivity });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;