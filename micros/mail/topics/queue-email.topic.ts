import { Topic } from "encore.dev/pubsub";
import type { QueueEmailEvent } from "../schemas/queue.schemas";

export const QueueEmailTopic = new Topic<QueueEmailEvent>("queue_email", {
  deliveryGuarantee: "at-least-once",
});
