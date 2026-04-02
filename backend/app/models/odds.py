from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class Odds(Base):
    __tablename__ = "odds"

    id = Column(Integer, primary_key=True, index=True)

    fixture_id = Column(Integer, index=True)
    league_id = Column(Integer)

    bookmaker = Column(String)
    market = Column(String)   # 1X2, OU25, BTTS
    outcome = Column(String)  # home, draw, away

    odd = Column(Float)