// src/lib/mailer.ts
// Robust institutional mailer for account creation, admin alerts, and notifications
import nodemailer from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  if (!user || !pass) {
    // Development fallback mock transport so requests never crash
    console.warn("[Mailer] SMTP credentials (SMTP_USER, SMTP_PASS) not set. Operating in local diagnostic mode.");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

/**
 * Send welcome email to user upon signup
 */
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  const fromName = process.env.EMAIL_FROM_NAME || "SkillNova Platform";
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@skillnova.edu";

  const mailOptions: SendMailOptions = {
    to: userEmail,
    subject: `Welcome to SkillNova, ${userName}! 🎓`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="background: linear-gradient(to right, #a855f7, #6366f1, #06b6d4); -webkit-background-clip: text; color: transparent; font-size: 28px; margin: 0;">SkillNova</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Empowering Students & Instructors</p>
        </div>
        <div style="background-color: #111827; padding: 24px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
          <h2 style="color: #f1f5f9; font-size: 18px; margin-top: 0;">Hello ${userName},</h2>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Your SkillNova student account has been successfully created. You can now access live classroom sessions, enrolled courses, doubts resolution, and peer coding workshops.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" style="background: linear-gradient(to right, #9333ea, #4f46e5, #0891b2); color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Go to SkillNova Dashboard</a>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">If you did not create this account, please contact support immediately.</p>
        </div>
      </div>
    `,
    text: `Hello ${userName}, welcome to SkillNova! Your account is active. Log in at: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`,
  };

  const client = getTransporter();
  if (client) {
    try {
      await client.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        ...mailOptions,
      });
      console.log(`[Mailer] Welcome email sent to ${userEmail}`);
    } catch (e: any) {
      console.error(`[Mailer] Failed to send welcome email to ${userEmail}:`, e?.message || e);
    }
  } else {
    console.log(`[Mailer:LOG_DISPATCH] Welcome email logged for ${userEmail}:`, mailOptions.subject);
  }
}

/**
 * Send alert email to Administrator whenever a new user signs up or requests access
 */
export async function sendAdminNewUserAlert(newUserEmail: string, newUserName: string, role: string) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || "admin@skillnova.edu";
  const fromName = process.env.EMAIL_FROM_NAME || "SkillNova Security Engine";
  const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || "security@skillnova.edu";

  const mailOptions: SendMailOptions = {
    to: adminEmail,
    subject: `[Admin Alert] New Account Registered: ${newUserName} (${newUserEmail})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 30px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #38bdf8; margin-top: 0;">Security Alert: New User Account Created</h2>
        <p style="color: #cbd5e1; font-size: 14px;">A new user has registered on the SkillNova portal:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; color: #e2e8f0; font-size: 14px;">
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <td style="padding: 8px 0; font-weight: 600; color: #94a3b8;">Full Name:</td>
            <td style="padding: 8px 0;">${newUserName}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <td style="padding: 8px 0; font-weight: 600; color: #94a3b8;">Email Address:</td>
            <td style="padding: 8px 0;">${newUserEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
            <td style="padding: 8px 0; font-weight: 600; color: #94a3b8;">Assigned Role:</td>
            <td style="padding: 8px 0; color: #a855f7; font-weight: 600;">${role}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #94a3b8;">Registered At:</td>
            <td style="padding: 8px 0;">${new Date().toUTCString()}</td>
          </tr>
        </table>
        <div style="margin-top: 25px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin" style="background-color: #3b82f6; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Open Admin Console</a>
        </div>
      </div>
    `,
    text: `New user created: ${newUserName} (${newUserEmail}), Role: ${role}. Review in Admin Console.`,
  };

  const client = getTransporter();
  if (client) {
    try {
      await client.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        ...mailOptions,
      });
      console.log(`[Mailer] Administrator notified at ${adminEmail}`);
    } catch (e: any) {
      console.error(`[Mailer] Failed to notify admin at ${adminEmail}:`, e?.message || e);
    }
  } else {
    console.log(`[Mailer:LOG_DISPATCH] Admin alert logged for ${adminEmail}:`, mailOptions.subject);
  }
}

