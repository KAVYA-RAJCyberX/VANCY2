const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  // Use Ethereal for dev/testing if SMTP credentials are not provided
  let transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Generate test account automatically for local development
    console.warn("⚠️ No SMTP credentials found in .env. Using Ethereal Email for testing.");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const mailOptions = {
    from: `"Vancy Admin" <${process.env.SMTP_USER || 'admin@vancy.com'}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // If using ethereal, log the preview URL
  if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL SENT] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } else {
    console.log(`[EMAIL SENT] MessageId: ${info.messageId}`);
  }

  return info;
};

module.exports = sendEmail;
