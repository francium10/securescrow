const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
    stepId: { type: String, enum: ['submit', 'phone', 'dual', 'release'], required: true },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date, default: Date.now },
    notes: String,
    ip: String,
});

const wireVerificationSchema = new mongoose.Schema({
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, unique: true },
    steps: [stepSchema],
    status: { type: String, enum: ['pending', 'in_progress', 'authorized', 'rejected'], default: 'pending' },
    authorizedAt: Date,
    authorizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('WireVerification', wireVerificationSchema);