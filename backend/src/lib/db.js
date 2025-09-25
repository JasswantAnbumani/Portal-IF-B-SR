const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const defaults = () => ({
  announcements: [
    { id: randomUUID(), text: "Ujian Tengah Semester dimulai pekan depan. Siapkan belajar!", createdAt: Date.now() - 86400000 * 2 },
    { id: randomUUID(), text: "Pengumpulan tugas Alpro3 diperpanjang hingga Jumat 23:59.", createdAt: Date.now() - 86400000 },
    { id: randomUUID(), text: "Jangan lupa hadir tepat waktu. Absen via portal.", createdAt: Date.now() - 3600000 }
  ],
  prayers: {
    Senin: "Raka",
    Selasa: "Nadia",
    Rabu: "Fikri",
    Kamis: "Tania",
    Jumat: "Bima",
    Sabtu: "Alya"
  },
  schedule: {
    Senin: [
      { id: randomUUID(), course: "Algoritma & Pemrograman 3", time: "08:00-10:00", room: "A-101", lecturer: "Dr. R. Santoso" },
      { id: randomUUID(), course: "Sistem Basis Data", time: "13:00-15:00", room: "Lab-2", lecturer: "Ir. L. Pratama" }
    ],
    Selasa: [{ id: randomUUID(), course: "Matematika Diskrit", time: "09:00-11:00", room: "B-203", lecturer: "Dr. H. Wibowo" }],
    Rabu: [{ id: randomUUID(), course: "Struktur Data", time: "08:00-10:00", room: "Lab-1", lecturer: "S. Putri, M.Kom" }],
    Kamis: [{ id: randomUUID(), course: "Jaringan Komputer", time: "10:00-12:00", room: "C-303", lecturer: "M. Ardi, M.Kom" }],
    Jumat: [{ id: randomUUID(), course: "Pemrograman Web", time: "08:00-10:00", room: "Lab-3", lecturer: "N. Ananda, M.Kom" }],
    Sabtu: []
  },
  shop: [
    { id: randomUUID(), name: "Kaos Angkatan (Hitam)", price: 75000, image: "https://picsum.photos/seed/ifbsr1/600/380", desc: "Kaos katun combed 24s, sablon plastisol, size S-XXL.", createdAt: Date.now() },
    { id: randomUUID(), name: "Stiker Laptop IF B SR", price: 15000, image: "https://picsum.photos/seed/ifbsr2/600/380", desc: "Stiker vinyl tahan air, 8x8cm, desain eksklusif kelas.", createdAt: Date.now() },
    { id: randomUUID(), name: "Totebag IF B SR", price: 45000, image: "https://picsum.photos/seed/ifbsr3/600/380", desc: "Totebag kanvas tebal, muat buku dan laptop, logo bordir.", createdAt: Date.now() }
  ],
  feedback: [],
  quotes: [
    "Belajar itu seperti mendayung melawan arus; jika tidak maju, maka akan mundur.",
    "Konsistensi mengalahkan intensitas.",
    "Sedikit demi sedikit, lama-lama menjadi bukit.",
    "Tidak ada usaha yang mengkhianati hasil.",
    "Fokus pada proses, hasil akan mengikuti."
  ]
});

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readDb() {
  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

function ensureDbInitialized() {
  ensureDir(DATA_DIR);
  if (!fs.existsSync(DB_PATH)) {
    writeDb(defaults());
    console.log("Database initialized with defaults at", DB_PATH);
  }
}

// CRUD helpers (sync to avoid race for small app)
function getAll() {
  return readDb();
}
function saveAll(data) {
  writeDb(data);
}

// Export helpers + small domain helpers
function validDay(day) {
  return days.includes(day);
}

module.exports = {
  ensureDbInitialized,
  getAll,
  saveAll,
  validDay
};