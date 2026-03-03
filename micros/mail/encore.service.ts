import { Service } from "encore.dev/service";
import { createLocalizationMiddleware } from "~lib/localization/middleware.factory";

const localizationMiddleware = createLocalizationMiddleware("mail");

export default new Service("mail", {
  middlewares: [localizationMiddleware],
});
