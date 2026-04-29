from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from app.core.database import Base

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    fixture_id = Column(Integer, nullable=False)
    match = Column(String, nullable=True)
    league = Column(String, nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "fixture_id", name="unique_favorite"),
    )