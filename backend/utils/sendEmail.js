import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendWelcomeEmail = async (to, lawyerName, barCouncilRegNumber, htmlContent) => {
  try {
    const mailOptions = {
      from: `"LegalReach" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: '🎉 Welcome to LegalReach - Application Approved!',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export const sendRejectionEmail = async (to, lawyerName, htmlContent) => {
  try {
    const mailOptions = {
      from: `"LegalReach" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'LegalReach - Application Status Update',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return false;
  }
};