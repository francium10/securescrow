require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Alert = require('../models/Alert');
const Document = require('../models/Document');
const ActivityLog = require('../models/ActivityLog');

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([User, Transaction, Alert, Document, ActivityLog].map(m => m.deleteMany()));

    const admin = await User.create({ name: 'Clive Admin', email: 'Rythmsociety93@gmail.com', password: 'Admin@123', role: 'admin' });
    const agent1 = await User.create({ name: 'Ashly Magayisa', email: 'ashymagayisa15@gmail.com', password: 'sturridge', role: 'agent' });
    const agent2 = await User.create({ name: 'Shingy Rodriguez', email: 'shingayimuropah@gmail.com', password: 'Password', role: 'agent' });

    const tx1 = await Transaction.create({ transactionId: 'TXN-2025-001', property: '123 Oak Street, Miami FL', amount: 485000, sender: 'John & Mary Smith', receiver: 'First National Title Co.', receiverBank: 'Chase Bank', receiverAccount: '****4521', status: 'verified', verifiedBy: admin._id, verificationMethod: 'phone', riskScore: 12, createdBy: agent1._id });
    const tx2 = await Transaction.create({ transactionId: 'TXN-2025-002', property: '456 Maple Ave, Orlando FL', amount: 320000, sender: 'David Park', receiver: 'Sunshine Escrow LLC', receiverBank: 'Wells Fargo', receiverAccount: '****8832', status: 'pending', riskScore: 45, createdBy: agent1._id });
    const tx3 = await Transaction.create({ transactionId: 'TXN-2025-003', property: '789 Pine Blvd, Tampa FL', amount: 675000, sender: 'Horizon Properties Inc.', receiver: 'Coastal Title Group', receiverBank: 'Bank of America', receiverAccount: '****1193', status: 'flagged', riskScore: 88, notes: 'Receiver bank account changed 24hrs before closing', createdBy: agent2._id });
    const tx4 = await Transaction.create({ transactionId: 'TXN-2025-004', property: '22 Beachfront Dr, Naples FL', amount: 1200000, sender: 'Robert & Susan White', receiver: 'Gulf Coast Closing', receiverBank: 'SunTrust', receiverAccount: '****7701', status: 'pending', riskScore: 30, createdBy: agent2._id });

    await Alert.create([
        { type: 'bec_attempt', severity: 'critical', title: 'BEC Attack Detected — TXN-2025-003', description: 'Spoofed email from coastal-title-grp.com requesting wire to new account. IP traced to Eastern Europe.', source: 'coastal-title-grp.com', relatedTransaction: tx3._id, status: 'open' },
        { type: 'suspicious_wire', severity: 'high', title: 'Wire Instruction Changed 24hrs Before Closing', description: 'Bank account number modified for TXN-2025-003. Change originated from unverified email. Out-of-band verification required.', relatedTransaction: tx3._id, status: 'investigating' },
        { type: 'mfa_failure', severity: 'medium', title: 'Multiple MFA Failures — agent@securescrow.com', description: 'Three consecutive MFA failures from IP 185.220.101.45. Possible credential stuffing.', relatedUser: agent1._id, status: 'open' },
        { type: 'domain_spoof', severity: 'high', title: 'Domain Spoofing Attempt Intercepted', description: 'Email from first-national-title.co (not .com) with subject: "Updated wire instructions for 123 Oak Street".', source: 'first-national-title.co', relatedTransaction: tx1._id, status: 'resolved' },
        { type: 'spoofed_email', severity: 'medium', title: 'Suspicious Email Header Detected', description: 'Reply-To header mismatch on email claiming to be from Sunshine Escrow LLC.', relatedTransaction: tx2._id, status: 'open' },
    ]);

    await Document.create([
        { name: 'Purchase_Agreement_TXN001.pdf', type: 'contract', transaction: tx1._id, uploadedBy: agent1._id, fileSize: 245000, encrypted: true, pgpSignature: 'PGP-A1B2C3D4', status: 'active' },
        { name: 'Wire_Instructions_TXN001_SIGNED.pdf', type: 'wire_instruction', transaction: tx1._id, uploadedBy: admin._id, fileSize: 48000, encrypted: true, pgpSignature: 'PGP-E5F6G7H8', status: 'active' },
        { name: 'Title_Deed_TXN002.pdf', type: 'deed', transaction: tx2._id, uploadedBy: agent2._id, fileSize: 180000, encrypted: true, status: 'active' },
        { name: 'Wire_Instructions_TXN003_MODIFIED.pdf', type: 'wire_instruction', transaction: tx3._id, uploadedBy: agent2._id, fileSize: 52000, encrypted: true, status: 'flagged' },
        { name: 'ID_Verification_TXN004.pdf', type: 'id_verification', transaction: tx4._id, uploadedBy: agent1._id, fileSize: 95000, encrypted: true, status: 'active' },
    ]);

    await ActivityLog.create([
        { user: admin._id, action: 'Verified TXN-2025-001 via phone call', category: 'transaction' },
        { user: agent1._id, action: 'Uploaded Purchase Agreement for TXN-2025-001', category: 'document' },
        { user: agent2._id, action: 'Flagged TXN-2025-003 for suspicious wire change', category: 'transaction' },
        { user: admin._id, action: 'Opened investigation on BEC alert for TXN-2025-003', category: 'alert' },
        { user: agent1._id, action: 'User logged in successfully', category: 'auth' },
        { user: admin._id, action: 'User logged in successfully', category: 'auth' },
        { user: agent2._id, action: 'Uploaded ID Verification for TXN-2025-004', category: 'document' },
    ]);

    console.log('\n✅ Seed complete!\n');
    console.log('   👤 Admin : admin@securescrow.com / Admin@123');
    console.log('   👤 Agent : agent@securescrow.com / Agent@123\n');
    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });