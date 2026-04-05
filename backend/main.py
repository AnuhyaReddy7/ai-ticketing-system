from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from collections import Counter
from scheduler import scheduler, escalate_tickets

from pydantic import BaseModel

from database import engine, SessionLocal
from models import Base, Ticket, TicketHistory, Employee

# =========================
# APP INIT
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# =========================
# ALLOWED TRANSITIONS
# =========================
ALLOWED_TRANSITIONS = {
    "New":           ["Assigned"],
    "Assigned":      ["In Progress", "Pending Info"],
    "In Progress":   ["Pending Info", "Resolved"],
    "Pending Info":  ["In Progress", "Resolved"],
    "Resolved":      ["Closed"],
    "Closed":        [],
}

# =========================
# DB SESSION
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# REQUEST MODELS
# =========================
class TicketCreate(BaseModel):
    description: str

class FeedbackModel(BaseModel):
    helpful: bool

# =========================
# SEED EMPLOYEES ON STARTUP
# =========================
SEED_EMPLOYEES = [
    {
        "name": "Alice",
        "email": "alice@company.com",
        "department": "Engineering",
        "role": "Backend Engineer",
        "skills": "Server,DB,Access",
        "avg_resolution_time": "3 hours",
        "load": 2,
        "availability": "Available",
    },
    {
        "name": "Bob",
        "email": "bob@company.com",
        "department": "Finance",
        "role": "Finance Analyst",
        "skills": "Billing,Finance",
        "avg_resolution_time": "1 day",
        "load": 1,
        "availability": "Available",
    },
    {
        "name": "Charlie",
        "email": "charlie@company.com",
        "department": "IT",
        "role": "IT Support",
        "skills": "HR,Support",
        "avg_resolution_time": "30 mins",
        "load": 3,
        "availability": "Busy",
    },
]

def seed_employees():
    db = SessionLocal()
    try:
        if db.query(Employee).count() == 0:
            for e in SEED_EMPLOYEES:
                db.add(Employee(**e))
            db.commit()
            print("✅ Employees seeded")
    finally:
        db.close()

seed_employees()

# =========================
# HELPERS
# =========================
def emp_to_dict(e: Employee):

    # 🔥 AUTO CALCULATE STATUS FROM LOAD
    if e.load is None:
        load = 0
    else:
        load = e.load

    if load <= 1:
        availability = "Available"
    elif load <= 3:
        availability = "Busy"
    else:
        availability = "Overloaded"

    return {
        "id": e.id,
        "name": e.name,
        "email": e.email,
        "department": e.department,
        "role": e.role,
        "skills": [s.strip() for s in e.skills.split(",")] if e.skills else [],
        "avg_resolution_time": e.avg_resolution_time or "N/A",
        "load": load,
        "availability": availability   # ✅ NOW DYNAMIC
    }

def assign_employee(category: str, db: Session):
    best = None

    for emp in db.query(Employee).all():
        skills = [s.strip().lower() for s in emp.skills.split(",")] if emp.skills else []

        # ✅ FIX: case-insensitive match
        if category.lower() not in skills:
            continue

        if emp.availability == "Busy":
            continue

        if best is None or emp.load < best.load:
            best = emp

    return best

def send_notification(ticket_id: int, message: str):
    print(f"\n📧 Ticket #{ticket_id}: {message}\n")

