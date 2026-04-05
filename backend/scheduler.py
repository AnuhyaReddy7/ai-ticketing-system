from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
from database import SessionLocal
from models import Ticket

scheduler = BackgroundScheduler()

def escalate_tickets():
    print("ESCALATION JOB TRIGGERED")

    db = SessionLocal()

    # 👇 ADD THESE LINES HERE
    print("TOTAL TICKETS:", db.query(Ticket).count())

    print("NEW HIGH TICKETS:",
          db.query(Ticket).filter(
              Ticket.severity.in_(["High", "Critical"]),
              Ticket.status == "New"
          ).count()
    )

    try:
        cutoff = datetime.utcnow() - timedelta(hours=2)

        tickets = db.query(Ticket).filter(
            Ticket.severity.in_(["High", "Critical"]),
            Ticket.status == "New",
            Ticket.created_at <= cutoff,
            Ticket.assignee != "Escalation-Bot"
        ).all()

        count = len(tickets)

        if count == 0:
            print("No tickets to escalate")
            return 0

        for t in tickets:
            t.status = "Escalated"
            t.assignee = "Escalation-Bot"

        db.commit()

        print(f"Escalated {count} tickets")
        return count

    finally:
        db.close()


scheduler.add_job(escalate_tickets, "interval", minutes=10)