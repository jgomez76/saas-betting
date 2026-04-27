from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Boolean
from app.core.database import Base
from datetime import datetime

class TopPick(Base):
    __tablename__ = "top_picks"

    id = Column(Integer, primary_key=True, index=True)

    date = Column(Date, index=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    fixture_id = Column(Integer)
    match = Column(String)

    market = Column(String)
    selection = Column(String)

    probability = Column(Float)
    odd = Column(Float)
    value = Column(Float)

    kickoff = Column(DateTime)

    is_free = Column(Boolean, default=False)