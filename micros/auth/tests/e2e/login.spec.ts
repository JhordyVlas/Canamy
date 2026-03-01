import { faker } from "@faker-js/faker";
import { test } from "@japa/runner";

test.group("POST /auth/login", () => {
  const payload = {
    name: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  test("Validate request", async ({ expect, client }) => {
    const res = await client.post("/auth/login").json({});
    expect(res.status()).toBe(400);
  });

  test("Invalid credentials", async ({ expect, client }) => {
    const res = await client.post("/auth/login").json({
      ...payload,
      password: "1234",
    });
    expect(res.status()).toBe(401);
  });

  test("Logins a user", async ({ expect, client }) => {
    await client.post("/auth/register").json(payload);
    const res = await client.post("/auth/login").json(payload);

    expect(res.status()).toBe(200);
    expect(res.body()).toHaveProperty("createdAt");
    expect(res.cookie("session")).toBeDefined();
  });
});
