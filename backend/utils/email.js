const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendMFA = async (to, code) => {
    await transporter.sendMail({
        from: `"SecureEscrow Security" <${process.env.EMAIL_USER}>`,
        to,
        subject: '🔐 Your SecureEscrow Login Code',
        html: `
      <div style="font-family:Arial,sans-serif;max-width:460px;margin:auto;background:#050814;color:#fff;padding:32px;border-radius:12px;border:1px solid #00ffc822">
        <h2 style="color:#00ffc8;margin:0 0 16px">🔒 SecureEscrow</h2>
        <p style="margin:0 0 20px;color:#ccc">Your one-time verification code:</p>
        <div style="background:#0d1a3a;border:2px solid #00ffc8;border-radius:10px;padding:24px;text-align:center;font-size:42px;font-weight:800;letter-spacing:12px;color:#00ffc8">${code}</div>
        <p style="color:#666;font-size:13px;margin-top:20px">Expires in <strong style="color:#fff">10 minutes</strong>. If you didn't request this, contact your admin immediately.</p>
      </div>`,
    });
};

const sendAlertEmail = async (to, alert) => {
    const colours = { critical: '#ff2244', high: '#ff4466', medium: '#ff8800', low: '#ffcc00' };
    await transporter.sendMail({
        from: `"SecureEscrow Alerts" <${process.env.EMAIL_USER}>`,
        to,
        subject: `⚠️ [${alert.severity.toUpperCase()}] ${alert.title}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:460px;margin:auto;background:#050814;color:#fff;padding:32px;border-radius:12px;border:2px solid ${colours[alert.severity]}44">
        <h2 style="color:${colours[alert.severity]}">⚠️ Security Alert</h2>
        <p><strong>Type:</strong> ${alert.type.replace(/_/g, ' ').toUpperCase()}</p>
        <p><strong>Severity:</strong> <span style="color:${colours[alert.severity]}">${alert.severity.toUpperCase()}</span></p>
        <p><strong>Details:</strong> ${alert.description}</p>
        <p style="color:#666;font-size:13px">Log in to SecureEscrow to investigate this alert immediately.</p>
      </div>`,
    });
};

module.exports = { sendMFA, sendAlertEmail };