// Util
const $ = (sel, el=document)=> el.querySelector(sel);
const $$ = (sel, el=document)=> Array.from(el.querySelectorAll(sel));
const fmtRp = (n)=> new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0}).format(n);
const daysID = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

const API_BASE = (() => {
  if (typeof window !== "undefined" && window.IFBSR_API_BASE) return window.IFBSR_API_BASE.replace(/\/+$/,'');
  if (location && location.protocol.startsWith("http")) return (location.origin.replace(/\/+$/,'') + "/api");
  return "http://localhost:4000/api";
})();

function getToken(){ return sessionStorage.getItem("ifbsr_token") || ""; }
function setToken(t){ if(t) sessionStorage.setItem("ifbsr_token", t); }
function clearToken(){ sessionStorage.removeItem("ifbsr_token"); }

async function api(path, { method="GET", body, auth=false } = {}){
  const headers = { "Content-Type": "application/json" };
  if(auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if(res.status === 401){
    // token invalid/expired
    clearToken();
    throw new Error("Unauthorized");
  }
  if(!res.ok){
    let msg = "Request failed";
    try { const j = await res.json(); msg = j.error || msg } catch {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  // Some 204 endpoints may not have JSON
  if(res.status === 204) return null;
  return res.json();
}

function nowDayName(){
  const d = new Date();
  return daysID[d.getDay()];
}

function relativeTime(timestamp){
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff/60000);
  if(mins < 1) return "baru saja";
  if(mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins/60);
  if(hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs/24);
  return `${days} hari lalu`;
}

// Router
const routes = ["home","schedule","shop","about","admin"];
function setRoute(route){
  routes.forEach(r=>{
    const page = $("#page-" + r);
    page.classList.toggle("visible", r === route);
    const link = `.nav-link[data-route="${r}"]`;
    $$(link).forEach(btn=>btn.classList.toggle("active", r===route));
  });
  if(route === "home") renderHome();
  if(route === "schedule") renderSchedule();
  if(route === "shop") renderShop();
  if(route === "about") {/* nothing */}
  if(route === "admin") renderAdmin();
  window.scrollTo({top:0, behavior:"smooth"});
}
$$(".nav-link").forEach(btn=>{
  btn.addEventListener("click", ()=> setRoute(btn.dataset.route));
});

// Home rendering
async function renderHome(){
  // Pengumuman
  const ul = $("#home-announcements");
  ul.innerHTML = "";
  try{
    const ann = await api("/announcements");
    if(ann.length === 0){
      ul.innerHTML = `<li class="item">Belum ada pengumuman.</li>`;
    }else{
      ann.slice(0,6).forEach(a=>{
        const li = document.createElement("li");
        li.className="item";
        li.innerHTML = `<div>${a.text}</div><div class="meta">${relativeTime(a.createdAt)}</div>`;
        ul.appendChild(li);
      });
    }
  }catch(e){
    ul.innerHTML = `<li class="item">Gagal memuat pengumuman.</li>`;
  }

  // Petugas doa
  const grid = $("#home-prayers");
  grid.innerHTML = "";
  try{
    const prayers = await api("/prayers");
    ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"].forEach(d=>{
      const name = prayers[d] || "-";
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<div class="muted small">${d}</div><div style="font-size:18px;font-weight:700">${name}</div>`;
      grid.appendChild(card);
    });
  }catch(e){
    grid.innerHTML = `<div class="card">Gagal memuat petugas doa.</div>`;
  }

  // Jadwal hari ini
  const list = $("#home-today-schedule");
  list.innerHTML = "";
  const today = nowDayName();
  if(today === "Minggu"){
    list.innerHTML = `<li class="item">Tidak ada jadwal untuk hari Minggu.</li>`;
  }else{
    try{
      const items = await api(`/schedule/${encodeURIComponent(today)}`);
      if(items.length === 0){
        list.innerHTML = `<li class="item">Tidak ada jadwal untuk hari ${today}.</li>`;
      }else{
        items.forEach(it=>{
          const li = document.createElement("li");
          li.className = "item";
          li.innerHTML = `<div>
            <div style="font-weight:700">${it.course}</div>
            <div class="meta">${it.time} • ${it.room} • ${it.lecturer}</div>
          </div>`;
          list.appendChild(li);
        });
      }
    }catch(e){
      list.innerHTML = `<li class="item">Gagal memuat jadwal hari ini.</li>`;
    }
  }

  // Quote of the day
  try{
    const quotes = await api("/quotes");
    const index = new Date().getDate() % (quotes.length || 1);
    $("#home-quote").textContent = quotes[index] || "Semangat belajar hari ini!";
  }catch{
    $("#home-quote").textContent = "Semangat belajar hari ini!";
  }

  // feedback form (bind once)
  const form = $("#feedback-form");
  form.replaceWith(form.cloneNode(true)); // prevent double-binding
  const newForm = $("#feedback-form");
  newForm.addEventListener("submit", onFeedbackSubmit);
}
async function onFeedbackSubmit(e){
  e.preventDefault();
  const msgEl = $("#feedback-message");
  const status = $("#feedback-status");
  const msg = msgEl.value.trim();
  if(!msg){ status.textContent = "Tolong tulis pesan feedback."; return; }
  status.textContent = "Mengirim...";
  try{
    await api("/feedback", { method:"POST", body:{ message: msg } });
    msgEl.value = "";
    status.textContent = "Terima kasih! Feedback Anda tersimpan (anonim).";
  }catch(err){
    status.textContent = "Gagal mengirim feedback.";
  }finally{
    setTimeout(()=> status.textContent="", 2500);
  }
}

// Tabs home
$$(".tab").forEach(tab=>{
  tab.addEventListener("click", ()=>{
    const name = tab.dataset.tab;
    $$(".tab").forEach(t=>t.classList.toggle("active", t===tab));
    $$(".tabpanel").forEach(p=>p.classList.toggle("visible", p.dataset.tabpanel===name));
  });
});

// Schedule
let currentScheduleDay = "Senin";
const scheduleCache = new Map();

function renderSchedule(){
  const search = $("#schedule-search");
  const tabs = $$(".day-tab");
  tabs.forEach(b=>{
    b.classList.toggle("active", b.dataset.day === currentScheduleDay);
    b.onclick = ()=>{
      currentScheduleDay = b.dataset.day;
      tabs.forEach(t=>t.classList.toggle("active", t===b));
      updateScheduleList();
    };
  });
  search.oninput = ()=> updateScheduleList();
  updateScheduleList();
}

async function fetchScheduleDay(day){
  if(scheduleCache.has(day)) return scheduleCache.get(day);
  const items = await api(`/schedule/${encodeURIComponent(day)}`);
  scheduleCache.set(day, items);
  return items;
}

async function updateScheduleList(){
  const list = $("#schedule-list");
  const q = ($("#schedule-search").value || "").toLowerCase().trim();
  list.innerHTML = `<li class="item">Memuat...</li>`;

  if(currentScheduleDay === "Minggu"){
    list.innerHTML = `<li class="item">Belum ada jadwal untuk Minggu.</li>`;
    return;
  }

  try{
    const items = await fetchScheduleDay(currentScheduleDay);
    const filtered = items.filter(it=>{
      if(!q) return true;
      const s = `${it.course} ${it.room} ${it.lecturer} ${it.time}`.toLowerCase();
      return s.includes(q);
    });

    list.innerHTML = "";
    if(filtered.length === 0){
      list.innerHTML = `<li class="item">Belum ada jadwal untuk ${currentScheduleDay}.</li>`;
      return;
    }
    filtered.forEach(it=>{
      const li = document.createElement("li");
      li.className="item";
      li.innerHTML = `
        <div>
          <div style="font-weight:700">${it.course}</div>
          <div class="meta">${it.time} • ${it.room} • ${it.lecturer}</div>
        </div>
        <button class="btn ghost small-btn" data-id="${it.id}">Detail</button>
      `;
      li.querySelector("button").onclick = ()=> openModal(`
        <h3>${it.course}</h3>
        <p><strong>Hari:</strong> ${currentScheduleDay}</p>
        <p><strong>Waktu:</strong> ${it.time}</p>
        <p><strong>Ruang:</strong> ${it.room}</p>
        <p><strong>Dosen:</strong> ${it.lecturer}</p>
      `);
      list.appendChild(li);
    });
  }catch(e){
    list.innerHTML = `<li class="item">Gagal memuat jadwal.</li>`;
  }
}

// Shop
async function renderShop(){
  const grid = $("#shop-grid");
  grid.innerHTML = "";
  try{
    const items = await api("/shop");
    if(items.length === 0){
      grid.innerHTML = `<div class="card">Belum ada produk di toko.</div>`;
      return;
    }
    grid.innerHTML = "";
    items.forEach(p=>{
      const card = document.createElement("div");
      card.className="shop-card";
      card.innerHTML = `
        <img class="shop-thumb" src="${p.image || 'https://picsum.photos/seed/noimg/600/380'}" alt="${p.name}"/>
        <div class="shop-body">
          <div style="font-weight:700">${p.name}</div>
          <div class="price">${fmtRp(p.price)}</div>
        </div>
      `;
      card.onclick = ()=> openModal(`
        <img src="${p.image || 'https://picsum.photos/seed/noimg/960/600'}" alt="${p.name}" style="width:100%;border-radius:10px;aspect-ratio:16/10;object-fit:cover;margin-bottom:10px"/>
        <h3 style="margin:6px 0">${p.name}</h3>
        <div class="price" style="margin:6px 0">${fmtRp(p.price)}</div>
        <p>${p.desc || ""}</p>
      `);
      grid.appendChild(card);
    });
  }catch(e){
    grid.innerHTML = `<div class="card">Gagal memuat toko.</div>`;
  }
}

// Modal
function openModal(html){
  $("#modal-body").innerHTML = html;
  $("#modal").classList.remove("hidden");
}
$("#modal-close").onclick = ()=> $("#modal").classList.add("hidden");
$(".modal-backdrop").onclick = ()=> $("#modal").classList.add("hidden");

// Admin
function isAdmin(){
  return !!getToken();
}

function renderAdmin(){
  $("#admin-logged-out").classList.toggle("hidden", isAdmin());
  $("#admin-logged-in").classList.toggle("hidden", !isAdmin());
  if(isAdmin()){
    populateAdminData();
  }else{
    attachLoginOnce();
  }
}

function attachLoginOnce(){
  const form = $("#admin-login-form");
  const status = $("#admin-login-status");
  // Remove previous listener and reattach once
  const fresh = form.cloneNode(true);
  form.parentNode.replaceChild(fresh, form);
  const newForm = $("#admin-login-form");
  newForm.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const user = $("#admin-username").value.trim();
    const pass = $("#admin-password").value;
    if(!user || !pass){ status.textContent = "Lengkapi username dan password."; return; }
    status.textContent = "Masuk...";
    try{
      const out = await api("/auth/login", { method:"POST", body:{ username:user, password:pass } });
      setToken(out.token);
      status.textContent = "Berhasil login.";
      setTimeout(()=> setRoute("admin"), 300);
    }catch(err){
      status.textContent = err?.message || "Gagal login.";
    }
  }, { once:true });
}

$("#btn-logout")?.addEventListener("click", ()=>{
  clearToken();
  setRoute("admin");
});

// Populate admin panels
async function populateAdminData(){
  await Promise.all([
    loadAdminAnnouncements(),
    loadAdminPrayers(),
    setupAdminScheduleForm(),
    loadAdminShop(),
    loadAdminFeedback()
  ]).catch(()=>{ /* ignore */ });
}

// Announcements
async function loadAdminAnnouncements(){
  const ul = $("#admin-announcement-list");
  ul.innerHTML = `<li class="item">Memuat...</li>`;
  try{
    const ann = await api("/announcements");
    ul.innerHTML = "";
    ann.forEach(a=>{
      const li = document.createElement("li");
      li.className="item";
      li.innerHTML = `
        <div>
          <div>${a.text}</div>
          <div class="meta">${relativeTime(a.createdAt)}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn danger small-btn" data-id="${a.id}">Hapus</button>
        </div>
      `;
      li.querySelector("button").onclick = async ()=>{
        try{
          await api(`/announcements/${a.id}`, { method:"DELETE", auth:true });
          await loadAdminAnnouncements();
          renderHome();
        }catch{}
      };
      ul.appendChild(li);
    });
  }catch{
    ul.innerHTML = `<li class="item">Gagal memuat pengumuman.</li>`;
  }

  $("#form-announcement").onsubmit = async (e)=>{
    e.preventDefault();
    const val = $("#input-announcement").value.trim();
    if(!val) return;
    try{
      await api("/announcements", { method:"POST", body:{ text: val }, auth:true });
      $("#input-announcement").value="";
      await loadAdminAnnouncements();
      renderHome();
    }catch{}
  };
}

// Prayers
async function loadAdminPrayers(){
  try{
    const prayers = await api("/prayers");
    $$(".prayer-input").forEach(inp=> inp.value = prayers[inp.dataset.day] || "");
  }catch{}
  $("#form-prayers").onsubmit = async (e)=>{
    e.preventDefault();
    const payload = {};
    $$(".prayer-input").forEach(inp=> payload[inp.dataset.day] = inp.value.trim());
    try{
      await api("/prayers", { method:"PUT", body: payload, auth:true });
      renderHome();
    }catch{}
  };
}

// Schedule add
async function setupAdminScheduleForm(){
  $("#btn-add-schedule").onclick = async ()=>{
    const day = $("#sched-day").value;
    const course = $("#sched-course").value.trim();
    const time = $("#sched-time").value.trim();
    const room = $("#sched-room").value.trim();
    const lecturer = $("#sched-lecturer").value.trim();
    if(!course || !time) return;
    try{
      await api("/schedule", { method:"POST", body:{ day, course, time, room, lecturer }, auth:true });
      $("#sched-course").value = $("#sched-time").value = $("#sched-room").value = $("#sched-lecturer").value = "";
      // Refresh caches and UI
      scheduleCache.delete(day);
      if(currentScheduleDay === day) updateScheduleList();
      renderHome();
    }catch{}
  };
}

// Shop
async function loadAdminShop(){
  const list = $("#admin-shop-list");
  list.innerHTML = `<li class="item">Memuat...</li>`;
  try{
    const items = await api("/shop");
    list.innerHTML = "";
    items.forEach(p=>{
      const li = document.createElement("li");
      li.className="item";
      li.innerHTML = `
        <div>
          <div style="font-weight:700">${p.name}</div>
          <div class="meta">${fmtRp(p.price)}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn danger small-btn" data-id="${p.id}">Hapus</button>
        </div>
      `;
      li.querySelector("button").onclick = async ()=>{
        try{
          await api(`/shop/${p.id}`, { method:"DELETE", auth:true });
          await loadAdminShop();
          renderShop();
        }catch{}
      };
      list.appendChild(li);
    });
  }catch{
    list.innerHTML = `<li class="item">Gagal memuat produk.</li>`;
  }

  $("#btn-add-shop").onclick = async ()=>{
    const name = $("#shop-name").value.trim();
    const price = parseInt($("#shop-price").value, 10);
    const image = $("#shop-image").value.trim();
    const desc = $("#shop-desc").value.trim();
    if(!name || isNaN(price)) return;
    try{
      await api("/shop", { method:"POST", auth:true, body:{ name, price, image, desc } });
      $("#shop-name").value = $("#shop-price").value = $("#shop-image").value = $("#shop-desc").value = "";
      await loadAdminShop();
      renderShop();
    }catch{}
  };
}

// Feedback (admin only)
async function loadAdminFeedback(){
  const ul = $("#admin-feedback-list");
  ul.innerHTML = `<li class="item">Memuat...</li>`;
  try{
    const fb = await api("/feedback", { auth:true });
    ul.innerHTML = "";
    if(fb.length === 0){
      ul.innerHTML = `<li class="item">Belum ada feedback.</li>`;
      return;
    }
    fb.forEach(x=>{
      const li = document.createElement("li");
      li.className="item";
      li.innerHTML = `
        <div>${x.message}<div class="meta">${relativeTime(x.createdAt)}</div></div>
        <button class="btn danger small-btn">Hapus</button>
      `;
      li.querySelector("button").onclick = async ()=>{
        try{
          await api(`/feedback/${x.id}`, { method:"DELETE", auth:true });
          await loadAdminFeedback();
        }catch{}
      };
      ul.appendChild(li);
    });
  }catch(e){
    ul.innerHTML = `<li class="item">Gagal memuat feedback. ${e?.message || ""}</li>`;
  }
}

// Footer year
$("#year").textContent = new Date().getFullYear();

// Default route
setRoute("home");

// Preserve route with hash (optional)
window.addEventListener("hashchange", ()=>{
  const r = location.hash.replace("#","");
  if(routes.includes(r)) setRoute(r);
});