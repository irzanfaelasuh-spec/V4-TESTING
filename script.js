/* ===== CONFIG ===== */
const GROUP_URL = "https://chat.whatsapp.com/Fbk0gIDWokm39O0m1JB28a?s=cl&p=a&mlu=4&iam=2";

/* ===== ELEMENTS ===== */
const form = document.getElementById("attendanceForm");
const nameInput = document.getElementById("name");
const statusButtons = document.querySelectorAll(".status");
const picked = document.getElementById("picked");
const pickedEmoji = document.getElementById("pickedEmoji");
const pickedText = document.getElementById("pickedText");
const submitBtn = document.getElementById("submitBtn");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("closeModal");
const messagePreview = document.getElementById("messagePreview");
const copyBtn = document.getElementById("copyBtn");
const openWhatsapp = document.getElementById("openWhatsapp");
const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
const toastIcon = document.getElementById("toastIcon");
const confettiBox = document.getElementById("confetti");
const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const musicIcon = document.getElementById("musicIcon");
const musicLabel = document.getElementById("musicLabel");

let selectedStatus = "";
let generatedMessage = "";
let musicPlaying = false;

/* =========================================================
   SFX — disintesis langsung via Web Audio API.
   Tidak butuh file suara eksternal, jadi selalu ringan & pasti kebaca.
========================================================= */
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function tone({ freq = 440, duration = 0.12, type = "sine", gain = 0.18, glide = null, delay = 0 } = {}) {
  try {
    ensureAudio();
    const t0 = audioCtx.currentTime + delay;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t0 + duration);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.03);
  } catch (e) { /* browser tanpa Web Audio: diamkan saja */ }
}

const sfx = {
  tap: () => tone({ freq: 520, duration: 0.06, type: "square", gain: 0.07 }),

  select: (status) => {
    const notes = { Hadir: 880, Izin: 700, Sakit: 500, Alpha: 340 };
    const f = notes[status] || 600;
    tone({ freq: f, duration: 0.13, type: "triangle", gain: 0.18 });
    tone({ freq: f * 1.5, duration: 0.1, type: "sine", gain: 0.1, delay: 0.05 });
  },

  error: () => {
    tone({ freq: 190, duration: 0.16, type: "sawtooth", gain: 0.13 });
    tone({ freq: 150, duration: 0.2, type: "sawtooth", gain: 0.1, delay: 0.06 });
  },

  success: () => {
    [523.25, 659.25, 784, 1046.5].forEach((f, i) =>
      tone({ freq: f, duration: 0.2, type: "sine", gain: 0.16, delay: i * 0.08 })
    );
  },

  close: () => tone({ freq: 420, duration: 0.14, type: "sine", gain: 0.09, glide: 120 }),
};

/* ===== STATUS SELECT ===== */
statusButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    statusButtons.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    selectedStatus = btn.dataset.status;
    pickedEmoji.textContent = btn.dataset.emoji;
    pickedText.textContent = selectedStatus;

    sfx.select(selectedStatus);

    picked.style.transform = "scale(.97)";
    setTimeout(() => (picked.style.transform = "scale(1)"), 120);
  });
});

/* ===== DATE / TIME ===== */
const getDate = () => new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const getTime = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const statusEmoji = { Hadir: "😎", Izin: "🙋", Sakit: "🤒", Alpha: "😴" };

function createMessage(name, status) {
  return `*ABSENSI KELAS KITA*

👤 Nama: ${name}
📌 Status: ${statusEmoji[status] || "📌"} ${status}
📅 Tanggal: ${getDate()}
⏰ Waktu: ${getTime()}

_Dikirim lewat Kelas Kita_`;
}

/* ===== COPY ===== */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* lanjut ke fallback */ }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (e) {
    return false;
  }
}

/* ===== TOAST ===== */
function showToast(text, icon = "✅") {
  toastText.textContent = text;
  toastIcon.textContent = icon;
  toast.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ===== CONFETTI ===== */
function launchConfetti() {
  confettiBox.innerHTML = "";
  const emojis = ["🎉", "✨", "⭐", "💚", "💛", "🎊"];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + "%";
    p.style.fontSize = 10 + Math.random() * 14 + "px";
    p.style.setProperty("--dur", 2 + Math.random() * 2 + "s");
    p.style.setProperty("--drift", (Math.random() - 0.5) * 250 + "px");
    confettiBox.appendChild(p);
  }
  setTimeout(() => (confettiBox.innerHTML = ""), 4500);
}

/* ===== RESET ===== */
function resetForm() {
  nameInput.value = "";
  selectedStatus = "";
  statusButtons.forEach((b) => b.classList.remove("selected"));
  pickedEmoji.textContent = "👀";
  pickedText.textContent = "Belum memilih";
}

/* ===== SUBMIT ===== */
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();

  if (!name) {
    sfx.error();
    showToast("Nama kamu belum diisi!", "👤");
    nameInput.classList.add("shake");
    setTimeout(() => nameInput.classList.remove("shake"), 400);
    nameInput.focus();
    return;
  }

  if (!selectedStatus) {
    sfx.error();
    showToast("Pilih status dulu ya!", "📌");
    return;
  }

  generatedMessage = createMessage(name, selectedStatus);

  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses…";

  const copied = await copyText(generatedMessage);

  localStorage.setItem("lastAttendance", JSON.stringify({ name, status: selectedStatus, date: getDate(), time: getTime() }));

  await new Promise((r) => setTimeout(r, 500));

  messagePreview.textContent = generatedMessage;
  modal.classList.add("show");
  launchConfetti();
  sfx.success();

  showToast(copied ? "Pesan sudah disalin!" : "Tekan Salin untuk menyalin pesan.", copied ? "✅" : "📋");

  resetForm();

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Kirim Absen";
  }, 500);
});

/* ===== COPY AGAIN ===== */
copyBtn.addEventListener("click", async () => {
  sfx.tap();
  const copied = await copyText(generatedMessage);
  if (copied) {
    copyBtn.textContent = "Sudah disalin!";
    showToast("Pesan berhasil disalin!", "📋");
    setTimeout(() => (copyBtn.textContent = "Salin lagi"), 1500);
  } else {
    sfx.error();
    showToast("Gagal menyalin, coba lagi.", "⚠️");
  }
});

/* ===== OPEN WHATSAPP ===== */
openWhatsapp.addEventListener("click", () => {
  sfx.tap();
  window.open(GROUP_URL, "_blank");
  showToast("Grup WhatsApp dibuka", "💬");
});

/* ===== MODAL CLOSE ===== */
function closeModal() {
  sfx.close();
  modal.classList.remove("show");
}
closeModalBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

/* ===== MUSIC ===== */
music.volume = 0.4;

async function startMusic() {
  try {
    await music.play();
    musicPlaying = true;
    musicIcon.textContent = "🔊";
    musicLabel.textContent = "Musik";
    musicBtn.setAttribute("aria-pressed", "true");
  } catch (e) {
    showToast("Tap tombol musik untuk memulai", "🎵");
  }
}

function stopMusic() {
  music.pause();
  musicPlaying = false;
  musicIcon.textContent = "🔈";
  musicBtn.setAttribute("aria-pressed", "false");
}

musicBtn.addEventListener("click", () => {
  sfx.tap();
  musicPlaying ? stopMusic() : startMusic();
});

music.addEventListener("error", () => showToast("Musik tidak bisa dimuat", "⚠️"));
