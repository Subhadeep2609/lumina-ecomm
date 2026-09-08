import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  const isDefaultCredentials =
    !process.env.SMTP_USER ||
    process.env.SMTP_USER === 'your_email@gmail.com' ||
    !process.env.SMTP_PASS ||
    process.env.SMTP_PASS === 'your_email_app_password';

  if (isDefaultCredentials) {
    console.log('\n=============================================================');
    console.log('[Nodemailer Sandbox / Dev Mode Activated]');
    console.log(`[Email Recipient]: ${options.email}`);
    console.log(`[Subject]: ${options.subject}`);
    console.log(`[OTP / Code Content]: ${options.otp || 'N/A'}`);
    console.log(`[Message]: ${options.message || options.text || ''}`);
    console.log('=============================================================\n');
    return { success: true, mode: 'sandbox', otp: options.otp };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'LuminaMarket'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 900;">LuminaMarket</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Notification & Account Notice</p>
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 15px; color: #cbd5e1; margin-bottom: 16px; line-height: 1.6;">${options.message || ''}</p>
          ${options.otp ? `
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background: #0f172a; display: inline-block; padding: 12px 28px; border-radius: 8px; border: 1px dashed #38bdf8; margin-top: 12px;">
              ${options.otp}
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 16px;">This OTP code expires in 15 minutes.</p>
          ` : ''}
        </div>
        <div style="text-align: center; font-size: 12px; color: #64748b;">
          <p>© ${new Date().getFullYear()} LuminaMarket Inc. All rights reserved.</p>
        </div>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Nodemailer] Email sent: ${info.messageId}`);
  return info;
};

export default sendEmail;
