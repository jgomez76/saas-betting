from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.bet import Bet

class User(Base):
    __tablename__ = "users"

    # 🔥 ID REAL
    id = Column(Integer, primary_key=True, index=True)

    # 👤 IDENTIDAD
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)

    # 🔐 AUTH CLÁSICA
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)

    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    # 🔥 CONTROL
    is_active = Column(Boolean, default=True)

    # 🔥 OAUTH
    provider = Column(String, default="email")
    name = Column(String, nullable=True)
    avatar = Column(String, nullable=True)

    # 🔥 NEGOCIO
    is_admin = Column(Boolean, default=False)
    subscription = Column(String, default="free")

    # ✅ RELACIÓN CON BETS
    bets = relationship("Bet", back_populates="user", cascade="all, delete")
    
    # Para mas tarde
    # subscription_status = Column(String, default="inactive")
    # subscription_end = Column(DateTime, nullable=True)
    # stripe_customer_id = Column(String, nullable=True)