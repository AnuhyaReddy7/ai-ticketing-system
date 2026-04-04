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

**Overview**
AI Ticketing Intelligence is a full-stack internal support platform built for teams that need fast, intelligent ticket handling. Every incoming ticket is first processed by an LLM — it is categorised, summarised, given a severity score and sentiment label, and either auto-resolved with a professional response or routed to the most appropriate employee based on skill match, current load, and availability.
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

**Architecture**

┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│  Sidebar │ Dashboard │ Tickets │ Employees           │
└──────────────────────┬──────────────────────────────┘
                       │ REST API (JSON)
┌──────────────────────▼──────────────────────────────┐
│                  FastAPI Backend                     │
│                                                      │
│  /tickets   /employees   /analytics   /ai            │
│                                                      │
│  ┌─────────────────────┐  ┌──────────────────────┐  │
│  │   Routing Engine    │  │  Auto-resolve Engine  │  │
│  │  (Dept + Assignee)  │  │  (LLM response gen)  │  │
│  └────────┬────────────┘  └──────────┬───────────┘  │
│           │                          │               │
│  ┌────────▼──────────────────────────▼───────────┐  │
│  │            Claude API (Anthropic)              │  │
│  │    Structured JSON output via system prompt    │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │            SQLite (SQLAlchemy ORM)              │ │
│  │  tickets │ employees │ notes │ timeline │ feedback│ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

## ⚙️ Setup Instructions

### 📋 Prerequisites

Ensure the following are installed:

- Node.js (v16 or higher)
- Python (v3.9 or higher)
- pip (Python package manager)
- Git
- 
### 🔧 1. Clone the Repository

**```bash**
**git clone https://github.com/your-username/ai-ticketing-system.git**
**cd ai-ticketing-system**

### 2. Backend SetUp(FastAPI)
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Mac/Linux)
# source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic

#**Run the server**
uvicorn main:app --reload

**Open in browser**
Swagger UI (API testing):
http://127.0.0.1:8000/docs
Base API:
http://127.0.0.1:8000

**API Endpoints**
  **Tickets**
POST /ticket → Create ticket
GET /tickets → Get all tickets
  **Analytics**
GET /analytics → Dashboard stats
  **Employees**
GET /employees → Employee list
  **Feedback**
POST /ticket/{id}/feedback → Submit feedback
