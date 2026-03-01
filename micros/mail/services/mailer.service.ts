import log from "encore.dev/log";
import { createTransport } from "nodemailer";
import type { MailOptions, TransportOptions } from "../schemas/transport.schemas";
import mailConfig from "../secrets.config";

const transporter = createTransport({
  port: Number.parseInt(mailConfig.port(), 10),
  host: mailConfig.host(),
  sender: mailConfig.sender(),
  secure: mailConfig.secure() === "true",
  auth: {
    user: mailConfig.auth.user(),
    pass: mailConfig.auth.pass(),
  },
});

const transport = async (options: TransportOptions) => {
  try {
    await transporter.sendMail(options);
    return null;
  } catch (error) {
    log.error(error);
    return error;
  }
};

const Send = async ({ to, subject, html }: MailOptions) => {
  const options = {
    from: mailConfig.sender(),
    to,
    subject,
    html,
  };

  await transport(options);
};

const MailService = {
  Send,
};

export default MailService;
