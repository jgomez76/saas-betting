from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)
    is_admin = Column(Boolean, default=False)

    subscription = Column(String, default="free")
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)

    # Para mas tarde
    # subscription_status = Column(String, default="inactive")
    # subscription_end = Column(DateTime, nullable=True)
    # stripe_customer_id = Column(String, nullable=True)