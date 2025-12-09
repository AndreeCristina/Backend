const express = require("express"); //accesam express
const app = express(); //creeaza backend-ul aplicatie noastre
const PORT = 8383;
const db = require("./dbClient");
const bcrypt = require("bcryptjs");
const auth = require("./auth");

const path = require("path");
const multer = require("multer");

const cors = require("cors");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());

app.use(express.json());
const upload = multer({
  dest: path.join(__dirname, "uploads"),
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/api/register", async (req, res) => {
  try {
    const { numeUtilizator, email, parola } = req.body;

    if (!numeUtilizator || !email || !parola) {
      return res
        .status(400)
        .json({ message: "Te rog completează toate câmpurile." });
    }

    const userExistent = await db.user.findUnique({
      where: { email },
    });

    if (userExistent) {
      return res.status(400).json({ message: "Email deja folosit." });
    }

    const numeUtilizatorExistent = await db.user.findUnique({
      where: { numeUtilizator },
    });

    if (numeUtilizatorExistent) {
      return res
        .status(400)
        .json({ message: "Numele de utilizator a fost deja folosit." });
    }

    const parolaHash = await bcrypt.hash(parola, 10);

    const user = await db.user.create({
      data: {
        numeUtilizator,
        email,
        parola: parolaHash,
      },
    });

    res.status(201).json({ message: "Utilizator creat cu succes", user });
  } catch (err) {
    console.error("Eroare la înregistrare:", err);
    res.status(500).json({
      message: "Eroare la înregistrare",
      error: err.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, parola } = req.body;

    if (!email || !parola) {
      return res
        .status(400)
        .json({ message: "Te rog completează email și parola." });
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Emailul nu există în sistem." });
    }

    const parolaCorecta = await bcrypt.compare(parola, user.parola);
    if (!parolaCorecta) {
      return res.status(400).json({ message: "Parola este incorectă." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error("Eroare la conectare:", err);
    res.status(500).json({
      message: "Eroare la conectare",
      error: err.message,
    });
  }
});

app.post("/api/retete", auth, upload.single("image"), async (req, res) => {
  try {
    const { titlu, descriere, timpMinute, categorie, dificultate } = req.body;

    if (
      !titlu ||
      !descriere ||
      !timpMinute ||
      !categorie ||
      !dificultate ||
      !req.file
    ) {
      return res
        .status(400)
        .json({ message: "Lipsesc câmpuri obligatorii pentru rețetă" });
    }
    let imageUrl;

    if (req.file) {
      imageUrl = "/uploads/" + req.file.filename;
    } else {
      imageUrl = null;
    }

    const reteta = await db.reteta.create({
      data: {
        titlu,
        descriere,
        timpMinute: Number(timpMinute),
        categorie,
        dificultate,
        imageUrl: imageUrl,
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

app.get("/api/retete", auth, async (req, res) => {
  try {
    const retete = await db.reteta.findMany();
    res.status(200).json(retete);
  } catch (err) {
    console.error("Eroare la obținerea rețetelor:", err);
    res.status(500).json({
      message: "Eroare la obținerea rețetelor",
      error: err.message,
    });
  }
});

app.delete("/api/retete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const reteta = await db.reteta.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      message: "Rețetă ștearsă cu succes",
      reteta,
    });
  } catch (err) {
    console.error("Eroare la ștergere rețetă:", err);
    res.status(500).json({
      message: "Eroare la ștergere rețetă",
      error: err.message,
    });
  }
});

app.put("/api/retete/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { titlu, descriere, timpMinute, categorie, dificultate } = req.body;

    if (
      !titlu ||
      !descriere ||
      !timpMinute ||
      !categorie ||
      !dificultate ||
      !req.file
    ) {
      return res.status(400).json({
        message: "Lipsesc câmpuri obligatorii pentru actualizare",
      });
    }
    const retetaExistenta = await db.reteta.findUnique({
      where: { id: Number(id) },
    });

    if (!retetaExistenta) {
      return res.status(404).json({ message: "Rețeta nu există!" });
    }

    let imageUrl = retetaExistenta.imageUrl;

    if (req.file) {
      imageUrl = "/uploads/" + req.file.filename;
    }

    const reteta = await db.reteta.update({
      where: { id: Number(id) },
      data: {
        titlu,
        descriere,
        timpMinute: Number(timpMinute),
        categorie,
        dificultate,
        imageUrl: imageUrl,
      },
    });

    res.status(200).json(reteta);
  } catch (err) {
    console.error("Eroare la actualizarea rețetei:", err);
    res.status(500).json({
      message: "Eroare la actualizarea rețetei",
      error: err.message,
    });
  }
});

app.get("/api/retete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const reteta = await db.reteta.findUnique({
      where: { id: Number(id) },
    });

    if (!reteta) {
      return res.status(404).json({ message: "Rețeta nu există" });
    }

    res.status(200).json(reteta);
  } catch (err) {
    console.error("Eroare la obținerea rețetei:", err);
    res.status(500).json({
      message: "Eroare la obținerea rețetei",
      error: err.message,
    });
  }
});

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(PORT, () => console.log(`Server has started on: ${PORT}`));
//sa asculte orice request venit pe portul nostru
