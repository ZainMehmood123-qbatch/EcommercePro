import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendMail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `<${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent: ', info.messageId);
  } catch (err) {
    console.error('Error sending email', err);
    throw err;
  }
}
