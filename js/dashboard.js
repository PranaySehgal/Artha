const BASE_URL = "http://127.0.0.1:8000";
const USER_ID = sessionStorage.getItem("user_id");

let transactions = [];

document.addEventListener("DOMContentLoaded", () => {
    if (!USER_ID) {
        window.location.href = "login.html";
        return;
    }

    loadTransactions();
    setupUpload();
    setupModal();

    const name = sessionStorage.getItem("name");
    if (name) {
        document.getElementById("dash-user-name").textContent =
            name.split(" ")[0];
    }

    document.getElementById("logout-btn").onclick = () => {
        sessionStorage.clear();
        window.location.href = "index.html";
    };
});


/* =========================
   TRANSACTIONS
========================= */

async function loadTransactions() {
    try {
        const response = await fetch(
            `${BASE_URL}/info?user_id=${USER_ID}`,
            { method: "POST" }
        );

        if (!response.ok)
            throw new Error("Could not load transactions.");

        const text = await response.text();

        console.log("INFO RESPONSE:", text);

        transactions = parseTransactions(text);

        renderStats();
        renderChart();
        renderTable();

    } catch (error) {
        console.error(error);

        document.getElementById("tx-list").innerHTML = `
            <div class="tx-empty">
                <div class="e-icon">⚠️</div>
                <p>${error.message}</p>
            </div>
        `;
    }
}


/* =========================
   PARSE BACKEND RESPONSE
========================= */

function parseTransactions(text) {

    const rows = [];

    // Find every tuple returned by the backend.
    const tupleRegex = /\(([^()]*)\)/g;

    let tupleMatch;

    while ((tupleMatch = tupleRegex.exec(text)) !== null) {

        const tuple = tupleMatch[1];

        // First four fields are safe to split using the "', '" pattern.
        const parts = tuple.match(
            /^'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(None|'[^']*'),\s*'(.*)'$/
        );

        if (!parts)
            continue;

        rows.push({
            user_id: parts[1],
            amount: Number(parts[2]),
            category: parts[3],

            date: parts[4] === "None"
                ? null
                : parts[4].slice(1, -1),

            merchant: parts[5]
        });
    }

    return rows;
}

/* =========================
   STATS
========================= */

function renderStats() {

    const total = transactions.reduce(
        (sum, t) => sum + t.amount,
        0
    );

    const count = transactions.length;

    const average = count
        ? total / count
        : 0;

    const categories = {};

    transactions.forEach(t => {
        categories[t.category] =
            (categories[t.category] || 0) + t.amount;
    });

    const top = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])[0];

    document.getElementById("stat-total").textContent =
        money(total);

    document.getElementById("stat-count").textContent =
        count;

    document.getElementById("stat-avg").textContent =
        money(average);

    document.getElementById("stat-top-cat").textContent =
        top ? top[0] : "—";

    document.getElementById("stat-top-cat-amt").textContent =
        top ? `${money(top[1])} spent` : "No data yet";
}


/* =========================
   PIE CHART
========================= */

function renderChart() {

    const categories = {};

    transactions.forEach(t => {
        categories[t.category] =
            (categories[t.category] || 0) + t.amount;
    });

    const entries = Object.entries(categories);

    if (!entries.length)
        return;

    const total = entries.reduce(
        (sum, [, amount]) => sum + amount,
        0
    );

    /*
       Generate a different color for every category.
       HSL lets us spread colors evenly around the color wheel.
    */

    const colors = entries.map((_, index) => {

        const hue =
            (index * 360 / entries.length) % 360;

        return `hsl(${hue}, 65%, 55%)`;
    });


    let current = 0;

    const gradient = entries.map(
        ([, amount], index) => {

            const start = current;

            current +=
                (amount / total) * 100;

            return `
                ${colors[index]}
                ${start}%
                ${current}%
            `;
        }
    ).join(", ");


    const chartWrap =
        document.getElementById("chart-wrap");


    chartWrap.innerHTML = `

        <div
            style="
                width:220px;
                height:220px;
                border-radius:50%;
                background:conic-gradient(${gradient});
                margin:auto;
                position:relative;
            "
        >

            <div
                style="
                    position:absolute;
                    width:125px;
                    height:125px;
                    background:#FAF6EC;
                    border-radius:50%;
                    top:50%;
                    left:50%;
                    transform:translate(-50%,-50%);
                "
            ></div>

        </div>
    `;


    /*
       Legend
    */

    document.getElementById("chart-legend").innerHTML =
        entries.map(([category, amount], index) => {

            const percent =
                Math.round(
                    (amount / total) * 100
                );

            return `

                <div class="legend-row">

                    <span
                        class="swatch"
                        style="
                            background:${colors[index]}
                        "
                    ></span>

                    <span class="l-name">
                        ${escapeHtml(category)}
                    </span>

                    <span class="l-amt">
                        ${money(amount)}
                    </span>

                    <span class="l-pct">
                        ${percent}%
                    </span>

                </div>

            `;

        }).join("");
}


