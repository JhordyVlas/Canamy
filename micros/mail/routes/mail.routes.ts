import { render } from "@react-email/components";
import { api } from "encore.dev/api";
import type { ForgotPasswordData, VerifyEmailData } from "../schemas/mail.schemas";
import { forgotPassword } from "../templates/forgot-password";
import { verify } from "../templates/verify";
import { QueueEmailTopic } from "../topics/queue-email.topic";
import t from "~lib/localization/helper.localization";

export const verifyMail = api(
  {
    expose: false,
  },
  async (input: VerifyEmailData) => {
    const html = await render(verify(input));

    QueueEmailTopic.publish({
      to: input.email,
      subject: t.sync(input.language, "templates.verify.subject"),
      language: input.language,
      html,
    });
  },
);

export const forgotPasswordMail = api(
  {
    expose: false,
  },
  async (input: ForgotPasswordData) => {
    const html = await render(forgotPassword(input));

    QueueEmailTopic.publish({
      to: input.email,
      subject: t.sync(input.language, "templates.forgot_password.subject"),
      language: input.language,
      html,
    });
  },
);
