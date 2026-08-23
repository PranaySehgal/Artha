/* ============================================================
   DASHBOARD
   ============================================================ */

let allTransactions = [];
let categoryChart = null;

const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
function money(n) { return fmt.format(Number(n) || 0); }
function prettyDate(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

document.addEventListener("DOMContentLoaded", async () => {
  // --- auth guard ---
  if (!Api.isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const user = Api.getUser();
  const nameEl = document.getElementById("dash-user-name");
  if (nameEl) nameEl.textContent = user && user.name ? user.name.split(" ")[0] : "there";

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Api.clearSession();
      window.location.href = "index.html";
    });
  }

  await loadTransactions();
  wireUpload();
  wireModal();
});

async function loadTransactions() {
  const listEl = document.getElementById("tx-list");
  listEl.innerHTML = `<div style="padding:40px 0;text-align:center;"><span class="loader"><span></span><span></span><span></span><span></span></span></div>`;
  try {
    allTransactions = await Api.getTransactions();
    allTransactions.sort((a, b) => new Date(b[CONFIG.FIELDS.date]) - new Date(a[CONFIG.FIELDS.date]));
    renderStats(allTransactions);
    renderChart(allTransactions);
    renderHistory(allTransactions);
  } catch (err) {
    listEl.innerHTML = `<div class="tx-empty"><div class="e-icon">⚠️</div><p>${escapeHtml(err.message || "Couldn't load your transactions.")}</p></div>`;
    showToast(err.message || "Couldn't load transactions", true);
  }
}

/* ---------- Stats ---------- */
function renderStats(txs) {
  const F = CONFIG.FIELDS;
  const total = txs.reduce((sum, t) => sum + Number(t[F.amount] || 0), 0);
  const count = txs.length;
  const avg = count ? total / count : 0;

  const byCat = {};
  txs.forEach((t) => {
    const c = t[F.category] || "Other";
    byCat[c] = (byCat[c] || 0) + Number(t[F.amount] || 0);
  });
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];

  setText("stat-total", money(total));
  setText("stat-count", count);
  setText("stat-avg", money(avg));
  setText("stat-top-cat", topCat ? topCat[0] : "—");
  setText("stat-top-cat-amt", topCat ? money(topCat[1]) + " spent" : "No data yet");
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ---------- Pie chart ---------- */
function renderChart(txs) {
  const F = CONFIG.FIELDS;
  const canvasWrap = document.getElementById("chart-wrap");
  const legendEl = document.getElementById("chart-legend");

  if (!txs.length) {
    canvasWrap.innerHTML = `<div class="chart-empty">No expenses yet — upload a receipt to see your breakdown here.</div>`;
    legendEl.innerHTML = "";
    return;
  }

  const byCat = {};
  txs.forEach((t) => {
    const c = t[F.category] || "Other";
    byCat[c] = (byCat[c] || 0) + Number(t[F.amount] || 0);
  });
  const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const labels = entries.map(([c]) => c);
  const data = entries.map(([, v]) => v);
  const colors = labels.map((c) => CONFIG.CATEGORY_COLORS[c] || "#9A9186");

  if (!document.getElementById("category-canvas")) {
    canvasWrap.innerHTML = `<canvas id="category-canvas"></canvas>`;
  }
  const ctx = document.getElementById("category-canvas").getContext("2d");

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: "#FAF6EC",
        borderWidth: 2,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      animation: { animateRotate: true, duration: 900, easing: "easeOutQuart" },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1B2E28",
          titleFont: { family: "Space Mono" },
          bodyFont: { family: "Space Mono" },
          padding: 10,
          callbacks: {
            label: (item) => ` ${item.label}: ${money(item.raw)}`,
          },
        },
      },
    },
  });

  legendEl.innerHTML = entries.map(([cat, amt]) => {
    const pct = total ? Math.round((amt / total) * 100) : 0;
    const color = CONFIG.CATEGORY_COLORS[cat] || "#9A9186";
    return `<div class="legend-row">
      <span class="swatch" style="background:${color}"></span>
      <span class="l-name">${escapeHtml(cat)}</span>
      <span class="l-amt">${money(amt)}</span>
      <span class="l-pct">${pct}%</span>
    </div>`;
  }).join("");
}

/* ---------- Transaction history ---------- */
function renderHistory(txs) {
  const F = CONFIG.FIELDS;
  const listEl = document.getElementById("tx-list");

  if (!txs.length) {
    listEl.innerHTML = `<div class="tx-empty"><div class="e-icon">🧾</div><p>No transactions yet. Upload your first receipt to get started.</p></div>`;
    return;
  }

  listEl.innerHTML = txs.map((t, i) => {
    const cat = t[F.category] || "Other";
    const icon = CONFIG.CATEGORY_ICON[cat] || "🧾";
    const color = CONFIG.CATEGORY_COLORS[cat] || "#9A9186";
    return `<div class="tx-row" style="animation-delay:${Math.min(i * 40, 400)}ms">
      <div class="tx-icon" style="background:${color}22">${icon}</div>
      <div>
        <div class="tx-merchant">${escapeHtml(t[F.merchant] || "Unknown merchant")}</div>
        <div class="tx-meta">${prettyDate(t[F.date])}${t[F.gstNumber] && t[F.gstNumber] !== "—" ? " · GST " + escapeHtml(t[F.gstNumber]) : ""}</div>
      </div>
      <div class="tx-cat"><span class="chip"><span class="swatch" style="background:${color}"></span>${escapeHtml(cat)}</span></div>
      <div class="tx-amt">${money(t[F.amount])}</div>
    </div>`;
  }).join("");
}

