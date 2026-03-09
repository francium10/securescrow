const crypto = require('crypto');
const generateOTP = () => String(crypto.randomInt(100000, 999999));
const getOTPExpiry = (mins = 10) => new Date(Date.now() + mins * 60 * 1000);
module.exports = { generateOTP, getOTPExpiry };