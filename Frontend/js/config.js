/* ============================================================
   CONFIG — wire this up to your Python backend
   ============================================================
   Everything the app needs to talk to your API lives here.
   Edit BASE_URL and the endpoint paths/field names below to
   match your FastAPI/Flask routes exactly — nothing else in
   the app needs to change.

   MOCK_MODE: while true, the app runs entirely on local sample
   data (no network calls) so you can preview every screen
   before your backend is wired up. Set to false once your API
   is ready.
   ============================================================ */

const CONFIG = {
  MOCK_MODE: true,

  BASE_URL: "http://localhost:8000",

  ENDPOINTS: {
    signup: "/auth/signup",          // POST { name, email, password }              -> { token, user }
    login: "/auth/login",            // POST { email, password }                     -> { token, user }
    transactions: "/transactions",   // GET  (auth header)                           -> [ transaction, ... ]
    parseReceipt: "/receipts/parse", // POST multipart/form-data { file }            -> parsedReceipt
    submitReceipt: "/transactions",  // POST { ...parsedReceipt, verified: true }    -> transaction
  },

  // Key used to read the auth token from the login/signup response,
  // and the header used to send it on subsequent requests.
  AUTH: {
    tokenField: "token",
    headerName: "Authorization",
    headerPrefix: "Bearer ",
    storageKey: "ledger_token",
    userStorageKey: "ledger_user",
  },

  // Expected shape of a single transaction returned by GET /transactions
  // and of the object returned by POST /receipts/parse. Adjust the KEY
  // NAMES on the right to whatever your backend actually calls them —
  // the app reads through this map everywhere it touches receipt data.
  FIELDS: {
    id: "id",
    merchant: "merchant",
    date: "date",
    amount: "amount",
    category: "category",
    gstNumber: "gst_number",
  },

  // Category -> color, used consistently for chips, chart slices, icons.
  CATEGORY_COLORS: {
    "Food & Dining": "#C1440E",
    "Groceries": "#6B8F71",
    "Transport": "#C9A227",
    "Rent & Utilities": "#4A6670",
    "Books & Supplies": "#8B5FA6",
    "Entertainment": "#D46A9F",
    "Health": "#4E8B6E",
    "Other": "#9A9186",
  },

  CATEGORY_ICON: {
    "Food & Dining": "🍜",
    "Groceries": "🛒",
    "Transport": "🚌",
    "Rent & Utilities": "🏠",
    "Books & Supplies": "📚",
    "Entertainment": "🎬",
    "Health": "💊",
    "Other": "🧾",
  },
};

/* ---------- Sample data used only when MOCK_MODE is true ---------- */
const MOCK_TRANSACTIONS = [
  { id: "t1", merchant: "Campus Coffee Co.", date: "2026-08-20", amount: 180, category: "Food & Dining", gst_number: "07AACT2727Q1ZS" },
  { id: "t2", merchant: "BigBasket", date: "2026-08-19", amount: 940, category: "Groceries", gst_number: "27AAECB1234F1Z5" },
  { id: "t3", merchant: "Metro Card Recharge", date: "2026-08-18", amount: 300, category: "Transport", gst_number: "—" },
  { id: "t4", merchant: "Hostel Mess Fund", date: "2026-08-16", amount: 2200, category: "Rent & Utilities", gst_number: "—" },
  { id: "t5", merchant: "Crossword Bookstore", date: "2026-08-14", amount: 650, category: "Books & Supplies", gst_number: "29AAACC1206D1ZM" },
  { id: "t6", merchant: "PVR Cinemas", date: "2026-08-12", amount: 420, category: "Entertainment", gst_number: "06AABCP1234M1ZP" },
  { id: "t7", merchant: "Apollo Pharmacy", date: "2026-08-10", amount: 210, category: "Health", gst_number: "33AABCA1234K1Z6" },
  { id: "t8", merchant: "Domino's Pizza", date: "2026-08-08", amount: 560, category: "Food & Dining", gst_number: "07AACT2929P1ZR" },
  { id: "t9", merchant: "Auto Rickshaw", date: "2026-08-06", amount: 90, category: "Transport", gst_number: "—" },
  { id: "t10", merchant: "Reliance Fresh", date: "2026-08-03", amount: 480, category: "Groceries", gst_number: "27AAECR1234G1Z2" },
];

const MOCK_PARSED_RECEIPT = {
  merchant: "Sagar Ratna Restaurant",
  date: new Date().toISOString().slice(0, 10),
  amount: 340,
  category: "Food & Dining",
  gst_number: "07AABCS1429B1ZQ",
};
