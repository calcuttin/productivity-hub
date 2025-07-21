import 'dotenv/config';
import { sendEmail, createWelcomeEmail } from '../lib/email';

console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY);

async function testResendEmail() {
  console.log('🧪 Testing Resend Email Integration...\n');

  try {
    // Test 1: Simple email
    console.log('1. Testing simple email...');
    await sendEmail({
      to: 'calcuttin@gmail.com', // Replace with your email
      subject: 'Test Email from Productivity Hub',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Email</h2>
          <p>This is a test email from your Productivity Hub app!</p>
          <p>If you received this, Resend is working correctly. 🎉</p>
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    console.log('✅ Simple email test completed\n');

    // Test 2: Welcome email template
    console.log('2. Testing welcome email template...');
    const welcomeEmail = createWelcomeEmail('Test User');
    await sendEmail({
      to: 'calcuttin@gmail.com', // Replace with your email
      subject: welcomeEmail.subject,
      html: welcomeEmail.html,
    });

    console.log('✅ Welcome email template test completed\n');

    console.log('🎉 All email tests completed successfully!');
    console.log('📧 Check your email inbox for the test messages.');

  } catch (error) {
    console.error('❌ Error testing Resend email:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n🔑 API Key Issue:');
        console.log('- Make sure your RESEND_API_KEY is set in .env.local');
        console.log('- Verify the API key starts with "re_"');
        console.log('- Check that the API key is active in your Resend dashboard');
      } else if (error.message.includes('domain')) {
        console.log('\n🌐 Domain Issue:');
        console.log('- You may need to verify your domain in Resend dashboard');
        console.log('- For testing, you can use the default Resend domain');
      }
    }
  }
}

// Run the test
testResendEmail(); 