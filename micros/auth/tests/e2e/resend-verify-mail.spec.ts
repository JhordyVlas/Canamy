import { faker } from "@faker-js/faker";
import { test } from "@japa/runner";

test.group("POST /auth/resend-verification-mail", () => {
  test("User unauthenticated", async ({ expect, client }) => {
    const res = await client.post("/auth/resend-verification-mail");
    expect(res.status()).toBe(401);
  });

  test("Successful resend verification mail", async ({ expect, client }) => {
    const register = await client.post("/auth/register").json({
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    const cookie = register.cookie("session");
    const res = await client
      .post("/auth/resend-verification-mail")
      .cookie("session", cookie?.value);

    expect(res.status()).toBe(200);
    expect(res.body()).toHaveProperty("message");
  });
});
