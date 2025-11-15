const jwt = require("jsonwebtoken");
const JWT_SECRET = "proiectAndreea";

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token lipsă. Acces interzis." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid." });
  }
}

module.exports = authMiddleware;
