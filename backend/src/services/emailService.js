const nodemailer = require('nodemailer');
const AppError = require('../errors/app-error');

function getSmtpPort() {
  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new AppError('Email service is unavailable', 500, 'EMAIL_SERVICE_UNAVAILABLE');
  }
  return port;
}

function createTransporter() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new AppError('Email service is unavailable', 500, 'EMAIL_SERVICE_UNAVAILABLE');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: getSmtpPort(),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject: 'Reset your SkinMate password',
      text: `Open this link in SkinMate to reset your password: ${resetUrl}`,
      html: `<p>Open this link in SkinMate to reset your password:</p><p><a href="${resetUrl}">Reset password</a></p>`,
    });
  } catch (error) {
    console.error('Password reset email delivery failed');
    throw new AppError('Email service is unavailable', 503, 'EMAIL_SERVICE_UNAVAILABLE');
  }
}

module.exports = { sendPasswordResetEmail };
