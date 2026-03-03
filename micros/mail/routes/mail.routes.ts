import { render } from "@react-email/components";
import { api } from "encore.dev/api";
import type { VerifyEmailData } from "../schemas/mail.schemas";
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
