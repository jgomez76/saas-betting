from sqlalchemy import Column, Integer, String, UniqueConstraint
from app.core.database import Base


# class Injury(Base):
#     __tablename__ = "injuries"

#     id = Column(Integer, primary_key=True, index=True)
#     league_id = Column(Integer)
#     player = Column(String)
#     team = Column(String)
#     type = Column(String)  # injury / suspension
#     reason = Column(String)


class Injury(Base):
    __tablename__ = "injuries"

    id = Column(Integer, primary_key=True, index=True)

    player_id = Column(Integer, nullable=False)
    player = Column(String, nullable=False)

    team = Column(String, nullable=False)

    type = Column(String)
    reason = Column(String)

    league_id = Column(Integer, nullable=False)

    fixture_id = Column(Integer, nullable=False)