import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await transporter.sendMail({
        from: `"Library Management System" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendWelcomeEmail(to: string, firstName: string) {
    const subject = 'Welcome to Library Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Library Management System!</h2>
        <p>Hello ${firstName},</p>
        <p>Your account has been successfully created. You can now:</p>
        <ul>
          <li>Browse and search for books</li>
          <li>Request to borrow books</li>
          <li>View your borrowing history</li>
        </ul>
        <p>Happy reading!</p>
        <p>Best regards,<br>Library Management Team</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  static async sendBorrowRequestEmail(
    to: string,
    firstName: string,
    bookTitle: string,
    status: string
  ) {
    const subject = `Borrow Request ${status}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Borrow Request Update</h2>
        <p>Hello ${firstName},</p>
        <p>Your borrow request for "<strong>${bookTitle}</strong>" has been <strong>${status}</strong>.</p>
        ${status === 'approved' ? '<p>Please visit the library to collect your book.</p>' : ''}
        ${status === 'rejected' ? '<p>If you have any questions, please contact the library administrator.</p>' : ''}
        <p>Best regards,<br>Library Management Team</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  static async sendReturnReminderEmail(
    to: string,
    firstName: string,
    bookTitle: string,
    dueDate: string
  ) {
    const subject = 'Book Return Reminder';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Return Reminder</h2>
        <p>Hello ${firstName},</p>
        <p>This is a reminder that the book "<strong>${bookTitle}</strong>" is due for return on <strong>${dueDate}</strong>.</p>
        <p>Please return the book to the library before the due date to avoid any penalties.</p>
        <p>Best regards,<br>Library Management Team</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }

  static async sendAccountDeletionEmail(
    to: string,
    firstName: string
  ) {
    const subject = 'Account Deletion Notice';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Account Deletion Notice</h2>
        <p>Hello ${firstName},</p>
        <p>This is to inform you that your account with the Library Management System has been deleted by an administrator.</p>
        <p>If you believe this was done in error, please contact the library administration immediately.</p>
        <p>All your data and borrowing history have been removed from our system.</p>
        <p>Best regards,<br>Library Management Team</p>
      </div>
    `;
    return this.sendEmail(to, subject, html);
  }
}

