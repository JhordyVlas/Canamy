import { faker } from "@faker-js/faker";
import { test } from "@japa/runner";

test.group("POST /auth/reset-password", () => {
  const email = faker.internet.email();

  test("Validate request", async ({ client, expect }) => {
    const res = await client.post("/auth/reset-password").json({});
    expect(res.status()).toBe(400);
  });

  test("Request has valid password", async ({ client, expect }) => {
    const res = await client.post("/auth/reset-password").json({
      email: "invalid",
      code: "invalid",
      password: "invalid",
    });

    expect(res.status()).toBe(400);
  });

  test("Request has invalid user", async ({ client, expect }) => {
    const res = await client.post("/auth/reset-password").json({
      email: "invalid",
      code: "invalid",
      password: "12345678",
    });

    expect(res.status()).toBe(401);
  });

  test("Request has invalid code", async ({ client, expect }) => {
    await client.post("/auth/register").json({
      email,
    });

    const res = await client.post("/auth/reset-password").json({
      email,
      code: "invalid",
      password: "12345678",
    });

    expect(res.status()).toBe(401);
  });
});