# =========================
# AI ENGINE
# =========================
def analyze_ticket(description: str):
    desc = description.lower()

    result = {
        "category":                 "Other",
        "summary":                  "General issue detected.",
        "severity":                 "Medium",
        "department":               "Support",
        "resolution_path":          "Assign",
        "sentiment":                "Neutral",
        "confidence":               0.75,
        "estimated_resolution_time":"1 day",
        "suggested_employee":       None,
        "auto_response":            ""
    }

    if any(w in desc for w in ["angry", "frustrated", "not working", "urgent"]):
        result["sentiment"] = "Frustrated"
    elif any(w in desc for w in ["thanks", "good", "okay"]):
        result["sentiment"] = "Polite"

    if "password" in desc or "login" in desc:
        result.update({
            "category": "Access", "department": "IT",
            "severity": "High", "confidence": 0.95,
            "estimated_resolution_time": "5 min"
        })
        if "reset" in desc:
            result.update({
                "resolution_path": "Auto-resolve",
                "auto_response": "Use 'Forgot Password' to reset your account.",
                "confidence": 0.98
            })

    elif "billing" in desc or "payment" in desc:
        result.update({
            "category": "Billing", "department": "Finance",
            "confidence": 0.90, "estimated_resolution_time": "2 hrs"
        })
        if "invoice" in desc:
            result.update({
                "resolution_path": "Auto-resolve",
                "auto_response": "Download invoices from your billing dashboard.",
                "confidence": 0.93
            })

    elif "leave" in desc or "hr policy" in desc:
        result.update({
            "category": "HR", "department": "HR",
            "resolution_path": "Auto-resolve", "confidence": 0.96,
            "estimated_resolution_time": "2 min",
            "auto_response": "Apply for leave in the HR portal."
        })

    elif any(w in desc for w in ["server", "crash", "down", "outage"]):
        result.update({
            "category": "Server", "department": "Engineering",
            "severity": "Critical", "confidence": 0.97,
            "estimated_resolution_time": "1 hr"
        })

    elif any(w in desc for w in ["database", "db", "query", "sql"]):
        result.update({
            "category": "DB", "department": "Engineering",
            "severity": "Critical", "confidence": 0.95,
            "estimated_resolution_time": "2 hrs"
        })

    result["summary"] = f"{result['category']} issue detected with {result['sentiment']} sentiment."
    return result

# =========================
# AUTO RESOLUTION
# =========================
def handle_auto_resolution(ticket, ai, db):
    if ai["resolution_path"] != "Auto-resolve":
        return None

    ticket.status     = "Resolved"
    ticket.assignee   = "AI System"
    ticket.updated_at = datetime.utcnow()
    db.add(ticket)
    db.add(TicketHistory(
        ticket_id=ticket.id, action="AUTO_RESOLVED",
        new_value=ai["auto_response"], performed_by="AI"
    ))
    db.commit()
    return ai["auto_response"]

# =========================
# ROUTES
# =========================

