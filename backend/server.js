require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/pgp', require('./routes/pgp'));
app.use('/api/wire-policy', require('./routes/wirePolicy'));

app.get('/api/health', (_, res) => res.json({ status: 'OK', app: 'SecureEscrow API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔐 SecureEscrow API running on http://localhost:${PORT}`));