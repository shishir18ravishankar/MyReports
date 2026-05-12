# MyReports 🏥
### Your health history, always in your pocket.

> Built at BuildWithAI — InnovateX 4.0 Hackathon 2026 (24 hours)

🔗 **Live Demo:** https://my-reports-chi.vercel.app

---

## The Problem

In India, patients carry physical reports in folders — X-rays, blood tests, prescriptions — that get lost, forgotten at home, or damaged. Doctors have no way to send records digitally to patients directly.

Existing platforms like ABHA and Google Health exist, but failed at adoption. The reason: they never solved the actual friction point — the **doctor-to-patient report handoff**.

## The Solution

MyReports creates a secure two-way channel between doctors and patients:
- Doctor uploads a report → patient receives it instantly in their inbox
- Patient accepts or discards each report
- AI explains what the report actually means, in plain English
- Emergency card shows critical info without unlocking the phone

---

## How It Works

**For Patients**
1. Sign up with email + Aadhaar verification → get a unique Patient ID (MR-XXXXXX)
2. Receive reports from doctors in your Inbox
3. Accept reports → they move to My Records
4. Tap any report → AI explains it in plain language
5. Emergency Card: one tap access to your critical health info

**For Doctors**
1. Sign up with email + Aadhaar + MCI number → get a Doctor ID (DR-XXXXXX)
2. Enter a patient's ID and upload their report
3. Patient receives it instantly

---

## Features

- 🏥 Patient & doctor registration with unique IDs
- 📱 QR code generated for every patient
- 👨‍⚕️ Doctor uploads reports directly to patient in under 30 seconds
- 📬 Patient inbox — accept or discard incoming reports
- 📁 My Records — organised storage of all accepted reports
- 🤖 AI explains every report in plain English (Groq + LLaMA 3.3 70B)
- 🆘 Emergency card accessible without unlocking phone
- 🗑️ Bin with restore functionality for discarded reports
- 📊 Dashboard stat counters for both patient and doctor

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + React Router DOM |
| Database | Supabase (PostgreSQL) |
| File Storage | Supabase Storage |
| AI | Groq API — LLaMA 3.3 70B |
| QR Codes | qrcode.react |
| Deployment | Vercel |

---

## Run Locally

```bash
git clone https://github.com/shishir18ravishankar/MyReports
cd MyReports
npm install
```

Create a `.env` file in the root:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GROQ_API_KEY=your_groq_api_key
```

```bash
npm run dev
```

> Note: You'll need a Supabase project with `patients`, `doctors`, and `reports` tables, and Storage enabled.

---

## Why Not ABHA or Google Health?

Those platforms exist. We researched them. The problem isn't awareness — it's adoption. They put the burden on patients to log in, upload, and organise their own records. MyReports flips the model: **the doctor does the upload**. The patient just receives.

---

*Solo integration + AI features. 24-hour build.*
