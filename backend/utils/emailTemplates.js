export const generateWelcomeEmail = (lawyerName, email, barCouncilRegNumber) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
        }
        .footer {
          background: #1e3a8a;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 0 0 10px 10px;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .info-box {
          background: white;
          padding: 15px;
          border-left: 4px solid #3b82f6;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to LegalReach!</h1>
        </div>
        
        <div class="content">
          <h2>Dear ${lawyerName},</h2>
          
          <p>Congratulations! Your lawyer application has been <strong>approved</strong> by our admin team.</p>
          
          <div class="info-box">
            <p><strong>Your Registration Details:</strong></p>
            <p>📧 Email: ${email}</p>
            <p>📜 Bar Council Registration: ${barCouncilRegNumber}</p>
          </div>
          
          <p>You can now:</p>
          <ul>
            <li>✅ Login to your lawyer dashboard</li>
            <li>✅ Receive connection requests from clients</li>
            <li>✅ Chat with clients in real-time</li>
            <li>✅ Conduct video/audio consultations</li>
            <li>✅ Manage your professional profile</li>
          </ul>
          
          <center>
            <a href="http://localhost:5173/login" class="button">Login to Dashboard</a>
          </center>
          
          <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
          
          <p>Best regards,<br>
          <strong>LegalReach Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2024 LegalReach. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateRejectionEmail = (lawyerName, email) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
        }
        .footer {
          background: #1e3a8a;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 0 0 10px 10px;
          font-size: 14px;
        }
        .info-box {
          background: #fef2f2;
          padding: 15px;
          border-left: 4px solid #dc2626;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Update</h1>
        </div>
        
        <div class="content">
          <h2>Dear ${lawyerName},</h2>
          
          <p>Thank you for your interest in joining LegalReach.</p>
          
          <div class="info-box">
            <p>After careful review, we regret to inform you that we are unable to approve your lawyer application at this time.</p>
          </div>
          
          <p><strong>Possible reasons:</strong></p>
          <ul>
            <li>Incomplete or unclear verification documents</li>
            <li>Bar Council registration details could not be verified</li>
            <li>Missing required certifications</li>
          </ul>
          
          <p>You are welcome to reapply with updated documents and information. Please ensure all required documents are clear and valid.</p>
          
          <p>If you believe this is an error or need clarification, please contact our support team.</p>
          
          <p>Best regards,<br>
          <strong>LegalReach Team</strong></p>
        </div>
        
        <div class="footer">
          <p>© 2026 LegalReach. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};