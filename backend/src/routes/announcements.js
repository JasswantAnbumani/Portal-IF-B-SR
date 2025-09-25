const { Router } = require("express");
const { randomUUID } = require("crypto");
const { getAll, saveAll } = require("../lib/db");
const { verifyToken } = require("../lib/auth");

const router = Router();

router.get("/", (req, res) => {
  const db = getAll();
  const data = [...db.announcements].sort((a, b) => b.createdAt - a.createdAt);
  res.json(data);
});

router.post("/", verifyToken, (req, res) => {
  const { text } = req.body || {};
  if (!text || String(text).trim().length === 0) return res.status(400).json({ error: "text is required" });
  const db = getAll();
  const item = { id: randomUUID(), text: String(text).trim(), createdAt: Date.now() };
  db.announcements.unshift(item);
  saveAll(db);
  res.status(201).json(item);
});

router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const db = getAll();
  const before = db.announcements.length;
  db.announcements = db.announcements.filter((x) => x.id !== id);
  if (db.announcements.length === before) return res.status(404).json({ error: "Not found" });
  saveAll(db);
  res.json({ ok: true });
});

module.exports = router;