const jwt = require("jsonwebtoken");

const ADMIN = { user: "admin", pass: "ifbsr123" };

function sign(payload = {}) {
  const secret = process.env.JWT_SECRET || "dev_secret_change_me";
  return jwt.sign({ ...payload, role: "admin" }, secret, { expiresIn: "12h" });
}

function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function hardcodedLogin({ username, password }) {
  return username === ADMIN.user && password === ADMIN.pass;
}

module.exports = { sign, verifyToken, hardcodedLogin };