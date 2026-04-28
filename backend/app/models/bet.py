from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User

class Bet(Base):
    __tablename__ = "bets"

    id = Column(Integer, primary_key=True, index=True)

    # 🔐 RELACIÓN USER
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 🧾 INFO BET
    match = Column(String, nullable=False)
    market = Column(String, nullable=False)
    selection = Column(String, nullable=False)

    odd = Column(Float, nullable=True)
    value = Column(Float, nullable=True)

    stake = Column(Float, nullable=True)
    stake_level = Column(Integer, nullable=True)

    # 📊 RESULTADO
    status = Column(String, default="pending")  # pending | won | lost
    result = Column(String, nullable=True)

    # 🔗 MATCH LINK
    fixture_id = Column(Integer, nullable=True)

    # 📅 FECHA PARTIDO
    date = Column(DateTime, nullable=True)

    # ⏱️ CREACIÓN
    created_at = Column(DateTime, default=datetime.utcnow)

    # BOOKMAKER
    bookmaker = Column(String, nullable=True)

    # 🔁 RELACIÓN
    user = relationship("User", back_populates="bets")