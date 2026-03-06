import { faker } from "@faker-js/faker";
import { test } from "@japa/runner";

test.group("GET /auth/teams", async () => {
  let cookieValue: string;

  test("User is not authenticated", async ({ client, expect }) => {
    const response = await client.post("/auth/teams").json({});

    expect(response.status()).toBe(401);
  });

  test("Validates the request query params", async ({ client, expect }) => {
    const register = await client.post("/auth/register").json({
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    });

    cookieValue = register.cookie("session")?.value;

    const response = await client
      .get("/auth/teams")
      .qs({ orderBy: "invalid_key" })
      .cookie("session", cookieValue);

    expect(response.status()).toBe(400);
  });

  test("Gets paginated teams", async ({ client, expect }) => {
    const response = await client
      .get("/auth/teams")
      .qs({ page: 1, limit: 10, orderBy: "id", orderDir: "asc" })
      .cookie("session", cookieValue);

    expect(response.status()).toBe(200);
    expect(response.body()).toHaveProperty("data");
    expect(response.body()).toHaveProperty("meta");
  });
});
