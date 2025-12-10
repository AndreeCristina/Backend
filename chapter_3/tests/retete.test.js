const request = require("supertest");

const API = "http://localhost:8383";

describe("REGISTER /api/register", () => {
  it("utilizator nou", async () => {
    const res = await request(API).post("/api/register").send({
      numeUtilizator: "jest1",
      email: "jest1@gmail.com",
      parola: "parola123",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("jest1@gmail.com");
    expect(res.body.user.numeUtilizator).toBe("jest1");
  });

  test("LOGIN - returneaza token", async () => {
    const res = await request(API).post("/api/login").send({
      email: "jest@gmail.com",
      parola: "parola123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
    expect(token).toBeDefined();
  });
  it("GET - returneaza lista de retete", async () => {
    const res = await request(API)
      .get("/api/retete")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("POST /api/user/detalii - salveaza prenume si numeFamilie", async () => {
    const res = await request(API)
      .post("/api/user/detalii")
      .set("Authorization", `Bearer ${token}`)
      .send({
        prenume: "Ion",
        numeFamilie: "Popescu",
      });

    expect(res.status).toBe(200);
  });
});
