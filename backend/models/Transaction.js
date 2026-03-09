const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    property: { type: String, required: true },
    amount: { type: Number, required: true },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    receiverBank: String,
    receiverAccount: String,
    status: { type: String, enum: ['pending', 'verified', 'flagged', 'completed', 'rejected'], default: 'pending' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationMethod: { type: String, enum: ['phone', 'email', 'in-person', 'none'], default: 'none' },
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);