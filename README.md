<div align="center">

# 🔒 SecureEscrow

**AI-Powered Real Estate Wire Fraud Prevention Toolkit**

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20MFA-000000?style=flat-square&logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-MIT-00ffc8?style=flat-square)

*Preventing Business Email Compromise (BEC) in real estate wire transfers through PGP encryption, multi-factor authentication, AI risk scoring, and enforced verification workflows.*

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **PGP Encryption Suite** | RSA-2048 key generation, hybrid AES-256-GCM encryption, RSA-PSS document signing & verification |
| 🛡️ **BEC Threat Detection** | AI risk scoring (0–100) flags suspicious wire instructions in real time |
| 📲 **Multi-Factor Authentication** | Two-step login — password + email OTP via Nodemailer |
| 📋 **Wire Transfer Verification Policy** | Enforced 4-step workflow: Submit → Phone Verify → Dual Auth → Release |
| 📁 **Secure Document Exchange** | Tamper-evident document vault with full access audit trail |
| 👥 **Role-Based Access** | Admin, Agent, and Viewer roles with separate permissions |
| ⚡ **Real-Time Alerts** | Critical BEC alerts, domain spoofing detection, MFA failure tracking |
| 📊 **Live Dashboard** | Stats, recent transactions, document activity, team activity log |

---

## 🖥️ Tech Stack

```
Frontend   React 18 · Vite · Tailwind CSS · React Router
Backend    Node.js · Express · MongoDB (Mongoose) · JWT
Auth       bcryptjs · Nodemailer · Gmail App Password
Crypto     Web Crypto API (RSA-OAEP, AES-GCM, RSA-PSS)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))
- Gmail account with [App Password](https://support.google.com/accounts/answer/185833) enabled

### 1 — Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/securescrow.git
cd securescrow
```

### 2 — Configure environment
```bash
cd backend
cp .env.example .env
```
Edit `.env` with your values:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/securescrow
JWT_SECRET=your_super_secret_32char_key
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16char_app_password
CLIENT_URL=http://localhost:5173
```

### 3 — Install & seed
```bash
# Backend
cd backend && npm install && npm run seed

# Frontend (new terminal)
cd frontend && npm install
```

### 4 — Run
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@securescrow.com` | `Admin@123` |
| Agent | `agent@securescrow.com` | `Agent@123` |

> MFA code is printed to the backend terminal during development.

---

## 📁 Project Structure

```
securescrow/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── middleware/       # JWT auth guard
│   ├── models/          # 7 Mongoose schemas
│   ├── routes/          # 8 Express route files
│   └── utils/           # Email, OTP, seed helpers
└── frontend/
    └── src/
        ├── api/         # Axios client
        ├── context/     # Auth state
        └── pages/       # Login, Dashboard, PGP, Wire Policy
```

---

## 🔐 Security Architecture

```
Login ──► Password (bcrypt) ──► MFA OTP Email ──► JWT Token
                                                        │
Wire Transfer ──► AI Risk Score ──► 4-Step Workflow ──► Audit Log
                                         │
                              PGP Sign ──┘── Dual Auth ── Release
```

---

## 📸 Screenshots

> *Dashboard, PGP Encryption Suite, Wire Transfer Verification Policy — Add screenshots here*

---

## 📄 License

MIT © 2025 SecureEscrow

---

<div align="center">
  Built to protect real estate transactions from Business Email Compromise (BEC) fraud.<br/>
  <strong>Aligned with:</strong> FBI IC3 BEC Guidelines · CFPB RESPA · ALTA Best Practices Pillar 4
</div>