import 'dotenv/config';
import nodemailer from 'nodemailer';

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Base email sender wrapper with HTML & plain-text support
 */
export const sendEmailAlert = async ({ to, subject, html, text }) => {
  try {
    const transporter = getTransporter();
    const mailOptions = {
      from: `"LegalReach Notifications" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email alert sent to ${to}: ${subject} [ID: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email alert to ${to}:`, error.message);
    // Return false without throwing so background email errors don't fail user requests
    return { success: false, error: error.message };
  }
};

/**
 * Standard LegalReach branded HTML email wrapper
 */
const wrapEmailTemplate = ({ title, content, buttonText, buttonUrl }) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 0.5px;">
          Legal<span style="color: #3b82f6;">Reach</span>
        </h1>
        <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Verified Legal Network & Consultations</p>
      </div>

      <div style="padding: 32px 28px;">
        <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px;">${title}</h2>
        <div style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          ${content}
        </div>

        ${buttonText && buttonUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${buttonUrl}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
              ${buttonText}
            </a>
          </div>
        ` : ''}

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
        <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
          This is an automated notification from LegalReach. For support or queries, contact us at legalreach.official@gmail.com.
        </p>
      </div>

      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} LegalReach Platform. All rights reserved.
      </div>
    </div>
  `;
};

/**
 * 1. Notify lawyer when a client books an appointment
 */
export const notifyLawyerNewAppointment = async ({ lawyerEmail, lawyerName, clientName, clientPhone, date, time, notes }) => {
  const content = `
    <p>Dear <strong>Adv. ${lawyerName}</strong>,</p>
    <p>You have received a new consultation appointment booking from <strong>${clientName}</strong>.</p>
    
    <div style="background: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Client Name:</strong> ${clientName}</p>
      <p style="margin: 0 0 8px 0;"><strong>Contact Phone:</strong> ${clientPhone || 'Not provided'}</p>
      <p style="margin: 0 0 8px 0;"><strong>Scheduled Date:</strong> ${date}</p>
      <p style="margin: 0 0 8px 0;"><strong>Time Slot:</strong> ${time}</p>
      ${notes ? `<p style="margin: 0;"><strong>Matter Notes:</strong> ${notes}</p>` : ''}
    </div>

    <p>Please log in to your dashboard to confirm or reschedule this consultation.</p>
  `;

  return sendEmailAlert({
    to: lawyerEmail,
    subject: `New Consultation Request: ${clientName} (${date} at ${time})`,
    html: wrapEmailTemplate({
      title: 'New Consultation Booking',
      content,
      buttonText: 'Review in Lawyer Dashboard',
      buttonUrl: 'http://localhost:5173/lawyer-dashboard'
    })
  });
};

/**
 * 2. Notify client when lawyer confirms or cancels an appointment
 */
export const notifyClientAppointmentStatus = async ({ clientEmail, clientName, lawyerName, date, time, status }) => {
  const isConfirmed = status === 'confirmed';
  const statusColor = isConfirmed ? '#16a34a' : '#dc2626';

  const content = `
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>Your legal consultation with <strong>Adv. ${lawyerName}</strong> has been updated.</p>

    <div style="background: #f8fafc; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Lawyer:</strong> Adv. ${lawyerName}</p>
      <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 0 0 8px 0;"><strong>Time Slot:</strong> ${time}</p>
      <p style="margin: 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${status}</span></p>
    </div>

    ${isConfirmed 
      ? '<p>Please make sure to be available at the scheduled time. You can also chat and share preliminary case documents beforehand.</p>' 
      : '<p>Unfortunately, the lawyer is unavailable for this slot. You can book an alternative time slot on their profile.</p>'
    }
  `;

  return sendEmailAlert({
    to: clientEmail,
    subject: `Consultation ${status.toUpperCase()} - Adv. ${lawyerName}`,
    html: wrapEmailTemplate({
      title: isConfirmed ? 'Consultation Confirmed' : 'Consultation Update',
      content,
      buttonText: 'View My Consultations',
      buttonUrl: 'http://localhost:5173/user-dashboard'
    })
  });
};

/**
 * 3. Notify lawyer when a client sends a connection request
 */
export const notifyLawyerConnectionRequest = async ({ lawyerEmail, lawyerName, clientName, clientEmail }) => {
  const content = `
    <p>Dear <strong>Adv. ${lawyerName}</strong>,</p>
    <p>A citizen, <strong>${clientName}</strong> (${clientEmail}), has sent you a connection request seeking legal counsel.</p>
    <p>Once you accept, you will be able to exchange encrypted messages, review case documents, and conduct audio/video consultations.</p>
  `;

  return sendEmailAlert({
    to: lawyerEmail,
    subject: `New Connection Request from ${clientName} - LegalReach`,
    html: wrapEmailTemplate({
      title: 'New Connection Request',
      content,
      buttonText: 'Accept Connection',
      buttonUrl: 'http://localhost:5173/lawyer-dashboard'
    })
  });
};

/**
 * 4. Notify client when lawyer accepts their connection request
 */
export const notifyClientConnectionAccepted = async ({ clientEmail, clientName, lawyerName, lawyerId }) => {
  const content = `
    <p>Dear <strong>${clientName}</strong>,</p>
    <p>Good news! <strong>Adv. ${lawyerName}</strong> has accepted your connection request.</p>
    <p>Your secure consultation channel is now active. You can start chatting and upload case files.</p>
  `;

  return sendEmailAlert({
    to: clientEmail,
    subject: `Connection Accepted: Adv. ${lawyerName} is ready to consult`,
    html: wrapEmailTemplate({
      title: 'Connection Accepted',
      content,
      buttonText: 'Open Secure Chat',
      buttonUrl: `http://localhost:5173/chat?receiverId=${lawyerId}&receiverName=${encodeURIComponent(lawyerName)}`
    })
  });
};
