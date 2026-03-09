const mongoose = require('mongoose');

const pgpKeySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    encPublicKey: { type: String, required: true },  // RSA-OAEP public key (base64)
    sigPublicKey: { type: String, required: true },  // RSA-PSS public key (base64)
    fingerprint: String,
}, { timestamps: true });

module.exports = mongoose.model('PGPKey', pgpKeySchema);