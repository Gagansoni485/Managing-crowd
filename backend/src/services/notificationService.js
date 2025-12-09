// Notification service for SMS/WhatsApp alerts
const twilio = require('twilio');

// Initialize Twilio client
let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log('✅ Twilio SMS service initialized');
} else {
  console.warn('⚠️ Twilio credentials not found. SMS service disabled.');
}

// Format phone number to E.164 format
const formatPhoneE164 = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If doesn't start with +, add country code
  if (!phoneNumber.startsWith('+')) {
    // Default to India (+91) if 10 digits, US (+1) if 11 digits starting with 1
    if (cleaned.length === 10) {
      cleaned = '+91' + cleaned; // India
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      cleaned = '+' + cleaned; // US/Canada
    } else if (cleaned.length === 12 && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned; // Already has country code
    } else {
      cleaned = '+91' + cleaned; // Default India
    }
  } else {
    cleaned = phoneNumber;
  }
  
  return cleaned;
};

// Send SMS notification
const sendSMS = async (phoneNumber, message) => {
  try {
    if (!twilioClient) {
      console.log(`[SMS DISABLED] Would send to ${phoneNumber}: ${message}`);
      return { success: false, error: 'Twilio not configured' };
    }

    // Format phone number to E.164
    const formattedPhone = formatPhoneE164(phoneNumber);
    
    console.log(`📱 Attempting to send SMS:`);
    console.log(`   From: ${process.env.TWILIO_PHONE_NUMBER}`);
    console.log(`   To: ${formattedPhone} (original: ${phoneNumber})`);
    console.log(`   Message: ${message.substring(0, 50)}...`);

    // Send actual SMS via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });
    
    console.log(`✅ SMS sent successfully!`);
    console.log(`   Message SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   To: ${result.to}`);
    
    return { success: true, messageSid: result.sid, message: 'SMS sent successfully', phone: formattedPhone };
  } catch (error) {
    console.error('❌ Error sending SMS:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   More Info: ${error.moreInfo}`);
    return { success: false, error: error.message, code: error.code };
  }
};

// Send WhatsApp notification
const sendWhatsApp = async (phoneNumber, message) => {
  try {
    if (!twilioClient) {
      console.log(`[WhatsApp DISABLED] Would send to ${phoneNumber}: ${message}`);
      return { success: false, error: 'Twilio not configured' };
    }

    // Send WhatsApp message via Twilio
    const result = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${phoneNumber}`
    });
    
    console.log(`✅ WhatsApp sent to ${phoneNumber}: ${message}`);
    
    return { success: true, messageSid: result.sid, message: 'WhatsApp message sent successfully' };
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error.message);
    return { success: false, error: error.message };
  }
};

// Send queue position update notification
const sendQueueUpdateNotification = async (user, queueInfo) => {
  const message = `Your queue position: ${queueInfo.position}. Estimated wait time: ${queueInfo.estimatedWaitTime} minutes.`;
  return await sendSMS(user.phone, message);
};

// Send emergency alert notification
const sendEmergencyAlert = async (user, emergencyType) => {
  const message = `Emergency alert: ${emergencyType}. Help is on the way. Location: ${user.location}`;
  return await sendSMS(user.phone, message);
};

// Send token confirmation notification
const sendTokenConfirmation = async (user, tokenInfo) => {
  let message = `🎟️ Booking Confirmed!

Token: ${tokenInfo.tokenNumber}
Temple: ${tokenInfo.templeName || 'N/A'}
Date: ${new Date(tokenInfo.visitDate).toLocaleDateString()}
Time: ${tokenInfo.timeSlot}
Visitors: ${tokenInfo.numberOfVisitors || 1}`;
  
  // Add queue info if auto-queued (same-day booking)
  if (tokenInfo.queuePosition) {
    message += `

🎯 Queue Status:
Position: #${tokenInfo.queuePosition}
Estimated Wait: ~${tokenInfo.estimatedWait || 0} mins

✅ You're automatically in queue!`;
  } else {
    message += `

📅 Visit on your scheduled date.`;
  }
  
  message += `

See you there! - Shankara Temple`;
  
  return await sendSMS(user.phone, message);
};

module.exports = {
  sendSMS,
  sendWhatsApp,
  sendQueueUpdateNotification,
  sendEmergencyAlert,
  sendTokenConfirmation,
  formatPhoneE164, // Export for testing
};
