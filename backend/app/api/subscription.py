from fastapi import APIRouter, Depends  
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.auth import get_current_user

from app.models.user import User

from app.services.subscription import get_subscription

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter(
    prefix="/subscription",
    tags=["Subscription"],
)

@router.get("")
def get_my_subscription(
    current_user: User = Depends(get_current_user),
):
    return {
        "plan": get_subscription(current_user)
    }