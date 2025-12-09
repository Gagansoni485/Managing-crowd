// Test SMS sending with Twilio
require('dotenv').config();
const { sendSMS, formatPhoneE164 } = require('./src/services/notificationService');

async function testSMS() {
  console.log('\n📱 SMS Test Script\n');
  console.log('='.repeat(50));
  
  // Check environment variables
  console.log('\n✓ Environment Check:');
  console.log(`  TWILIO_ACCOUNT_SID: ${process.env.TWILIO_ACCOUNT_SID ? '✓ Set' : '✗ Missing'}`);
  console.log(`  TWILIO_AUTH_TOKEN: ${process.env.TWILIO_AUTH_TOKEN ? '✓ Set' : '✗ Missing'}`);
  console.log(`  TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER || '✗ Missing'}`);
  
  // Get phone number from command line or use default
  const testPhone = process.argv[2];
  
  if (!testPhone) {
    console.log('\n❌ Error: Please provide a phone number');
    console.log('\nUsage:');
    console.log('  node test-sms.js +919876543210');
    console.log('  node test-sms.js 9876543210');
    console.log('  node test-sms.js +12345678901');
    process.exit(1);
  }
  
  console.log('\n✓ Phone Number Format:');
  console.log(`  Input: ${testPhone}`);
  const formatted = formatPhoneE164(testPhone);
  console.log(`  Formatted: ${formatted}`);
  
  // Test message
  const testMessage = '🎟️ Test from Shankara Temple System!\n\nThis is a test SMS to verify Twilio integration.\n\nIf you receive this, SMS is working! ✅';
  
  console.log('\n📤 Sending test SMS...\n');
  
  // Send SMS
  const result = await sendSMS(testPhone, testMessage);
  
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Result:');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.success) {
    console.log('\n✅ SUCCESS! Check your phone for the message.');
    console.log('\n💡 Tips:');
    console.log('  - Check your SMS inbox');
    console.log('  - Message may take 1-2 minutes to arrive');
    console.log('  - For Twilio trial: Number must be verified in console');
    console.log('  - Check Twilio logs: https://console.twilio.com/us1/monitor/logs/sms');
  } else {
    console.log('\n❌ FAILED to send SMS');
    console.log('\n🔧 Troubleshooting:');
    
    if (result.code === 21211) {
      console.log('  ERROR 21211: Invalid phone number');
      console.log('  → Check number format (must be E.164: +[country][number])');
    } else if (result.code === 21608) {
      console.log('  ERROR 21608: Unverified number (Trial Account)');
      console.log('  → Verify your number at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
    } else if (result.code === 20003) {
      console.log('  ERROR 20003: Authentication failed');
      console.log('  → Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
    } else {
      console.log(`  → Check error details above`);
    }
    
    console.log('\n📚 Resources:');
    console.log('  - Twilio Console: https://console.twilio.com');
    console.log('  - Error Codes: https://www.twilio.com/docs/api/errors');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
}

testSMS().catch(console.error);
