import { Service } from "encore.dev/service";
import { createLocalizationMiddleware } from "~lib/localization/middleware.factory";

const localizationMiddleware = createLocalizationMiddleware("auth");

export default new Service("auth", {
  middlewares: [localizationMiddleware],
});
