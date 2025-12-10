describe("Backend health", () => {
  it("GET / raspunde corect", () => {
    cy.request("/").then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.eq("Backend is running!");
    });
  });

  it("POST /api/register creeaza user", () => {
    cy.request("POST", "/api/register", {
      numeUtilizator: "cypress",
      email: "cypress@gmail.com",
      parola: "parola123",
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("user");
      expect(res.body.user).to.have.property("id");
    });
  });

  let token;

  it("POST /api/login face login", () => {
    cy.request("POST", "/api/login", {
      email: "cypress@gmail.com",
      parola: "parola123",
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("token");
      token = res.body.token;
    });
  });

  it("GET /api/retete cu auth", () => {
    cy.request({
      method: "GET",
      url: "/api/retete",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("GET /api/retete/:id cu auth", () => {
    cy.request({
      method: "GET",
      url: "/api/retete/11",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("DELETE /api/retete/:id cu auth", () => {
    cy.request({
      method: "DELETE",
      url: "/api/retete/18",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it("creează o rețetă cu succes", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:8383/api/retete",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        titlu: "Reteta de test",
        descriere: "Descriere reteta de test",
        timpMinute: 25,
        categorie: "DULCE",
        dificultate: "USOR",
      },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property("id");
      expect(res.body.titlu).to.eq("Reteta de test");
      expect(res.body.descriere).to.eq("Descriere reteta de test");
      expect(res.body.timpMinute).to.eq(25);
      expect(res.body.categorie).to.eq("DULCE");
      expect(res.body.dificultate).to.eq("USOR");
    });
  });

  it("actualizează o rețetă cu succes", () => {
    cy.request({
      method: "POST",
      url: "http://localhost:8383/api/retete",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        titlu: "Reteta initiala",
        descriere: "Descriere initiala",
        timpMinute: 20,
        categorie: "DULCE",
        dificultate: "USOR",
      },
    }).then((createRes) => {
      expect(createRes.status).to.eq(201);
      const id = createRes.body.id;
      expect(id).to.exist;

      cy.request({
        method: "PUT",
        url: `http://localhost:8383/api/retete/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          titlu: "Reteta actualizata",
          descriere: "Descriere actualizata",
          timpMinute: 35,
          categorie: "SARAT",
          dificultate: "MEDIU",
        },
      }).then((updateRes) => {
        expect(updateRes.status).to.eq(200);
        expect(updateRes.body.id).to.eq(id);
        expect(updateRes.body.titlu).to.eq("Reteta actualizata");
        expect(updateRes.body.descriere).to.eq("Descriere actualizata");
        expect(updateRes.body.timpMinute).to.eq(35);
        expect(updateRes.body.categorie).to.eq("SARAT");
        expect(updateRes.body.dificultate).to.eq("MEDIU");
      });
    });
  });
});
