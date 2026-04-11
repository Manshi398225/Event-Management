const nodemailer = require("nodemailer");

const hasSmtpConfig =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const formatEventDate = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatEventTime = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const sendRegistrationEmail = async ({ email, name, eventTitle, eventDate, location, status }) => {
  if (!transporter || !email) {
    return;
  }

  const isNewRegistration = status === "registered";
  const subject = isNewRegistration
    ? "\uD83C\uDF89 Event Registration Confirmed"
    : `Event registration ${status}: ${eventTitle}`;
  const text = isNewRegistration
    ? `Hello ${name},

\uD83C\uDF89 Your registration is confirmed!

You have successfully registered for the following event:

----------------------------------
Event Name : ${eventTitle}
Date       : ${formatEventDate(eventDate)}
Time       : ${formatEventTime(eventDate)}
Venue      : ${location || ""}
Status     : Registered
----------------------------------

Please make sure to arrive on time and carry your student ID.

Kindly keep this email as confirmation of your registration.

We look forward to seeing you at the event!

Best Regards,
Event Management System (EMS) \uD83D\uDE80`
    : `Hello ${name}, your registration for "${eventTitle}" is now marked as "${status}".`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    text,
  });
};

const sendEventReminderEmail = async ({ email, name, eventTitle, eventDate, location }) => {
  if (!transporter || !email) {
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Reminder: ${eventTitle} is coming up`,
    text: `Hello ${name}, this is a reminder for "${eventTitle}" on ${new Date(eventDate).toLocaleString()} at ${location}.`,
  });
};

module.exports = { sendRegistrationEmail, sendEventReminderEmail };
