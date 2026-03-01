import { secret } from "encore.dev/config";

const mailConfig = {
  port: secret("MAIL_PORT"),
  sender: secret("MAIL_SENDER"),
  host: secret("MAIL_HOST"),
  secure: secret("MAIL_SECURE"),
  auth: {
    user: secret("MAIL_USERNAME"),
    pass: secret("MAIL_PASSWORD"),
  },
};

export default mailConfig;
