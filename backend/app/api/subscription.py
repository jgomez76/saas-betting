from fastapi import APIRouter, Depends, HTTPException  
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.auth import get_current_user

from app.models.user import User

from app.services.subscription import get_subscription
from app.services.stripe import test_connection, create_checkout_session


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

@router.get("/test-stripe")
def stripe_connection_test():
    return test_connection()

@router.post("/checkout")
def checkout(
    current_user: User = Depends(get_current_user),
):
    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    url = create_checkout_session(current_user)

    return {
        "url": url,
    }