/* =========================
   TABLE
========================= */

function renderTable() {

    const container =
        document.getElementById("tx-list");

    if (!transactions.length) {
        container.innerHTML = `
            <div class="tx-empty">
                <div class="e-icon">🧾</div>
                <p>No transactions yet.</p>
            </div>
        `;
        return;
    }


    transactions.sort((a, b) => {

        if (!a.date) return 1;
        if (!b.date) return -1;

        return new Date(b.date) - new Date(a.date);
    });


    container.innerHTML = `
        <div style="overflow-x:auto">

            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                "
            >

                <thead>
                    <tr>

                        <th style="text-align:left;padding:12px">
                            Date
                        </th>

                        <th style="text-align:left;padding:12px">
                            Merchant
                        </th>

                        <th style="text-align:left;padding:12px">
                            Category
                        </th>

                        <th style="text-align:right;padding:12px">
                            Amount
                        </th>

                    </tr>
                </thead>

                <tbody>

                    ${transactions.map(t => `
                        <tr>

                            <td style="padding:12px">
                                ${t.date
            ? formatDate(t.date)
            : "—"}
                            </td>

                            <td style="padding:12px">
                                ${escapeHtml(
                t.merchant || "Unknown"
            )}
                            </td>

                            <td style="padding:12px">
                                ${escapeHtml(
                t.category || "Other"
            )}
                            </td>

                            <td
                                style="
                                    padding:12px;
                                    text-align:right;
                                "
                            >
                                ${money(t.amount)}
                            </td>

                        </tr>
                    `).join("")}

                </tbody>

            </table>

        </div>
    `;
}


/* =========================
   RECEIPT UPLOAD
========================= */

function setupUpload() {

    const zone =
        document.getElementById("upload-zone");

    const input =
        document.getElementById("receipt-input");


    zone.onclick = () => input.click();


    zone.ondragover = e => {
        e.preventDefault();
        zone.classList.add("drag");
    };


    zone.ondragleave = () =>
        zone.classList.remove("drag");


    zone.ondrop = e => {

        e.preventDefault();

        zone.classList.remove("drag");

        const file =
            e.dataTransfer.files[0];

        if (file)
            uploadReceipt(file);
    };


    input.onchange = () => {

        const file = input.files[0];

        if (file)
            uploadReceipt(file);

        input.value = "";
    };
}


async function uploadReceipt(file) {

    if (!file.type.startsWith("image/")) {
        showToast(
            "Please upload a receipt image.",
            true
        );
        return;
    }

    openModal();

    document.getElementById("modal-body").innerHTML = `
        <div class="scan-state">

            <div class="scan-anim">
                <div class="scan-frame"></div>
                <div class="scan-line"></div>
            </div>

            <h3>Reading your receipt…</h3>

            <p>
                Extracting receipt information.
            </p>

        </div>
    `;


    const formData = new FormData();

    formData.append("file", file);


    try {

        const response = await fetch(
            `${BASE_URL}/receipts/upload`,
            {
                method: "POST",
                body: formData
            }
        );


        if (!response.ok)
            throw new Error(
                "Could not process receipt."
            );


        const data =
            await response.json();

        console.log("OCR DATA:", data);

        showEditForm(data);

    } catch (error) {

        closeModal();

        showToast(
            error.message,
            true
        );
    }
}


/* =========================
   EDIT OCR RESULT
========================= */

