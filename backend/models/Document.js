const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['contract', 'deed', 'wire_instruction', 'id_verification', 'other'], default: 'other' },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileSize: Number,
    encrypted: { type: Boolean, default: true },
    pgpSignature: String,
    accessLog: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, enum: ['view', 'download', 'upload', 'delete'] },
        timestamp: { type: Date, default: Date.now },
        ip: String,
    }],
    status: { type: String, enum: ['active', 'archived', 'flagged'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);