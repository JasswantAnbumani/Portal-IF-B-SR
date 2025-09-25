const { Router } = require("express");
const { randomUUID } = require("crypto");
const { getAll, saveAll } = require("../lib/db");
const { verifyToken } = require("../lib/auth");

const router = Router();

router.get("/", (req, res) => {
  const db = getAll();
  const items = [...db.shop].sort((a, b) => b.createdAt - a.createdAt);
  res.json(items);
});

router.post("/", verifyToken, (req, res) => {
  const { name, price, image, desc } = req.body || {};
  const numPrice = Number(price);
  if (!name || Number.isNaN(numPrice)) return res.status(400).json({ error: "name and numeric price are required" });
  const db = getAll();
  const item = {
    id: randomUUID(),
    name: String(name).trim(),
    price: Math.max(0, Math.round(numPrice)),
    image: String(image || "").trim(),
    desc: String(desc || "").trim(),
    createdAt: Date.now()
  };
  db.shop.unshift(item);
  saveAll(db);
  res.status(201).json(item);
});

router.delete("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const db = getAll();
  const before = db.shop.length;
  db.shop = db.shop.filter((x) => x.id !== id);
  if (db.shop.length === before) return res.status(404).json({ error: "Not found" });
  saveAll(db);
  res.json({ ok: true });
});

module.exports = router;