const nodemailer = require('nodemailer');

const generateOtpEmailHtml = (otp, orgName, purpose) => {
  let emailContent = '';

  if (purpose === 'registration') {
    emailContent = `
      <p>Thank you for registering with ${orgName}. Your One Time Password (OTP) for completing the registration is:</p>
      <div style="text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; color: #4CAF50;">
        ${otp}
      </div>
      <p>Please enter this OTP to complete your registration.</p>
    `;
  } else if (purpose === 'forgot_password') {
    emailContent = `
      <p>You have requested to reset your password for ${orgName}. Your One Time Password (OTP) for completing the password reset is:</p>
      <div style="text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; color: #4CAF50;">
        ${otp}
      </div>
      <p>Please enter this OTP to complete your password reset.</p>
    `;
  } else {
    emailContent = `
      <p>Your One Time Password (OTP) is:</p>
      <div style="text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; color: #4CAF50;">
        ${otp}
      </div>
    `;
  }

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="text-align: center; color: #d60000;">${orgName}</h2>
      <p>Dear user,</p>
      ${emailContent}
      <p>Thank you,<br>The ${orgName} Team</p>
    </div>
  `;
};


const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'developer2@viexports.com', 
    pass: 'ckrcjdlijzfycffz', 
  },
});

const sendOtpEmail = async (email, otp, purpose) => {
  const mailOptions = {
    from: 'developer2@viexports.com',
    to: email,
    subject: `Your OTP for ${purpose}`,
    html: generateOtpEmailHtml(otp, 'Vi Exports India Pvt. Ltd', purpose),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
};

module.exports = sendOtpEmail;
