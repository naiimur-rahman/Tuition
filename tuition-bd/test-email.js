const nodemailer = require("nodemailer");
const fs = require("fs");

const env = fs.readFileSync(".env", "utf8");
let email = "";
let pass = "";
env.split("\n").forEach(line => {
  if (line.startsWith("SMTP_EMAIL=")) email = line.split("=")[1].replace(/"/g, "").trim();
  if (line.startsWith("SMTP_PASSWORD=")) pass = line.split("=")[1].replace(/"/g, "").trim();
});

console.log("Testing with email:", email);
console.log("Password length:", pass.length);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email,
    pass: pass,
  },
});

transporter.sendMail({
  from: `"Tuition Console Test" <${email}>`,
  to: email, // send to yourself
  subject: "Test Email from Tuition Console",
  text: "If you see this, nodemailer is working perfectly!",
}).then(info => {
  console.log("Success! Message sent:", info.messageId);
}).catch(err => {
  console.error("Error sending email:", err);
});
