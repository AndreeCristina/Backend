const express = require("express"); //accesam express
const app = express(); //creeaza backend-ul aplicatie noastre
const PORT = 8383;
const db = require("./dbClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cors = require("cors");

const JWT_SECRET = "proiectAndreea";

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.post("/api/auth", async (req, res) => {
  try {
    const { numeUtilizator, email, parola } = req.body;

    if (!numeUtilizator || !email || !parola) {
      return res
        .status(400)
        .json({ message: "Te rog completează toate câmpurile." });
    }

    // verificăm dacă emailul există deja
    const userExistent = await db.user.findUnique({
      where: { email },
    });

    if (userExistent) {
      return res.status(400).json({ message: "Email deja folosit." });
    }

    const parolaHash = await bcrypt.hash(parola, 10);

    const user = await db.user.create({
      data: {
        numeUtilizator,
        email,
        parola: parolaHash,
      },
    });

    res.status(201).json({ user });
  } catch (err) {
    console.error("Eroare la înregistrare:", err);
    res.status(500).json({
      message: "Eroare la înregistrare",
      error: err.message,
    });
  }
});

app.post("/api/retete", async (req, res) => {
  try {
    const { titlu, descriere, timpMinute, categorie, dificultate } = req.body;

    if (!titlu || !descriere || !timpMinute || !categorie || !dificultate) {
      return res
        .status(400)
        .json({ message: "Lipsesc câmpuri obligatorii pentru rețetă" });
    }

    const reteta = await db.reteta.create({
      data: {
        titlu,
        descriere,
        timpMinute: Number(timpMinute),
        categorie,
        dificultate,
      },
    });

    res.status(201).json(reteta);
  } catch (err) {
    console.error("Eroare la crearea rețetei:", err);
    res
      .status(500)
      .json({ message: "Eroare la crearea rețetei", error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
//sa asculte orice request venit pe portul nostru
