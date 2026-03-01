import { faker } from "@faker-js/faker";
import { test } from "@japa/runner";

test.group("POST /auth/register", () => {
  const payload = {
    name: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  test("Validate request", async ({ expect, client }) => {
    const res = await client.post("/auth/register").json({});
    expect(res.status()).toBe(400);
  });

  test("Request has valid email", async ({ expect, client }) => {
    const res = await client.post("/auth/register").json({
      ...payload,
      email: "vlas",
    });
    expect(res.status()).toBe(400);
  });

  test("Request has valid password", async ({ expect, client }) => {
    const res = await client.post("/auth/register").json({
      ...payload,
      password: "123456",
    });
    expect(res.status()).toBe(400);
  });

  test("Creates a new user", async ({ expect, client }) => {
    const res = await client.post("/auth/register").json(payload);

    expect(res.status()).toBe(200);
    expect(res.body()).toHaveProperty("createdAt");
    expect(res.cookie("session")).toBeDefined();
  });

  test("Check if user exists", async ({ expect, client }) => {
    const res = await client.post("/auth/register").json(payload);

    expect(res.status()).toBe(409);
  });
});
