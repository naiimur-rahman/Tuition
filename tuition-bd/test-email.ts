import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

async function test() {
  console.log("Testing with:", process.env.SMTP_EMAIL);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Tuition Console Test" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL, // sending to themselves
      subject: "Test Email from Tuition Console",
      text: "If you see this, nodemailer is working perfectly!",
    });
    console.log("Success! Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}
test();
