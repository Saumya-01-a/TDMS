exports.verificationTemplate = (verificationLink, firstName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Instructor Account</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #070a10;
          color: #ffffff;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .header {
          text-align: center;
          padding-bottom: 40px;
        }
        .logo {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid #E11B22;
          display: inline-block;
          overflow: hidden;
          background-color: #000;
        }
        .content {
          background-color: rgba(15, 18, 24, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        h1 {
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 20px;
        }
        p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
        }
        .btn {
          display: inline-block;
          background-color: #E11B22;
          color: #ffffff !important;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          transition: background-color 0.3s ease;
        }
        .footer {
          text-align: center;
          padding-top: 40px;
          color: rgba(255, 255, 255, 0.4);
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">
             <!-- Placeholder for logo.jpeg -->
             <img src="https://via.placeholder.com/80/000000/E11B22?text=TS" alt="Thisara Driving School" style="width: 100%; height: 100%; object-fit: contain;">
          </div>
        </div>
        <div class="content">
          <h1>Congratulations, ${firstName}!</h1>
          <p>
            Your instructor account for <strong>Thisara Driving School</strong> has been approved by the Admin.
            Please click the button below to verify your email and activate your account.
          </p>
          <a href="${verificationLink}" class="btn">Verify Account</a>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Thisara Driving School. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.passwordResetTemplate = (resetLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Request</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #020617;
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 60px 20px;
        }
        .card {
          background-color: #0f172a;
          border-top: 3px solid #ff4d4d;
          border-radius: 16px;
          padding: 50px 40px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .header {
          margin-bottom: 40px;
        }
        .brand-name {
          color: #ffffff;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
          display: block;
        }
        .slogan {
          color: #ff4d4d;
          font-size: 14px;
          font-weight: 600;
          margin-top: 8px;
          display: block;
          letter-spacing: 1px;
        }
        h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 24px;
          letter-spacing: -0.5px;
        }
        p {
          color: #e2e8f0;
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 40px;
        }
        .btn-container {
          padding: 20px 0 40px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(to right, #ff4d4d, #b91c1c);
          color: #ffffff !important;
          text-decoration: none;
          padding: 18px 45px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 10px 20px rgba(255, 77, 77, 0.3);
        }
        .notice {
          display: block;
          font-size: 13px;
          color: #94a3b8;
          margin-top: 30px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
        }
        .hotline {
          color: #ffffff;
          font-weight: 700;
          display: block;
          margin-top: 10px;
          font-size: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <span class="brand-name">THISARA DRIVING SCHOOL</span>
            <span class="slogan">Safety & Defensive Driving Training</span>
          </div>
          
          <h1>Password Reset Request</h1>
          
          <p>
            We received a request to reset your password for your account. 
            Click the button below to pick a new one.
          </p>
          
          <div class="btn-container">
            <a href="${resetLink}" class="btn">Reset Password</a>
          </div>
          
          <span class="notice">
            This secure link expires in <strong>1 hour</strong>.<br>
            If you didn't request this, you can safely ignore this email.
          </span>
        </div>
        
        <div class="footer">
          &copy; ${new Date().getFullYear()} Thisara Driving School. All rights reserved.
          <span class="hotline">Hotline: +94 777 47 00 48</span>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.studentVerificationTemplate = (verifyLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #020617;
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 60px 20px;
        }
        .card {
          background-color: #0f172a;
          border-top: 3px solid #ff4d4d;
          border-radius: 16px;
          padding: 50px 40px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .header {
          margin-bottom: 40px;
        }
        .brand-name {
          color: #ffffff;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin: 0;
          display: block;
        }
        .slogan {
          color: #ff4d4d;
          font-size: 14px;
          font-weight: 600;
          margin-top: 8px;
          display: block;
          letter-spacing: 1px;
        }
        h1 {
          color: #ffffff;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 24px;
          letter-spacing: -0.5px;
        }
        p {
          color: #e2e8f0;
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 40px;
        }
        .btn-container {
          padding: 20px 0 40px 0;
        }
        .btn {
          display: inline-block;
          background: linear-gradient(to right, #ff4d4d, #b91c1c);
          color: #ffffff !important;
          text-decoration: none;
          padding: 18px 45px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          box-shadow: 0 10px 20px rgba(255, 77, 77, 0.3);
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #94a3b8;
          font-size: 13px;
        }
        .hotline {
          color: #ffffff;
          font-weight: 700;
          display: block;
          margin-top: 10px;
          font-size: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <span class="brand-name">THISARA DRIVING SCHOOL</span>
            <span class="slogan">Safety & Defensive Driving Training</span>
          </div>
          
          <h1>Welcome to Thisara Driving School!</h1>
          
          <p>
            Thank you for choosing us for your driving journey. Please verify your email 
            address to activate your account and start your lessons.
          </p>
          
          <div class="btn-container">
            <a href="${verifyLink}" class="btn">Verify Email Address</a>
          </div>
          
        </div>
        
        <div class="footer">
          If you did not create an account, you can safely ignore this email.<br><br>
          &copy; ${new Date().getFullYear()} Thisara Driving School. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
};
