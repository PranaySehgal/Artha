# ARTHA 💰

### AI-Powered Personal Finance & Expense Intelligence Platform

**ARTHA** is an AI-powered financial assistant designed to simplify personal expense management by transforming receipts and transaction data into structured, searchable, and actionable financial insights.

Built as a solution for **Smart India Hackathon (SIH)**, ARTHA combines OCR, AI-powered data extraction, PostgreSQL, analytics, and a modern web interface to create an intelligent expense-management system.

---

## 🚀 Key Features

* 🧾 **Receipt Intelligence**

  * Upload receipt images
  * OCR-based text extraction
  * AI-powered conversion of unstructured receipt data into structured information

* 💳 **Expense Management**

  * Store and manage expenses
  * Duplicate receipt detection
  * Maintain complete transaction history
  * Persistent PostgreSQL database storage

* 📊 **Spending Analytics**

  * Analyze spending patterns
  * Category-wise spending breakdown
  * Generate meaningful financial statistics

* 🔐 **Secure Authentication**

  * User signup and login
  * Argon2 password hashing
  * User-specific financial data

* ⚡ **REST API**

  * FastAPI-based backend
  * Modular API architecture
  * Easily consumable by web and other clients

---

## 🧠 How ARTHA Works

```text
                 ┌──────────────────┐
                 │   Receipt Image  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Image Processing │
                 │ & Preprocessing  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │       OCR        │
                 │ Text Extraction  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   AI / LLM       │
                 │ Data Extraction  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Structured JSON  │
                 │ Expense Data     │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   PostgreSQL     │
                 │    Database      │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │ Analytics & AI   │
                 │ Financial Query  │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌──────────────────┐
                 │   ARTHA Web UI   │
                 └──────────────────┘
```

---

## 🛠️ Tech Stack

### Backend

* **Python**
* **FastAPI**
* **Uvicorn**
* **PostgreSQL**
* **Neon PostgreSQL**
* **Argon2**
* **Tesseract OCR**
* **Open-CV**
* **Numpy**


### AI

* Large Language Models for receipt-to-JSON extraction

### Frontend

* Modern web frontend
* REST API integration
* Responsive user interface

### Development

* Git & GitHub
* Python package architecture
* RESTful API design

---


---

## 🔑 API Overview

ARTHA exposes its functionality through a REST API built with FastAPI.

Example endpoints include:

```text
POST   /receipts/upload
POST   /createAccount

POST   /signInAccount
POST   /receipts/createEntry

POST    /info
```

The API is designed so that the frontend can communicate with the backend independently of the underlying implementation.

---

## 🗄️ Database

ARTHA uses **PostgreSQL** for persistent storage.

The database stores structured information such as:

* User accounts
* Receipt information
* Transactions
* Expense categories
* Dates and amounts
* Financial history

PostgreSQL is hosted using **Neon** for cloud-based database access.

---

## 🔐 Security

Security is an important part of ARTHA's architecture.

* Passwords are securely hashed using **Argon2**
* User data is logically separated
* Sensitive configuration is stored using environment variables
* Database credentials are never hard-coded
* Authentication is handled through the backend

> Never commit `.env` files or database credentials to the repository.

---

## ⚙️ Installation

### 1. Download Using Pip

```bash
git clone https://github.com/PranaySehgal/ARTHA.git
cd ARTHA

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

python -m pip install --upgrade pip
pip install -e .
```


### 2. Configure environment variables

Create a `.env` file:

```env
DATABASE_URL=your_postgresql_connection_string
```

Add any other environment variables required by your deployment.

### 4. Start the backend

```bash
arth api
```

The API will then be available locally.

---

## 📡 API Documentation

Once the FastAPI server is running, interactive API documentation is available through:

```text
/docs
```

and the alternative OpenAPI interface:

```text
/redoc
```

---

## 🎯 SIH Problem-Solving Approach

ARTHA focuses on reducing the friction involved in maintaining personal financial records.

Traditional expense tracking often requires users to manually enter:

* Merchant names
* Dates
* Amounts
* Items
* Categories
* Transaction details

ARTHA automates much of this workflow.

### Traditional Workflow

```text
Receipt
   ↓
Manual Data Entry
   ↓
Spreadsheet / App
   ↓
Manual Analysis
```

### ARTHA Workflow

```text
Receipt
   ↓
OCR
   ↓
AI Extraction
   ↓
Structured Data
   ↓
Automatic Storage
   ↓
Analytics & Insights
```

This allows users to spend less time recording expenses and more time understanding them.

---

## 🔮 Future Scope

Planned improvements include:

* 📈 Advanced spending forecasting
* 🧠 Improved anomaly detection
* 💬 More powerful natural-language financial queries
* 📊 Interactive financial dashboards
* 📱 Mobile application
* ☁️ Production deployment
* 🔔 Personalized spending alerts
* 📑 Advanced receipt intelligence

---

## 🌟 Why ARTHA?

ARTHA is not just an expense tracker.

It aims to act as an **intelligent financial layer** between raw transaction data and meaningful financial decisions.

```text
Raw Financial Data
        ↓
     ARTHA
        ↓
Understanding
        ↓
   Insights
        ↓
Better Decisions
```

---

## 👨‍💻 Built For

**Smart India Hackathon (SIH)**

ARTHA is developed as a technology-driven solution focused on applying **AI, OCR, backend engineering, databases, and analytics** to real-world financial management.

---

## 📜 License

This project is currently developed for educational and hackathon purposes.

**Licensed Under MIT License**
**Copyright @ Pranay Sehgal**

---

## ⭐ Support

If you find ARTHA interesting, consider giving the repository a ⭐ on GitHub!
