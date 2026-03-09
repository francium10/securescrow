const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    type: { type: String, enum: ['bec_attempt', 'spoofed_email', 'suspicious_wire', 'mfa_failure', 'unauthorized_access', 'domain_spoof'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    source: String,
    relatedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['open', 'investigating', 'resolved', 'dismissed'], default: 'open' },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);