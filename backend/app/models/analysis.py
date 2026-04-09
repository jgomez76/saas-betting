from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base
from datetime import datetime

class Analysis(Base):
    __tablename__ = "analysis"

    id = Column(Integer, primary_key=True)

    fixture_id = Column(Integer)
    league = Column(String)
    home_team = Column(String)
    away_team = Column(String)

    market = Column(String)      # 1X2 / OU25 / BTTS
    selection = Column(String)   # home / over / yes

    odd = Column(Float)
    value = Column(Float)

    date = Column(DateTime)

    status = Column(String, default="pending")  # pending / won / lost
    result = Column(String, nullable=True)      # 2-1

    created_at = Column(DateTime, default=datetime.utcnow)