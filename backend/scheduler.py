from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from database import SessionLocal
from models import Ticket

scheduler = BackgroundScheduler()

def escalate_tickets():
    db = SessionLocal()

    cutoff = datetime.utcnow() - timedelta(hours=2)

    tickets = db.query(Ticket).filter(
        Ticket.severity.in_(["High", "Critical"]),
        Ticket.status == "New",
        Ticket.created_at <= cutoff
    ).all()

    for t in tickets:
        t.status = "Assigned"
        t.assignee = "Escalation-Bot"

    db.commit()
    db.close()

scheduler.add_job(escalate_tickets, "interval", minutes=10)
scheduler.start()