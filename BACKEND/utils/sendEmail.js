const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // Determine if using Gmail or other SMTP provider
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes("gmail") ? "gmail" : undefined,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `Thisara Driving School <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${options.email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
