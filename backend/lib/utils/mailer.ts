import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",   // ← just this one line handles all Gmail settings
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,  // ← your 16-char app password
  },
});