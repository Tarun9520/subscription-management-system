const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {Array}  [options.attachments]
 */
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      attachments,
    });
    return info;
  } catch (err) {
    console.error("Email send error:", err.message);
    // Do not crash the request flow if email fails
    return null;
  }
};

module.exports = { sendEmail };