# ── CREATE TICKET ────────────────────────────────
@app.post("/ticket")
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    ai  = analyze_ticket(payload.description)
    emp = assign_employee(ai["category"], db)
    now = datetime.utcnow()

    ticket = Ticket(
        description = payload.description,
        category    = ai["category"],
        severity    = ai["severity"],
        department  = ai["department"],
        status      = "Resolved" if ai["resolution_path"] == "Auto-resolve" else "New",
        assignee    = emp.name if emp else "Unassigned",
        created_at  = now,
        updated_at  = now,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    if emp:
        emp.load += 1
        db.commit()

    auto_response = handle_auto_resolution(ticket, ai, db)

    db.add(TicketHistory(
        ticket_id=ticket.id, action="AI_ANALYSIS",
        new_value=ai["summary"], performed_by="AI"
    ))
    db.commit()
    send_notification(ticket.id, "Ticket created")

    return {
        "ticket_id":                 ticket.id,
        "category":                  ai["category"],
        "severity":                  ai["severity"],
        "department":                ai["department"],
        "status":                    ticket.status,
        "assignee":                  ticket.assignee,
        "resolution_path":           ai["resolution_path"],
        "sentiment":                 ai["sentiment"],
        "confidence":                ai["confidence"],
        "estimated_resolution_time": ai["estimated_resolution_time"],
        "auto_response":             auto_response,
    }

# ── GET ALL TICKETS ──────────────────────────────
@app.get("/tickets")
def get_tickets(db: Session = Depends(get_db)):
    return [
        {
            "id":          t.id,
            "description": t.description,
            "category":    t.category,
            "severity":    t.severity,
            "department":  t.department,
            "assignee":    t.assignee,
            "status":      t.status,
            "created_at":  str(t.created_at),
            "updated_at":  str(t.updated_at),
        }
        for t in db.query(Ticket).all()
    ]

# ── GET SINGLE TICKET ────────────────────────────
@app.get("/ticket/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    t = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {
        "id": t.id, "description": t.description, "category": t.category,
        "severity": t.severity, "department": t.department, "assignee": t.assignee,
        "status": t.status, "created_at": str(t.created_at),
    }

# ── UPDATE STATUS ────────────────────────────────
@app.put("/ticket/{ticket_id}/status")
def update_status(ticket_id: int, status: str, user: str = "agent", db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    allowed = ALLOWED_TRANSITIONS.get(ticket.status, [])
    if status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot move from '{ticket.status}' to '{status}'. Allowed: {allowed}"
        )

    old_status        = ticket.status
    ticket.status     = status
    ticket.updated_at = datetime.utcnow()

    db.add(TicketHistory(
        ticket_id    = ticket_id,
        action       = "STATUS_CHANGE",
        old_value    = old_status,
        new_value    = status,
        performed_by = user,
    ))
    db.commit()
    send_notification(ticket_id, f"Status changed to {status}")

    return {"message": "Status updated", "new_status": status}

# ── ADD NOTE ─────────────────────────────────────
@app.post("/ticket/{ticket_id}/notes")
def add_note(ticket_id: int, note: str, user: str = "agent", db: Session = Depends(get_db)):
    if not db.query(Ticket).filter(Ticket.id == ticket_id).first():
        raise HTTPException(status_code=404, detail="Ticket not found")

    db.add(TicketHistory(
        ticket_id=ticket_id, action="NOTE_ADDED",
        new_value=note, performed_by=user
    ))
    db.commit()
    return {"message": "Note added"}

# ── GET HISTORY ──────────────────────────────────
@app.get("/ticket/{ticket_id}/history")
def get_history(ticket_id: int, db: Session = Depends(get_db)):
    if not db.query(Ticket).filter(Ticket.id == ticket_id).first():
        raise HTTPException(status_code=404, detail="Ticket not found")

    return [
        {
            "id":           h.id,
            "action":       h.action,
            "old_value":    h.old_value,
            "new_value":    h.new_value,
            "performed_by": h.performed_by,
            "timestamp":    str(h.timestamp),
        }
        for h in db.query(TicketHistory).filter(TicketHistory.ticket_id == ticket_id).all()
    ]

# ── FEEDBACK ─────────────────────────────────────
feedback_store = []

@app.post("/ticket/{ticket_id}/feedback")
def ticket_feedback(ticket_id: int, payload: FeedbackModel, db: Session = Depends(get_db)):
    if not db.query(Ticket).filter(Ticket.id == ticket_id).first():
        raise HTTPException(status_code=404, detail="Ticket not found")
    feedback_store.append({"ticket_id": ticket_id, "helpful": payload.helpful})
    return {"message": "Feedback recorded"}

# ── ANALYTICS ────────────────────────────────────
@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).all()
    total   = len(tickets)

    dept_counter = Counter(t.department for t in tickets if t.department)

    # ✅ FIXED LOGIC HERE
    auto_resolved = len([
        t for t in tickets
        if t.assignee == "AI System"
    ])

    success_rate = round((auto_resolved / total) * 100, 2) if total > 0 else 0

    return {
        "total_tickets": total,
        "status": {
            "resolved": len([t for t in tickets if t.status in ["Resolved", "Closed"]]),
            "open":     len([t for t in tickets if t.status in ["New", "Assigned", "In Progress"]]),
            "pending":  len([t for t in tickets if t.status == "Pending Info"]),
        },
        "auto_resolution_success_rate": success_rate,  # ✅ now correct
        "department_load": [
            {"department": d, "tickets": c} for d, c in dept_counter.most_common()
        ],
    }

# ── EMPLOYEES ─────────────────────────────────────
@app.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    return [emp_to_dict(e) for e in employees]

@app.on_event("startup")
def start_scheduler():
    print("SCHEDULER STARTED 🚀")

    scheduler.add_job(
        escalate_tickets,
        "interval",
        minutes=10,
        id="escalation_job",
        replace_existing=True
    )

    scheduler.start()