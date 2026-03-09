const express = require('express');
const WireVerification = require('../models/WireVerification');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

const router = express.Router();
const STEP_ORDER = { submit: 0, phone: 1, dual: 2, release: 3 };
const STEP_IDS = ['submit', 'phone', 'dual', 'release'];

// GET /api/wire-policy/:txId  — get verification status for a transaction
router.get('/:txId', protect, async (req, res) => {
    try {
        const wv = await WireVerification.findOne({ transaction: req.params.txId })
            .populate('steps.completedBy', 'name email role')
            .populate('authorizedBy', 'name email');
        res.json(wv || { steps: [], status: 'pending' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/wire-policy/:txId/step  — complete a verification step
router.post('/:txId/step', protect, async (req, res) => {
    try {
        const { stepId, notes } = req.body;

        if (!STEP_IDS.includes(stepId))
            return res.status(400).json({ message: `Invalid step. Must be one of: ${STEP_IDS.join(', ')}` });

        let wv = await WireVerification.findOne({ transaction: req.params.txId });
        if (!wv) wv = new WireVerification({ transaction: req.params.txId, steps: [] });

        const completedIds = wv.steps.map(s => s.stepId);

        // Enforce step order
        const idx = STEP_ORDER[stepId];
        if (idx > 0) {
            const prevStep = STEP_IDS[idx - 1];
            if (!completedIds.includes(prevStep))
                return res.status(400).json({ message: `Step '${prevStep}' must be completed first` });
        }

        // Prevent duplicate completion
        if (completedIds.includes(stepId))
            return res.status(400).json({ message: `Step '${stepId}' has already been completed` });

        // Dual authorization: prevent same person completing both submit and dual
        if (stepId === 'dual') {
            const submitStep = wv.steps.find(s => s.stepId === 'submit');
            if (submitStep && submitStep.completedBy?.toString() === req.user._id.toString())
                return res.status(403).json({ message: 'Dual authorization requires a different officer than the submitter' });
        }

        wv.steps.push({ stepId, completedBy: req.user._id, completedAt: new Date(), notes, ip: req.ip });

        if (stepId === 'release') {
            wv.status = 'authorized';
            wv.authorizedAt = new Date();
            wv.authorizedBy = req.user._id;
            // Mark the transaction as verified
            await Transaction.findByIdAndUpdate(req.params.txId, {
                status: 'verified', verifiedBy: req.user._id, verificationMethod: 'phone',
            });
        } else {
            wv.status = 'in_progress';
        }

        await wv.save();
        await ActivityLog.create({
            user: req.user._id,
            action: `Completed wire verification step '${stepId}' for transaction ${req.params.txId}`,
            category: 'transaction',
            resourceId: req.params.txId,
            resourceType: 'Transaction',
        });

        res.json(wv);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/wire-policy/:txId/reject  — reject a transfer mid-process
router.post('/:txId/reject', protect, async (req, res) => {
    try {
        const wv = await WireVerification.findOneAndUpdate(
            { transaction: req.params.txId },
            { status: 'rejected' },
            { new: true, upsert: true }
        );
        await Transaction.findByIdAndUpdate(req.params.txId, { status: 'rejected' });
        await ActivityLog.create({
            user: req.user._id, action: `REJECTED wire transfer for transaction ${req.params.txId}. Reason: ${req.body.reason || 'Not specified'}`,
            category: 'transaction',
        });
        res.json(wv);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;