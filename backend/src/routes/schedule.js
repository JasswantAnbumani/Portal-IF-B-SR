const { Router } = require("express");
const { randomUUID } = require("crypto");
const { getAll, saveAll, validDay } = require("../lib/db");
const { verifyToken } = require("../lib/auth");

const router = Router();

router.get("/", (req, res) => {
  const db = getAll();
  res.json(db.schedule);
});

router.get("/:day", (req, res) => {
  const day = req.params.day;
  if (!validDay(day)) return res.status(400).json({ error: "Invalid day" });
  const db = getAll();
  res.json(db.schedule[day] || []);
});

router.post("/", verifyToken, (req, res) => {
  const { day, course, time, room, lecturer } = req.body || {};
  if (!validDay(day)) return res.status(400).json({ error: "Invalid day" });
  if (!course || !time) return res.status(400).json({ error: "course and time are required" });
  const db = getAll();
  const entry = {
    id: randomUUID(),
    course: String(course).trim(),
    time: String(time).trim(),
    room: String(room || "").trim(),
    lecturer: String(lecturer || "").trim()
  };
  db.schedule[day] = db.schedule[day] || [];
  db.schedule[day].push(entry);
  saveAll(db);
  res.status(201).json(entry);
});

router.delete("/:day/:id", verifyToken, (req, res) => {
  const { day, id } = req.params;
  if (!validDay(day)) return res.status(400).json({ error: "Invalid day" });
  const db = getAll();
  const before = (db.schedule[day] || []).length;
  db.schedule[day] = (db.schedule[day] || []).filter((x) => x.id !== id);
  if (db.schedule[day].length === before) return res.status(404).json({ error: "Not found" });
  saveAll(db);
  res.json({ ok: true });
});

module.exports = router;