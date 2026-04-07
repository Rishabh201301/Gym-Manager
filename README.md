# 🏋️ Gym Management System

A lightweight, web-based gym management solution built with **HTML**, **CSS**, and **JavaScript**, backed by **Google Sheets API** as a real-time database. Designed to replace manual registers and WhatsApp-based tracking with a clean, fast, and mobile-friendly interface.

> **Live Users:** 30+ active members tracked since deployment

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Google Sheets Setup](#google-sheets-setup)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [How It Works](#how-it-works)
- [Limitations & Future Scope](#limitations--future-scope)
- [Author](#author)

---

## Overview

Most small gyms in India rely on paper registers or WhatsApp messages to track member attendance, fees, and subscriptions. This project solves that problem with a simple web app that:

- Tracks member **attendance** with one click
- Manages **membership status** and expiry dates
- Shows **fee payment history**
- Works on **mobile** (owner can use it on their phone)
- Stores everything in **Google Sheets** — no separate backend needed

Built specifically for a local gym, this project has been running live with **30+ real members** since deployment.

---

## Features

### 👥 Member Management
- Add new members with name, phone number, plan type, and start date
- View all members in a searchable table
- Edit or delete member records

### ✅ Attendance Tracking
- Mark daily attendance with a single tap
- View attendance history per member
- Monthly attendance summary

### 💰 Fee & Subscription Management
- Track monthly fee payment status (Paid / Unpaid / Pending)
- Set membership plan duration (1 month / 3 months / 6 months / annual)
- Automatic expiry date calculation
- Visual alerts for expiring or expired memberships

### 📊 Dashboard
- Total active members count
- Today's attendance count
- Pending fee alerts
- Memberships expiring this week

### 📱 Mobile-First Design
- Fully responsive layout
- Works on Android and iOS browsers
- Fast load times — no heavy frameworks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Database | Google Sheets (via Google Apps Script) |
| API | Google Sheets REST API / Apps Script Web App |
| Hosting | GitHub Pages / Local server |
| Version Control | Git & GitHub |

---

## System Architecture

```
User (Browser)
      │
      ▼
HTML/CSS/JS Frontend
      │
      │  fetch() API calls
      ▼
Google Apps Script (Web App URL)
      │
      │  SpreadsheetApp API
      ▼
Google Sheets (Database)
  ├── Members Sheet
  ├── Attendance Sheet
  └── Payments Sheet
```

**Why Google Sheets as a database?**
- Zero cost
- No backend server needed
- Gym owner can directly view/edit data in Sheets if needed
- Real-time sync across devices
- Familiar interface for non-technical users

---

## Getting Started

### Prerequisites

- A Google account
- A web browser
- Basic knowledge of Google Apps Script (for initial setup)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/gym-management-system.git
cd gym-management-system
```

**2. Set up Google Sheets** (see [Google Sheets Setup](#google-sheets-setup) below)

**3. Add your Web App URL**

Open `config.js` and replace the placeholder with your deployed Apps Script URL:
```javascript
const CONFIG = {
  SHEET_API_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
  GYM_NAME: "Your Gym Name",
  CURRENCY: "₹"
};
```

**4. Open the app**
```bash
# Simply open index.html in a browser, or
# Deploy to GitHub Pages for remote access
```

---

## Google Sheets Setup

### Step 1: Create the Spreadsheet

Create a new Google Sheet with 3 tabs:

**Members Sheet** (columns):
```
ID | Name | Phone | Plan | Start Date | Expiry Date | Status
```

**Attendance Sheet** (columns):
```
Date | Member ID | Member Name | Status
```

**Payments Sheet** (columns):
```
Month | Member ID | Member Name | Amount | Status | Date Paid
```

### Step 2: Deploy Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Paste the contents of `apps-script/Code.gs` from this repo
3. Click **Deploy → New Deployment**
4. Choose **Web App**, set access to **Anyone**
5. Copy the deployment URL and add it to `config.js`

### Step 3: Test the Connection

Open the browser console and run:
```javascript
testConnection(); // Should return { status: "ok", sheets: [...] }
```

---

## Project Structure

```
gym-management-system/
│
├── index.html              # Main app entry point
├── config.js               # API URL and app config
│
├── css/
│   ├── style.css           # Main stylesheet
│   ├── dashboard.css       # Dashboard-specific styles
│   └── mobile.css          # Mobile responsive overrides
│
├── js/
│   ├── app.js              # App initialization
│   ├── members.js          # Member CRUD operations
│   ├── attendance.js       # Attendance marking logic
│   ├── payments.js         # Fee tracking logic
│   ├── dashboard.js        # Dashboard stats & alerts
│   └── utils.js            # Helper functions (date, format, etc.)
│
├── apps-script/
│   └── Code.gs             # Google Apps Script backend
│
├── assets/
│   └── icons/              # SVG icons
│
└── README.md
```

---

## How It Works

### Adding a Member
1. Click "Add Member" → Fill form (Name, Phone, Plan)
2. JS sends a `POST` request to Apps Script Web App URL
3. Apps Script writes a new row to the Members sheet
4. UI updates the members table in real-time

### Marking Attendance
1. Search for a member or select from list
2. Click "Mark Present"
3. Apps Script logs `{ date, memberId, status: "present" }` to Attendance sheet
4. Dashboard counter updates

### Fee Tracking
1. Each month, all members show as "Unpaid" by default
2. When gym owner marks a member as paid, a record is written to Payments sheet
3. Members with overdue payments show a red badge

---

## Limitations & Future Scope

### Current Limitations
- No user authentication (single-owner use case)
- Google Sheets has a limit of ~10M cells (not a concern for small gyms)
- Apps Script has daily quota limits (~20,000 URL fetch calls/day)
- No offline support — requires internet connection

### Planned Features
- [ ] WhatsApp reminders for fee due dates (via WhatsApp Business API)
- [ ] Member self-check-in via QR code
- [ ] Monthly report PDF generation
- [ ] Multi-gym / multi-branch support
- [ ] Progressive Web App (PWA) for offline access
- [ ] SMS alerts via Fast2SMS

---

## Author

**Rishabh**
B.Tech Computer Science, ABES Engineering College (Batch 2024–28)
Greater Noida, India

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---

> **Note:** This project was built for a real local gym and has been actively used by 30+ members. It started as a solution to a real problem — replacing a WhatsApp group and paper register with something more reliable.
