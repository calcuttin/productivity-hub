# 📧 Resend Email Integration Setup Guide

## What is Resend?

Resend is a modern email API designed for developers. It offers:
- **Simple API** with SDKs for multiple languages
- **High deliverability** (99.9%+ delivery rate)
- **Real-time analytics** and webhooks
- **Free tier**: 3,000 emails/month
- **Developer-friendly** pricing and features

## 🚀 Quick Setup

### 1. Sign Up for Resend
1. Visit [resend.com](https://resend.com)
2. Create a free account
3. Verify your email address

### 2. Get Your API Key
1. Go to your Resend dashboard
2. Navigate to "API Keys" in the sidebar
3. Click "Create API Key"
4. Give it a name (e.g., "Productivity Hub")
5. Copy the API key (starts with `re_`)

### 3. Install Resend SDK
```bash
npm install resend
```

### 4. Configure Environment Variables
Add to your `.env` file:
```env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Verify Your Domain (Optional but Recommended)
For production, you should verify your domain:
1. Go to "Domains" in your Resend dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Follow the DNS verification steps
4. Update the `from` email in `src/lib/email.ts` to use your verified domain

## 📧 Email Templates

The app includes several pre-built email templates:

### Project Due Reminder
- **Trigger**: When a project is approaching its due date
- **Template**: `createProjectDueEmail()`
- **Features**: Due date, time remaining, direct link to project

### Workout Reminder
- **Trigger**: Daily workout reminders
- **Template**: `createWorkoutReminderEmail()`
- **Features**: Workout name, current time, direct link to workout page

### Todo Reminder
- **Trigger**: Todo item reminders
- **Template**: `createTodoReminderEmail()`
- **Features**: Todo title, reminder time, direct link to todos

### Welcome Email
- **Trigger**: New user registration
- **Template**: `createWelcomeEmail()`
- **Features**: Getting started guide, app features overview

## 🔧 Integration Points

### 1. User Preferences
Users can control email notifications in their profile:
- **Email Notifications**: Enable/disable all email notifications
- **Browser Notifications**: Enable/disable browser notifications
- **Reminder Notifications**: Enable/disable reminder notifications

### 2. Notification Triggers
Emails are sent automatically when:
- Projects are due soon
- Workout reminders are scheduled
- Todo reminders are triggered
- New users sign up (welcome email)

### 3. Fallback System
If email sending fails, the system:
- Logs the error to console
- Falls back to console logging
- Continues with other notification types

## 🧪 Testing

### Test Email Sending
```bash
# Test the notification system
npx tsx src/scripts/test-notifications.ts
```

### Test Individual Email Templates
```bash
# Test project due reminder
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "project_due", "projectName": "Test Project", "dueDate": "2024-01-15"}'
```

## 📊 Monitoring

### Resend Dashboard
Monitor your email performance:
- **Delivery Rate**: Track successful deliveries
- **Open Rate**: See how many emails are opened
- **Click Rate**: Monitor link clicks
- **Bounce Rate**: Track failed deliveries
- **Spam Reports**: Monitor spam complaints

### Webhooks (Optional)
Set up webhooks to get real-time events:
1. Go to "Webhooks" in Resend dashboard
2. Add your webhook URL: `https://yourapp.com/api/webhooks/resend`
3. Select events: `email.delivered`, `email.opened`, `email.clicked`

## 💰 Pricing

### Free Tier
- **3,000 emails/month**
- Perfect for development and small apps
- All features included

### Pro Plan ($20/month)
- **50,000 emails/month**
- Advanced analytics
- Priority support

### Business Plan ($99/month)
- **300,000 emails/month**
- Custom domains
- Advanced features

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Verify your domain** for better deliverability
4. **Monitor bounce rates** and spam reports
5. **Implement rate limiting** to prevent abuse

## 🚨 Troubleshooting

### Common Issues

**"Invalid API Key" Error**
- Check that your API key is correct
- Ensure the key starts with `re_`
- Verify the key is active in your Resend dashboard

**"Domain Not Verified" Error**
- Verify your domain in Resend dashboard
- Check DNS records are correct
- Wait for DNS propagation (can take up to 24 hours)

**"Email Not Delivered"**
- Check spam folder
- Verify recipient email is valid
- Check Resend dashboard for delivery status
- Review bounce reports

### Getting Help
- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: [resend.com/support](https://resend.com/support)
- **Community**: [GitHub Discussions](https://github.com/resendlabs/resend/discussions)

## 🎯 Next Steps

1. **Set up Resend account** and get API key
2. **Install the SDK** and configure environment variables
3. **Test email sending** with the provided scripts
4. **Customize email templates** to match your brand
5. **Monitor performance** in Resend dashboard
6. **Set up webhooks** for advanced tracking (optional)

## 📝 Example Usage

```typescript
import { sendProjectDueReminder } from '@/lib/notifications';

// Send a project due reminder
await sendProjectDueReminder(
  'user-id-here',
  'Final Assignment',
  new Date('2024-01-15')
);
```

This will:
1. Check if the user has email notifications enabled
2. Send a beautifully formatted email if enabled
3. Log the result to console
4. Handle any errors gracefully 