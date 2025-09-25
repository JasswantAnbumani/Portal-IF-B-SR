const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { randomUUID } = require("crypto");
const { getAll, saveAll } = require("../lib/db");
const { verifyToken } = require("../lib/auth");

const router = Router();

const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});

router.get("/", verifyToken, (req, res) => {
  const db = getAll();
  const items = [...db.feedback].sort((a, b) => b.createdAt - a.createdAt);
  res.json(items);
});

router.post("/", feedbackLimiter, (req, res) => {
  const { message } = req.body || {};
  if (!message || String(message).trim().length === 0) return res.status(400).json({ error: "message is required" });
  const db = getAll();
  const item = { id: randomUUID(), message: String(message).trim(), createdAt: Date.now() };
  db.feedback.unshift(item);
  saveAll(db);
  res.status(201).json({ ok: true });
});

router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const db = getAll();
  const before = db.feedback.length;
  db.feedback = db.feedback.filter((x) => x.id !== id);
  if (db.feedback.length === before) return res.status(404).json({ error: "Not found" });
  saveAll(db);
  res.json({ ok: true });
});

module.exports = router;