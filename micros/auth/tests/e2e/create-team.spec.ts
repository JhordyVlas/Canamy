import { faker } from "@faker-js/faker";
import { test } from "@japa/runner";

test.group("POST /auth/teams", async () => {
  let cookieValue: string;

  test("User is not authenticated", async ({ client, expect }) => {
    const response = await client.post("/auth/teams").json({});

    expect(response.status()).toBe(401);
  });

  test("Validates the request", async ({ client, expect }) => {
    const register = await client.post("/auth/register").json({
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    cookieValue = register.cookie("session")?.value;
    const response = await client.post("/auth/teams").json({}).cookie("session", cookieValue);

    expect(response.status()).toBe(400);
  });

  test("Creates a new team", async ({ client, expect }) => {
    const response = await client
      .post("/auth/teams")
      .json({
        name: faker.company.name(),
      })
      .cookie("session", cookieValue);

    expect(response.status()).toBe(200);
    expect(response.body()).toHaveProperty("createdAt");
  });
});
