import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || 'noreply@deltaindo.co.id';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter && SMTP_USER && SMTP_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendRegistrationConfirmation(email: string, name: string, registrationLink: string) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email service not configured');
    return;
  }

  const htmlContent = `
    <h2>Registration Confirmation</h2>
    <p>Dear ${name},</p>
    <p>Thank you for registering for our K3 training program. Your registration has been received.</p>
    <p>Registration Link: <a href="${registrationLink}">${registrationLink}</a></p>
    <p>Best regards,<br/>PICNew Team</p>
  `;

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'K3 Training Registration Confirmation',
      html: htmlContent,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

export async function sendApprovalNotification(
  email: string,
  name: string,
  programName: string,
  certificateNumber: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email service not configured');
    return;
  }

  const htmlContent = `
    <h2>Registration Approved</h2>
    <p>Dear ${name},</p>
    <p>Congratulations! Your registration for <strong>${programName}</strong> has been approved.</p>
    <p>Certificate Number: ${certificateNumber}</p>
    <p>You will receive your certificate upon completion of the training.</p>
    <p>Best regards,<br/>PICNew Team</p>
  `;

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: `Registration Approved - ${programName}`,
      html: htmlContent,
    });
    console.log(`Approval email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
}

export async function sendRejectionNotification(
  email: string,
  name: string,
  reason: string
) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email service not configured');
    return;
  }

  const htmlContent = `
    <h2>Registration Status Update</h2>
    <p>Dear ${name},</p>
    <p>Your registration has been reviewed. Unfortunately, it does not meet the requirements at this time.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>Please contact us for more information or to reapply.</p>
    <p>Best regards,<br/>PICNew Team</p>
  `;

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Registration Status Update',
      html: htmlContent,
    });
    console.log(`Rejection email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send rejection email:', error);
  }
}
