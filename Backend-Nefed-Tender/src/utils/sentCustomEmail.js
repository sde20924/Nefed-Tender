const nodemailer = require('nodemailer');




const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'developer2@viexports.com', 
    pass: 'ckrcjdlijzfycffz', 
  },
});

const sentCustomEmail = async (mailOptions) => {

  try {
    await transporter.sendMail(mailOptions);
    console.log('Custom Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send email');
  }
};

module.exports = sentCustomEmail;
