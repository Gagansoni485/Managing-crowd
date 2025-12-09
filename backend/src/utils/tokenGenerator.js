const crypto = require('crypto');
const QRCode = require('qrcode');

// Generate unique token number
const generateTokenNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `TKN${date}${random}`;
};

// Generate QR code data (JSON payload)
const generateQRData = (tokenInfo) => {
  return JSON.stringify({
    tokenNumber: tokenInfo.tokenNumber,
    userId: tokenInfo.userId,
    templeId: tokenInfo.templeId,
    visitDate: tokenInfo.visitDate,
    timeSlot: tokenInfo.timeSlot,
    numberOfVisitors: tokenInfo.numberOfVisitors,
    timestamp: Date.now(),
  });
};

// Generate QR code as base64 image
const generateQRCodeImage = async (tokenInfo) => {
  try {
    const qrData = generateQRData(tokenInfo);
    // Generate QR code as data URL (base64)
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

// Validate token
const validateToken = (tokenNumber) => {
  // Check if token format is valid
  const tokenPattern = /^TKN\d{8}[A-F0-9]{4}$/;
  return tokenPattern.test(tokenNumber);
};

// Generate parking token
const generateParkingToken = (slotNumber, zone) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `PARK${zone}${slotNumber}${timestamp}`;
};

module.exports = {
  generateTokenNumber,
  generateQRData,
  generateQRCodeImage,
  validateToken,
  generateParkingToken,
};
