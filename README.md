**AI-Ticketing-System**
The Advanced AI Ticketing System is a smart internal support platform that uses AI to automatically analyze incoming tickets, decide whether they can be resolved instantly, or route them to the most appropriate department and employee.This system improves efficiency by reducing manual triaging, enabling faster resolutions, and providing intelligent insights through analytics.

🧭 **Table of Contents**
- [📖 Overview](#-overview)
- [🛠 Tech Stack](#-tech-stack)
- [✨ Features](#-features)
- [🏗 Architecture](#-architecture)
- [⚙️ Setup Instructions](#-setup-instructions)
- [🔐 Environment Variables](#-environment-variables)
- [🔗 API Reference](#-api-reference)
- [🧠 AI & Prompt Design](#-ai--prompt-design)
- [📦 Module Breakdown](#-module-breakdown)
- [⚠️ Known Limitations](#-known-limitations)
- [🔮 Future Improvements](#-future-improvements)


## Overview

**AI Ticketing Intelligence** is a full-stack internal support platform built for teams that need fast, intelligent ticket handling. Every incoming ticket is first processed by an LLM — it is categorised, summarised, given a severity score and sentiment label, and either auto-resolved with a professional response or routed to the most appropriate employee based on skill match, current load, and availability.

The system covers the complete ticket lifecycle from intake to closure, includes a real-time analytics dashboard, and features a live employee directory with admin controls.

## 🛠 Tech Stack

| Layer        | Technology |
|-------------|-----------|
| **Frontend** | React.js, Material UI, Chart.js |
| **Backend**  | Python, FastAPI |
| **Database** | SQLite (via SQLAlchemy ORM) |
| **AI / LLM** | Open AI|
| **Auth**     | JWT-based session tokens |
| **Styling**  | Custom CSS with Syne, DM Sans, DM Mono fonts |

## Architecture

| Ticket Type | Department | Priority Bump |
  |-------------|-----------|--------------|
  | Database / data corruption | Engineering | Critical |
  | Server down / performance | Engineering / DevOps | Critical |
  | Payroll / reimbursement | Finance | No |
  | Leave / HR policy | HR | No |
  | Access / account lock | IT | High |
  | Product bug / feature request | Product / Engineering | Severity-dependent |
  | Marketing / branding | Marketing | No |
  | Legal / compliance | Legal | High |

## ⚙️ Setup Instructions

### 📋 Prerequisites

Ensure the following are installed:

- Node.js (v16 or higher)
- Python (v3.9 or higher)
- pip (Python package manager)
- Git
- 
### 1. Clone the repository
```bash
git clone https://github.com/your-username/ai-ticketing-intelligence.git
cd ai-ticketing-intelligence
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
### Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic

Copy the example env file and add your API key:
```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY
```

Start the API server:
```bash
uvicorn main:app --reload 
```

Open in browser
Swagger UI (API testing):
http://127.0.0.1:8000/docs
Base API:
http://127.0.0.1:8000

### Install Frontend Dependencies

Run the following commands inside the `frontend/` folder:

```bash
npm install

# React Chart.js
npm install chart.js react-chartjs-2

# Material UI
npm install @mui/material @emotion/react @emotion/styled

# Optional icons
npm install @mui/icons-material
The app will be available at `http://localhost:3000
```


---

### Example `.env` File

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=sqlite:///./tickets.db
JWT_SECRET=your_secret_key
REACT_APP_BASE_URL= url.
ESCALATION_HOURS=2
```

### API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/tickets` | Submit a new ticket (triggers AI analysis) |
| `GET` | `/tickets` | List all tickets with filters |
| `GET` | `/tickets/{id}` | Get ticket detail with timeline |
| `PATCH` | `/tickets/{id}/status` | Update ticket status |
| `POST` | `/tickets/{id}/notes` | Add internal note |
| `POST` | `/tickets/{id}/request-info` | Request more info from user |
| `POST` | `/tickets/{id}/feedback` | Submit Yes/No auto-resolution feedback |
| `GET` | `/employees` | List all employees |
| `PATCH` | `/employees/{id}` | Update employee details |
| `GET` | `/analytics` | Full analytics payload for dashboard |

<img width="1913" height="939" alt="image" src="https://github.com/user-attachments/assets/38ca1023-0ee0-4aed-895d-0d3268880d9c" />
<img width="1907" height="880" alt="image" src="https://github.com/user-attachments/assets/2cf19753-3677-4d17-9001-020c3fe4d520" />
<img width="1918" height="879" alt="image" src="https://github.com/user-attachments/assets/12dab33c-9772-4f36-9175-529b0671e42b" />
<img width="1915" height="856" alt="image" src="https://github.com/user-attachments/assets/cf922502-103a-4362-96ac-2944792efdd6" />
<img width="1901" height="867" alt="image" src="https://github.com/user-attachments/assets/578069e0-f237-4fb8-b6cb-35b5c8f9fa11" />
<img width="1919" height="852" alt="image" src="https://github.com/user-attachments/assets/ef9b2253-d2a7-4578-b70b-64d5b59b39c4" />
<img width="1814" height="849" alt="image" src="https://github.com/user-attachments/assets/16135f5d-6bcf-44da-84ee-bef25f51c84e" />
<img width="1868" height="864" alt="image" src="https://github.com/user-attachments/assets/717cede8-ef2b-430d-8169-df6d27224f7b" />



## Known Limitations

- **Email notifications are simulated** — the system logs notification events to the timeline but does not send real emails. Integrating SendGrid or AWS SES would make this production-ready.
- **Single-tenant only** — there is no multi-org support. All employees and tickets share one workspace.
- **Escalation runs on a polling loop** — the background job checks for stale tickets every 5 minutes rather than using a proper task queue (e.g. Celery + Redis). Under load this could drift.
- **AI confidence is self-reported** — Claude's confidence score is part of its own output, not externally validated. Borderline tickets (confidence < 70) should ideally be held for human review rather than routed immediately.

---
