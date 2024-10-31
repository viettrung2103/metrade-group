import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const convertToDateTimeStr = (string) => {
  switch (string.toLowerCase()) {
    case "s":
      return "second";
    case "m":
      return "minute";
    case "h":
      return "hour";
    case "d":
      return "day";
  }
};

const convertToFullDateTimeStr = (expStr) => {
  const time_str = convertToDateTimeStr(expStr[expStr.length - 1]);
  const num_str = expStr.slice(0, expStr.length - 1);
  const num = Number(num_str);
  return num > 1 ? `${num_str} ${time_str}s` : `${num_str} ${time_str}`;
};

export const sendConfirmationEmailService = async (firstName, email, token) => {
  console.log("Start sending email");
  const exp_time_str = process.env.VERIFICATION_EXPIRES_IN;
  console.log("time", exp_time_str);
  const transport = nodemailer.createTransport({
    service: "gmail",
    // service: "smtp.gmail.com", // to prepare a smtp server, working on trollio
    port: 25, //25, 465
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
      // user: process.env.BACKUP_EMAIL_USERNAME,
      // pass: process.env.BACKUP_EMAIL_PASSWORD,
    },
  });

  const timeStr = convertToFullDateTimeStr(exp_time_str);

  let mailConfigurations = await transport.sendMail({
    from: `Metrade <${process.env.EMAIL_USERNAME}>`,
    // from: `Metrade <${process.env.BACKUP_EMAIL_USERNAME}>`,
    to: `${email}`,
    subject: "Email Verification",

    text: `Hi! ${firstName},
You have recently visited our website and entered your email.
Please follow the given link to verify your email
${process.env.FE_URL}/verify?token=${token}&email=${email}.

The link will expire after ${timeStr}.
Thanks`,
  });
  transport.sendMail(mailConfigurations, (err, info) => {
    if (err) {
      throw new Error("Unable to send email");
    }
    console.log("Email SENT Successfully");
  });
};
