const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { verificationTemplate } = require('../utils/emailTemplates');
require('dotenv').config();

// Create a transporter (using a testing service like Ethereal or actual SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: process.env.EMAIL_PORT || 587,
  auth: {
    user: process.env.EMAIL_USER || 'dummy@ethereal.email',
    pass: process.env.EMAIL_PASS || 'dummy-pass',
  },
});

exports.sendVerificationEmail = async (userEmail, userId, firstName) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const verificationLink = `http://localhost:3000/auth/verify-email/${token}`;

  const mailOptions = {
    from: '"Thisara Driving School" <no-reply@thisara.com>',
    to: userEmail,
    subject: 'Confirm Your Instructor Account',
    html: verificationTemplate(verificationLink, firstName),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent: %s', info.messageId);
    // If using ethereal, log the preview URL
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
      console.log('📬 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};