/* ---------- Upload flow ---------- */
function wireUpload() {
  const zone = document.getElementById("upload-zone");
  const input = document.getElementById("receipt-input");
  if (!zone || !input) return;

  zone.addEventListener("click", () => input.click());
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("drag"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag");
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  input.addEventListener("change", () => {
    if (input.files.length) handleFile(input.files[0]);
    input.value = "";
  });
}

let currentParsed = null;
let currentPreviewUrl = null;

async function handleFile(file) {
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    showToast("Please upload an image or PDF of your receipt.", true);
    return;
  }
  openModal();
  showScanState();

  if (file.type.startsWith("image/")) {
    currentPreviewUrl = URL.createObjectURL(file);
  } else {
    currentPreviewUrl = null;
  }

  try {
    const parsed = await Api.parseReceipt(file);
    currentParsed = parsed;
    showVerifyState(parsed);
  } catch (err) {
    closeModal();
    showToast(err.message || "Couldn't read that receipt. Try another photo.", true);
  }
}

function showScanState() {
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <div class="scan-state">
      <div class="scan-anim">
        <div class="scan-frame"></div>
        <div class="scan-line"></div>
      </div>
      <h3>Reading your receipt…</h3>
      <p>Pulling out the merchant, amount, GST number and category.</p>
    </div>`;
}

function showVerifyState(parsed) {
  const F = CONFIG.FIELDS;
  const body = document.getElementById("modal-body");
  const categories = Object.keys(CONFIG.CATEGORY_COLORS);

  body.innerHTML = `
    ${currentPreviewUrl ? `<img src="${currentPreviewUrl}" class="receipt-preview" alt="Uploaded receipt preview">` : ""}
    <div class="verify-field">
      <label>Merchant <span class="ocr-tag">✓ detected</span></label>
      <input type="text" id="v-merchant" value="${escapeAttr(parsed[F.merchant] || "")}">
    </div>
    <div class="verify-row-2">
      <div class="verify-field">
        <label>Date <span class="ocr-tag">✓ detected</span></label>
        <input type="date" id="v-date" value="${escapeAttr(parsed[F.date] || "")}">
      </div>
      <div class="verify-field">
        <label>Amount (₹) <span class="ocr-tag">✓ detected</span></label>
        <input type="number" step="0.01" id="v-amount" value="${escapeAttr(parsed[F.amount] || "")}">
      </div>
    </div>
    <div class="verify-field">
      <label>Category</label>
      <select id="v-category">
        ${categories.map((c) => `<option value="${c}" ${c === parsed[F.category] ? "selected" : ""}>${c}</option>`).join("")}
      </select>
    </div>
    <div class="verify-field">
      <label>GST Number <span class="ocr-tag">✓ detected</span></label>
      <input type="text" id="v-gst" value="${escapeAttr(parsed[F.gstNumber] || "")}">
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="verify-cancel" type="button">Cancel</button>
      <button class="btn btn-primary btn-block" id="verify-submit" type="button">Confirm &amp; submit</button>
    </div>`;

  document.getElementById("verify-cancel").addEventListener("click", closeModal);
  document.getElementById("verify-submit").addEventListener("click", submitVerified);
}

async function submitVerified() {
  const F = CONFIG.FIELDS;
  const btn = document.getElementById("verify-submit");
  const payload = {
    [F.merchant]: document.getElementById("v-merchant").value.trim(),
    [F.date]: document.getElementById("v-date").value,
    [F.amount]: parseFloat(document.getElementById("v-amount").value) || 0,
    [F.category]: document.getElementById("v-category").value,
    [F.gstNumber]: document.getElementById("v-gst").value.trim(),
    verified: true,
  };

  if (!payload[F.merchant] || !payload[F.amount]) {
    showToast("Merchant and amount are required.", true);
    return;
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="loader"><span></span><span></span><span></span><span></span></span> Submitting…`;

  try {
    await Api.submitReceipt(payload);
    showSuccessState();
    await loadTransactions();
    setTimeout(closeModal, 1400);
  } catch (err) {
    showToast(err.message || "Couldn't submit this expense. Try again.", true);
    btn.disabled = false;
    btn.textContent = "Confirm & submit";
  }
}

function showSuccessState() {
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <div class="scan-state">
      <div class="success-check">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6" stroke="#FAF6EC" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <h3>Added to your ledger</h3>
      <p>Your transaction history and chart have been updated.</p>
    </div>`;
}

/* ---------- Modal open/close ---------- */
function wireModal() {
  const overlay = document.getElementById("modal-overlay");
  const closeBtn = document.getElementById("modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay) {
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}
function openModal() { document.getElementById("modal-overlay").classList.add("show"); }
function closeModal() {
  document.getElementById("modal-overlay").classList.remove("show");
  if (currentPreviewUrl) { URL.revokeObjectURL(currentPreviewUrl); currentPreviewUrl = null; }
  currentParsed = null;
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(msg, isError = false) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle("error", isError);
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ---------- utils ---------- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) { return escapeHtml(str); }
