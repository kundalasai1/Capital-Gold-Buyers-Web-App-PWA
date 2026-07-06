import nodemailer from 'nodemailer';
import { prisma } from './db';

const EMAIL_KEY = process.env.EMAIL_PROVIDER_API_KEY;

// Base luxury brand email wrapper
function getBaseHtmlTemplate(title: string, bodyContent: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #fafafa;
            color: #2d3748;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            background: #ffffff;
            margin: 20px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
            border-top: 6px solid #d4af37; /* Luxury Gold border */
          }
          .header {
            background-color: #111827;
            color: #d4af37;
            padding: 35px 20px;
            text-align: center;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 2px;
          }
          .content {
            padding: 35px 30px;
            line-height: 1.6;
          }
          .content h1 {
            color: #111827;
            font-size: 20px;
            margin-top: 0;
            font-weight: 600;
          }
          .detail-box {
            background-color: #f9fafb;
            border-left: 4px solid #d4af37;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
          }
          .detail-row {
            margin: 5px 0;
            font-size: 14px;
          }
          .detail-label {
            font-weight: bold;
            color: #4b5563;
          }
          .btn {
            display: inline-block;
            background-color: #d4af37;
            color: #111827 !important;
            font-weight: bold;
            padding: 12px 28px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
          }
          .footer {
            background-color: #f3f4f6;
            padding: 25px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">CAPITAL GOLD BUYERS</div>
          <div class="content">
            ${bodyContent}
          </div>
          <div class="footer">
            &copy; 2026 Capital Gold Buyers. All rights reserved.<br>
            This is an automated operational notification. Please do not reply directly.
          </div>
        </div>
      </body>
    </html>
  `;
}

// Generate templates based on type
function getEmailBody(templateName: string, vars: Record<string, any>): { title: string; html: string } {
  let title = '';
  let body = '';

  switch (templateName) {
    case 'appointment_confirmation_customer':
      title = 'Your Appointment Confirmation';
      body = `
        <h1>Appointment Confirmed!</h1>
        <p>Dear ${vars.customerName || 'Customer'},</p>
        <p>Thank you for scheduling a valuation appointment with Capital Gold Buyers. Your booking details are summarized below:</p>
        <div class="detail-box">
          <div class="detail-row"><span class="detail-label">Branch:</span> ${vars.branchName}</div>
          <div class="detail-row"><span class="detail-label">Address:</span> ${vars.branchAddress}</div>
          <div class="detail-row"><span class="detail-label">Phone:</span> ${vars.branchPhone}</div>
          <div class="detail-row"><span class="detail-label">Date:</span> ${vars.slotDate}</div>
          <div class="detail-row"><span class="detail-label">Time:</span> ${vars.slotTime}</div>
        </div>
        <p>If you need to reschedule or request cancellation, please click the link below:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book/cancel?id=${vars.appointmentId}" class="btn">Manage Booking</a>
        <p style="margin-top:20px; font-size:13px; color:#6b7280;">Please bring a valid photo ID and any certificates or purchase invoices you have for the metal.</p>
      `;
      break;

    case 'appointment_confirmation_admin':
      title = 'New Booking Alert';
      body = `
        <h1>New Appointment Scheduled</h1>
        <p>Admin Alert: A customer has scheduled an appointment. Details:</p>
        <div class="detail-box">
          <div class="detail-row"><span class="detail-label">Customer Name:</span> ${vars.customerName}</div>
          <div class="detail-row"><span class="detail-label">Phone:</span> ${vars.phone}</div>
          <div class="detail-row"><span class="detail-label">Email:</span> ${vars.email}</div>
          <div class="detail-row"><span class="detail-label">Date:</span> ${vars.slotDate}</div>
          <div class="detail-row"><span class="detail-label">Time:</span> ${vars.slotTime}</div>
          <div class="detail-row"><span class="detail-label">Notes:</span> ${vars.notes}</div>
        </div>
        <p>Log in to the dashboard to manage or reassign this booking.</p>
      `;
      break;

    case 'appointment_cancellation':
      title = 'Appointment Cancelled';
      body = `
        <h1>Appointment Cancelled</h1>
        <p>Dear ${vars.customerName},</p>
        <p>This is to confirm that your appointment scheduled for <strong>${vars.slotDate}</strong> at <strong>${vars.slotTime}</strong> at our <strong>${vars.branchName}</strong> has been cancelled as requested.</p>
        <p>If this was done in error or you wish to schedule a new visit, please visit our website.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/book" class="btn">Schedule New Appointment</a>
      `;
      break;

    case 'appointment_status_update':
      title = 'Appointment Update';
      body = `
        <h1>Appointment Status Updated</h1>
        <p>Dear ${vars.customerName},</p>
        <p>The status of your appointment at our <strong>${vars.branchName}</strong> on <strong>${vars.slotDate}</strong> at <strong>${vars.slotTime}</strong> has been updated:</p>
        <div class="detail-box" style="font-weight:bold; font-size:16px; text-align:center; color:#d4af37; background-color:#111827;">
          Status: ${vars.status}
        </div>
        <p>If you have any questions, please contact the branch directly.</p>
      `;
      break;

    case 'contact_form_customer':
      title = 'Inquiry Acknowledgment';
      body = `
        <h1>We Have Received Your Inquiry</h1>
        <p>Dear ${vars.customerName},</p>
        <p>Thank you for reaching out to Capital Gold Buyers. A branch representative will review your message and contact you within 24 business hours.</p>
        <p>For urgent matters, please call the branch closest to you directly.</p>
      `;
      break;

    case 'contact_form_admin':
      title = 'New Contact Form Submission';
      body = `
        <h1>New Lead Alert: Contact Form</h1>
        <p>Admin Alert: A customer has submitted an inquiry. Details:</p>
        <div class="detail-box">
          <div class="detail-row"><span class="detail-label">Name:</span> ${vars.customerName}</div>
          <div class="detail-row"><span class="detail-label">Phone:</span> ${vars.phone}</div>
          <div class="detail-row"><span class="detail-label">Email:</span> ${vars.email}</div>
          <div class="detail-row"><span class="detail-label">Message:</span> ${vars.message}</div>
        </div>
      `;
      break;

    default:
      title = vars.subject || 'Notification';
      body = `<h1>Operational Notice</h1><p>${vars.message || 'No details provided.'}</p>`;
  }

  return {
    title,
    html: getBaseHtmlTemplate(title, body),
  };
}

export async function sendEmail({
  to,
  subject,
  templateName,
  variables,
}: {
  to: string;
  subject: string;
  templateName: string;
  variables: Record<string, any>;
}) {
  const { title, html } = getEmailBody(templateName, variables);
  const finalSubject = subject || title;

  console.log(`[EMAIL COMPILING] Sending to: ${to} | Subject: ${finalSubject}`);

  // 1. If API key or SMTP settings are configured, attempt real email transmission
  if (EMAIL_KEY) {
    try {
      // Setup a generic transporter. In production, this reads SMTP server configs.
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST || 'smtp.resend.com',
        port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_SMTP_USER || 'resend',
          pass: EMAIL_KEY,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'Capital Gold Buyers <noreply@capitalgoldbuyers.com>',
        to,
        subject: finalSubject,
        html,
      });

      console.log(`[EMAIL SENT SUCCESS] Message ID: ${info.messageId}`);

      await prisma.emailLog.create({
        data: {
          recipient: to,
          subject: finalSubject,
          templateName,
          status: 'SENT',
        },
      });

      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('[EMAIL SEND FAILURE]', error);

      await prisma.emailLog.create({
        data: {
          recipient: to,
          subject: finalSubject,
          templateName,
          status: 'FAILED',
          errorMessage: error.message || 'Unknown SMTP transport error',
        },
      });

      return { success: false, error: error.message };
    }
  }

  // 2. Fallback to mock log when API key is not set
  console.log('[EMAIL MOCK LOGGING] Credentials empty. Simulating success.');
  try {
    await prisma.emailLog.create({
      data: {
        recipient: to,
        subject: finalSubject,
        templateName,
        status: 'SENT',
      },
    });
  } catch (err) {
    console.error('Failed to log mock email to database:', err);
  }

  return { success: true, mock: true };
}
