// Seed data default untuk IF B SR
(function initSeed(){
  const defaultAnnouncements = [
    { id: crypto.randomUUID(), text: "Ujian Tengah Semester dimulai pekan depan. Siapkan belajar!", createdAt: Date.now() - 86400000*2 },
    { id: crypto.randomUUID(), text: "Pengumpulan tugas Alpro3 diperpanjang hingga Jumat 23:59.", createdAt: Date.now() - 86400000 },
    { id: crypto.randomUUID(), text: "Jangan lupa hadir tepat waktu. Absen via portal.", createdAt: Date.now() - 3600000 },
  ];

  const defaultPrayers = {
    Senin: "Raka",
    Selasa: "Nadia",
    Rabu: "Fikri",
    Kamis: "Tania",
    Jumat: "Bima",
    Sabtu: "Alya"
  };

  const defaultSchedule = {
    Senin: [
      { id: crypto.randomUUID(), course: "Algoritma & Pemrograman 3", time: "08:00-10:00", room: "A-101", lecturer: "Dr. R. Santoso" },
      { id: crypto.randomUUID(), course: "Sistem Basis Data", time: "13:00-15:00", room: "Lab-2", lecturer: "Ir. L. Pratama" }
    ],
    Selasa: [
      { id: crypto.randomUUID(), course: "Matematika Diskrit", time: "09:00-11:00", room: "B-203", lecturer: "Dr. H. Wibowo" }
    ],
    Rabu: [
      { id: crypto.randomUUID(), course: "Struktur Data", time: "08:00-10:00", room: "Lab-1", lecturer: "S. Putri, M.Kom" }
    ],
    Kamis: [
      { id: crypto.randomUUID(), course: "Jaringan Komputer", time: "10:00-12:00", room: "C-303", lecturer: "M. Ardi, M.Kom" }
    ],
    Jumat: [
      { id: crypto.randomUUID(), course: "Pemrograman Web", time: "08:00-10:00", room: "Lab-3", lecturer: "N. Ananda, M.Kom" }
    ],
    Sabtu: []
  };

  const defaultShop = [
    { id: crypto.randomUUID(), name: "Kaos Angkatan (Hitam)", price: 75000, image: "https://picsum.photos/seed/ifbsr1/600/380", desc: "Kaos katun combed 24s, sablon plastisol, size S-XXL." },
    { id: crypto.randomUUID(), name: "Stiker Laptop IF B SR", price: 15000, image: "https://picsum.photos/seed/ifbsr2/600/380", desc: "Stiker vinyl tahan air, 8x8cm, desain eksklusif kelas." },
    { id: crypto.randomUUID(), name: "Totebag IF B SR", price: 45000, image: "https://picsum.photos/seed/ifbsr3/600/380", desc: "Totebag kanvas tebal, muat buku dan laptop, logo bordir." }
  ];

  const defaultQuotes = [
    "Belajar itu seperti mendayung melawan arus; jika tidak maju, maka akan mundur.",
    "Konsistensi mengalahkan intensitas.",
    "Sedikit demi sedikit, lama-lama menjadi bukit.",
    "Tidak ada usaha yang mengkhianati hasil.",
    "Fokus pada proses, hasil akan mengikuti."
  ];

  const exists = (k)=> localStorage.getItem(k) !== null;
  if(!exists("ifbsr_announcements")) localStorage.setItem("ifbsr_announcements", JSON.stringify(defaultAnnouncements));
  if(!exists("ifbsr_prayers")) localStorage.setItem("ifbsr_prayers", JSON.stringify(defaultPrayers));
  if(!exists("ifbsr_schedule")) localStorage.setItem("ifbsr_schedule", JSON.stringify(defaultSchedule));
  if(!exists("ifbsr_shop")) localStorage.setItem("ifbsr_shop", JSON.stringify(defaultShop));
  if(!exists("ifbsr_feedback")) localStorage.setItem("ifbsr_feedback", JSON.stringify([]));
  if(!exists("ifbsr_quotes")) localStorage.setItem("ifbsr_quotes", JSON.stringify(defaultQuotes));
})();