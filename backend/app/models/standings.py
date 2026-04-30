from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Standings(Base):
    __tablename__ = "standings"

    id = Column(Integer, primary_key=True)
    league_id = Column(Integer)
    team = Column(String)

    position = Column(Integer)
    points = Column(Integer)