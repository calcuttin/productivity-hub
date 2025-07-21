import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(data: EmailData) {
  try {
    const result = await resend.emails.send({
      from: data.from || 'notifications@yourdomain.com',
      to: [data.to],
      subject: data.subject,
      html: data.html,
    });

    console.log('📧 Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Pre-built email templates
export function createProjectDueEmail(projectName: string, dueDate: Date, userName: string) {
  return {
    subject: `Project Due Soon: ${projectName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Project Due Soon</h2>
        <p>Hi ${userName},</p>
        <p>This is a friendly reminder that your project <strong>${projectName}</strong> is due on <strong>${dueDate.toLocaleDateString()}</strong>.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Project Details:</h3>
          <p><strong>Project:</strong> ${projectName}</p>
          <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
          <p><strong>Time Remaining:</strong> ${Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/projects" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Project</a>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          Your Productivity Hub Team
        </p>
      </div>
    `
  };
}

export function createWorkoutReminderEmail(workoutName: string, userName: string) {
  return {
    subject: `Workout Reminder: ${workoutName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Workout Time!</h2>
        <p>Hi ${userName},</p>
        <p>It's time for your workout: <strong>${workoutName}</strong></p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Today's Workout:</h3>
          <p><strong>Workout:</strong> ${workoutName}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/workout" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Workout</a>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Stay strong!<br>
          Your Productivity Hub Team
        </p>
      </div>
    `
  };
}

export function createTodoReminderEmail(todoTitle: string, userName: string) {
  return {
    subject: `Todo Reminder: ${todoTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Todo Reminder</h2>
        <p>Hi ${userName},</p>
        <p>Don't forget to complete: <strong>${todoTitle}</strong></p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc2626;">Todo Item:</h3>
          <p><strong>Task:</strong> ${todoTitle}</p>
          <p><strong>Reminder Time:</strong> ${new Date().toLocaleTimeString()}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/todos" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Todos</a>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Stay productive!<br>
          Your Productivity Hub Team
        </p>
      </div>
    `
  };
}

export function createWelcomeEmail(userName: string) {
  return {
    subject: 'Welcome to Productivity Hub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Productivity Hub!</h2>
        <p>Hi ${userName},</p>
        <p>Welcome to Productivity Hub! We're excited to help you stay organized and productive.</p>
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2563eb;">Getting Started:</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Create your first project</li>
            <li>Set up your workout routine</li>
            <li>Add some todos</li>
            <li>Customize your profile settings</li>
          </ul>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Get Started</a>
        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          Happy productivity!<br>
          Your Productivity Hub Team
        </p>
      </div>
    `
  };
} 