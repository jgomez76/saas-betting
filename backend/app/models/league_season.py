# app/models/league_season.py

from sqlalchemy import Column, Integer
from app.core.database import Base

class LeagueSeason(Base):
    __tablename__ = "league_seasons"

    league_id = Column(
        Integer,
        primary_key=True
    )

    season = Column(
        Integer,
        nullable=False
    )