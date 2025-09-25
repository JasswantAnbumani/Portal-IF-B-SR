const { Router } = require("express");
const { getAll, saveAll } = require("../lib/db");
const { verifyToken } = require("../lib/auth");

const router = Router();

router.get("/", (req, res) => {
  const db = getAll();
  res.json(db.quotes || []);
});

// Optional admin maintenance
router.post("/", verifyToken, (req, res) => {
  const { quote } = req.body || {};
  if (!quote || String(quote).trim().length === 0) return res.status(400).json({ error: "quote is required" });
  const db = getAll();
  db.quotes = db.quotes || [];
  db.quotes.push(String(quote).trim());
  saveAll(db);
  res.status(201).json({ ok: true });
});

module.exports = router;