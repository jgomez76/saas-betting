from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime

from app.core.database import Base


class ValueBet(Base):
    __tablename__ = "value_bets"

    id = Column(Integer, primary_key=True, index=True)

    fixture_id = Column(Integer, unique=True, index=True)

    league = Column(String)
    league_id = Column(Integer)

    home_team = Column(String)
    away_team = Column(String)

    date = Column(DateTime)

    markets = Column(JSON)
    value = Column(JSON)
    probabilities = Column(JSON)
    extra_probabilities = Column(JSON)
    market_values = Column(JSON)

    updated_at = Column(DateTime, default=datetime.utcnow)