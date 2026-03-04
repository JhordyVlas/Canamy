import { faker } from "@faker-js/faker";
import { test } from "@japa/runner";

test.group("POST /auth/forgot-password", () => {
  test("Validate request", async ({ client, expect }) => {
    const res = await client.post("/auth/forgot-password").json({});
    expect(res.status()).toBe(400);
  });

  test("Request has valid email", async ({ client, expect }) => {
    const res = await client.post("/auth/forgot-password").json({ email: "invalid" });
    expect(res.status()).toBe(400);
  });

  test("Successful request", async ({ client, expect }) => {
    const email = faker.internet.email();

    await client.post("/auth/register").json({
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      email,
      password: faker.internet.password(),
    });

    const res = await client.post("/auth/forgot-password").json({ email });
    expect(res.status()).toBe(200);
    expect(res.body()).toHaveProperty("message");
  });
});
