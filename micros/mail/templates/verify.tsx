// biome-ignore assist/source/organizeImports: react-email
import * as React from "react";
import { Container } from "@react-email/components";

import type { VerifyEmailData } from "../schemas/mail.schemas";
import t from "~lib/localization/helper.localization";

export const verify = ({ name, code, language }: VerifyEmailData) => {
  return (
    <Container>
      <h3>{t.sync(language, "templates.verify.title")}</h3>
      <p>{t.sync(language, "templates.verify.body", { name })}</p>
      <p className="bold">{code}</p>
    </Container>
  );
};
