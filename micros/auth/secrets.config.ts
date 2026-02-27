import { secret } from "encore.dev/config";

const authConfig = {
  dbUrl: secret("AUTH_DB_URL"),
  secretKey: secret("AUTH_SECRET_KEY"),
};

export default authConfig;
