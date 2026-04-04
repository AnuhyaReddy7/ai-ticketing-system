from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# -------------------------
# TICKET TABLE
# -------------------------
class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    description = Column(Text, nullable=False)
    category = Column(String, default="Other")
    severity = Column(String, default="Low")
    department = Column(String, default="General")

    status = Column(String, default="New")
    assignee = Column(String, default="Unassigned")

    # ✅ Auto timestamps (NO MORE ERRORS)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    history = relationship("TicketHistory", back_populates="ticket", cascade="all, delete")
    notes = relationship("TicketNote", back_populates="ticket", cascade="all, delete")


# -------------------------
# TICKET HISTORY
# -------------------------
class TicketHistory(Base):
    __tablename__ = "ticket_history"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)

    action = Column(String)  # created, status_change, note, etc.
    old_value = Column(String, nullable=True)
    new_value = Column(String, nullable=True)

    performed_by = Column(String, default="system")

    # ✅ Auto timestamp
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    ticket = relationship("Ticket", back_populates="history")


# -------------------------
# TICKET NOTES
# -------------------------
class TicketNote(Base):
    __tablename__ = "ticket_notes"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)

    note = Column(Text, nullable=False)
    created_by = Column(String, default="agent")

    # ✅ Auto timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    ticket = relationship("Ticket", back_populates="notes")

# ✅ NEW — Employee table
class Employee(Base):
    __tablename__ = "employees"

    id                   = Column(Integer, primary_key=True, index=True)
    name                 = Column(String)
    email                = Column(String, unique=True)
    department           = Column(String)
    role                 = Column(String)
    skills               = Column(String)        # stored as comma-separated: "Server,DB"
    avg_resolution_time  = Column(String)
    load                 = Column(Integer, default=0)
    availability         = Column(String, default="Available")