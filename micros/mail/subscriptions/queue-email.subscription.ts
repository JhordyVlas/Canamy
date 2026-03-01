import { Subscription } from "encore.dev/pubsub";
import MailService from "../services/mailer.service";
import { QueueEmailTopic } from "../topics/queue-email.topic";

const _QueueEmail = new Subscription(QueueEmailTopic, "send_email", {
  handler: async (event) => {
    await MailService.Send({
      to: event.to,
      subject: event.subject,
      html: event.html,
      language: event.language,
    });
  },
});
