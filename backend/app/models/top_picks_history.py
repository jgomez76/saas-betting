from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Boolean
from app.core.database import Base
from datetime import datetime

class TopPickHistory(Base):
    __tablename__ = "top_picks_history"

    id = Column(Integer, primary_key=True)

    date = Column(Date)
    fixture_id = Column(Integer)

    market = Column(String)
    selection = Column(String)

    odd = Column(Float)
    probability = Column(Float)
    value = Column(Float)

    result = Column(String, nullable=True)  # win / loss

    created_at = Column(DateTime, default=datetime.utcnow)