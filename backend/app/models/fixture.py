from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base

class Fixture(Base):
    __tablename__ = "fixtures"

    id = Column(Integer, primary_key=True, index=True)
    api_id = Column(Integer, unique=True, index=True)

    league_id = Column(Integer)
    league = Column(String)

    home_team = Column(String)
    away_team = Column(String)

    home_team_id = Column(Integer)
    away_team_id = Column(Integer)
    
    home_goals = Column(Integer)
    away_goals = Column(Integer)

    status = Column(String)  # FT, NS, etc
    
    date = Column(DateTime)
    season = Column(Integer)

    round = Column(String)