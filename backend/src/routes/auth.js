const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { sign, hardcodedLogin } = require("../lib/auth");

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/login", loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "username and password are required" });
  if (!hardcodedLogin({ username, password })) return res.status(401).json({ error: "Invalid credentials" });
  const token = sign({ username });
  res.json({ token });
});

module.exports = router;