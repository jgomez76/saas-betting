from fastapi import APIRouter, Depends, HTTPException, Request 
from fastapi.responses import JSONResponse

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.auth import get_current_user

from app.models.user import User

from app.services.subscription import get_subscription
from app.services.stripe import test_connection, create_checkout_session, handle_webhook, create_customer_portal


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

@router.post("/portal")
def customer_portal(
    current_user: User = Depends(get_current_user),
):
    if current_user is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated",
        )

    if not current_user.stripe_customer_id:
        raise HTTPException(
            status_code=400,
            detail="Stripe customer not found",
        )

    url = create_customer_portal(current_user)

    return {
        "url": url,
    }

@router.post("/webhook")
async def stripe_webhook(request: Request):

    payload = await request.body()

    signature = request.headers.get("stripe-signature")

    return handle_webhook(
        payload,
        signature,
    )