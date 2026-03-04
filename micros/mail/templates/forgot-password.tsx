// biome-ignore assist/source/organizeImports: react-email
import * as React from "react";
import { Container } from "@react-email/components";
import t from "~lib/localization/helper.localization";
import type { ForgotPasswordData } from "../schemas/mail.schemas";

export const forgotPassword = ({ name, code, language }: ForgotPasswordData) => {
  return (
    <Container>
      <h3>{t.sync(language, "templates.forgot_password.title")}</h3>
      <p>{t.sync(language, "templates.forgot_password.body", { name })}</p>
      <p className="bold">{code}</p>
    </Container>
  );
};