function showEditForm(data) {

    document.getElementById("modal-body").innerHTML = `

        <div class="verify-field">

            <label>Merchant</label>

            <input
                type="text"
                id="v-merchant"
                value="${escapeAttr(data.merchant || "")}"
            >

        </div>


        <div class="verify-row-2">

            <div class="verify-field">

                <label>Date</label>

                <input
                    type="date"
                    id="v-date"
                    value="${escapeAttr(data.date || "")}"
                >

            </div>


            <div class="verify-field">

                <label>Amount (₹)</label>

                <input
                    type="number"
                    step="0.01"
                    id="v-amount"
                    value="${data.total}"
                >

            </div>

        </div>


<div class="verify-field">
    <label>Category</label>

    <input
        type="text"
        id="v-category"
        list="category-options"
        value="${escapeAttr(data.category || "")}"
        placeholder="e.g. Food, Travel, Shopping"
    >

    <datalist id="category-options">
        <option value="Food">
        <option value="Travel">
        <option value="Shopping">
        <option value="Utility">
        <option value="Entertainment">
        <option value="Healthcare">
        <option value="Education">
        <option value="Other">
    </datalist>
</div>
    <div class="verify-field">
    <label>Number of people</label>

    <input
        type="number"
        id="v-people"
        min="1"
        step="1"
        value="1"
        placeholder="1"
    >

    <small>
        Enter the number of people sharing this expense.
    </small>
</div>
        </div>


        <div class="modal-actions">

            <button
                class="btn btn-ghost"
                id="verify-cancel"
            >
                Cancel
            </button>

            <button
                class="btn btn-primary btn-block"
                id="verify-submit"
            >
                Confirm & submit
            </button>

        </div>
    `;


    document.getElementById(
        "verify-cancel"
    ).onclick = closeModal;


    document.getElementById(
        "verify-submit"
    ).onclick = submitReceipt;
}


/* =========================
   SUBMIT RECEIPT
========================= */

async function submitReceipt() {

    const merchant =
        document.getElementById("v-merchant").value.trim();

    let amount =
        Number(document.getElementById("v-amount").value);

    const category =
        document.getElementById("v-category").value.trim();

    const date =
        document.getElementById("v-date").value;

    const people =
        Number(document.getElementById("v-people").value);


    if (!merchant || !amount || !category || !date) {
        showToast("Please fill all fields.", true);
        return;
    }

    if (!people || people < 1) {
        showToast("Number of people must be at least 1.", true);
        return;
    }


    amount = amount / people;


    const data = {
        merchant: merchant,
        total: Number(amount.toFixed(2)),
        category: category,
        date: date
    };


    try {

        const response = await fetch(
            `${BASE_URL}/receipts/createEntry?user_id=${USER_ID}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        let res = await response.json()
        console.log()
        if (!response || !response.ok || res.Response == "Error!") throw new Error("Could not save receipt.");

        document.getElementById("modal-body").innerHTML = `
            <div class="scan-state">

                <div class="success-check">
                    ✓
                </div>

                <h3>Added to your Arth</h3>

                <p>
                    Your share of ₹${amount.toFixed(2)}
                    was recorded.
                </p>

            </div>
        `;


        setTimeout(() => {
            closeModal();
            loadTransactions();
        }, 1000);


    } catch (error) {

        showToast(error.message, true);
    }
}


/* =========================
   MODAL
========================= */

function setupModal() {

    document.getElementById(
        "modal-close"
    ).onclick = closeModal;


    document.getElementById(
        "modal-overlay"
    ).onclick = e => {

        if (
            e.target.id ===
            "modal-overlay"
        ) {
            closeModal();
        }
    };
}


function openModal() {

    document.getElementById(
        "modal-overlay"
    ).classList.add("show");
}


function closeModal() {

    document.getElementById(
        "modal-overlay"
    ).classList.remove("show");
}


/* =========================
   HELPERS
========================= */

function money(value) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(value || 0);
}


function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function escapeHtml(value) {

    return String(value).replace(
        /[&<>"']/g,
        c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[c])
    );
}


function escapeAttr(value) {
    return escapeHtml(value);
}


function showToast(message, error = false) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.toggle(
        "error",
        error
    );

    toast.classList.add("show");

    setTimeout(
        () => toast.classList.remove("show"),
        3000
    );
}
