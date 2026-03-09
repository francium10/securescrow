const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    category: { type: String, enum: ['auth', 'transaction', 'document', 'alert', 'system'], default: 'system' },
    details: String,
    ip: String,
    resourceId: String,
    resourceType: String,
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);