const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "manshishrivastav3204@gmail.com",
    pass: "silboehgcktxqxkt", // no spaces
  },
});

transporter.sendMail({
  from: "manshishrivastav3204@gmail.com",
  to: "manshishrivastav3204@gmail.com", // send to yourself
  subject: "Test Email",
  text: "This is a test email from EMS project",
})
.then(() => console.log("✅ Email sent"))
.catch(err => console.error("❌ Error:", err));