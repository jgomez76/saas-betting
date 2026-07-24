import stripe
import logging

from app.core.config import (
    STRIPE_SECRET_KEY,
    STRIPE_PREMIUM_PRICE_ID,
    FRONTEND_URL,
    STRIPE_WEBHOOK_SECRET,
)

from app.core.database import SessionLocal
from app.models.user import User

from fastapi.responses import JSONResponse
from datetime import datetime

from app.emails.service import (
    send_premium_cancelled_email,
    send_premium_reactivated_email,
    send_premium_expired_email,
    send_premium_activated_email,
)

# ==========================================================
# STRIPE CLIENT
# ==========================================================

stripe.api_key = STRIPE_SECRET_KEY
logger = logging.getLogger(__name__)


# ==========================================================
# STRIPE SERVICE
# ==========================================================

def test_connection():
    """
    Tests the connection with Stripe.
    """

    account = stripe.Account.retrieve()

    return {
        "id": account.id,
        "country": account.country,
        "email": account.email,
    }


def create_checkout_session(user):
    """
    Creates a Stripe Checkout Session.
    """

    checkout = stripe.checkout.Session.create(

        mode="subscription",

        customer_email=user.email,

        metadata={
            "user_id": str(user.id),
        },

        line_items=[
            {
                "price": STRIPE_PREMIUM_PRICE_ID,
                "quantity": 1,
            }
        ],

        success_url=f"{FRONTEND_URL}/",

        cancel_url=f"{FRONTEND_URL}/",

    )

    return checkout.url


def create_customer_portal(user):
    """
    Creates a Stripe Customer Portal session.
    """

    session = stripe.billing_portal.Session.create(
        customer=user.stripe_customer_id,
        return_url=f"{FRONTEND_URL}/",
    )

    return session.url

# ==========================================================
# SUBSCRIPTION UPDATED
# ==========================================================

def handle_subscription_updated(subscription):

    customer_id = subscription["customer"]

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.stripe_customer_id == customer_id)
            .first()
        )

        if user is None:

            print("❌ Usuario no encontrado")

        else:

            previous_status = user.subscription_status
            previous_end = user.subscription_end

            print("------------")
            print(subscription["status"])
            print(subscription["cancel_at"])
            print("------------")

            user.subscription = "premium"

            if subscription["cancel_at"]:
                user.subscription_status = "cancelled"

            else:
                user.subscription_status = "active"


            if subscription["cancel_at"]:
                user.subscription_end = datetime.fromtimestamp(
                    subscription["cancel_at"]
                )

            else:
                user.subscription_end = None

            db.commit()

  

            # Solo enviar email si realmente cambia el estado

            if (
                previous_status != "cancelled"
                and user.subscription_status == "cancelled"
            ):

                send_premium_cancelled_email(
                    user.email,
                    user.subscription_end.strftime("%d/%m/%Y"),
                    user.language,
                )

            elif (
                previous_status == "cancelled"
                and user.subscription_status == "active"
            ):

                send_premium_reactivated_email(
                    user.email,
                    user.language,
                )

            db.refresh(user)

            print("======== AFTER COMMIT ========")
            print("Email:", user.email)
            print("Subscription:", user.subscription)
            print("Status:", user.subscription_status)
            print("End:", user.subscription_end)
            print("==============================")

    finally:

        db.close()

# ==========================================================
# SUBSCRIPTION DELETED
# ==========================================================

def handle_subscription_deleted(
    subscription,
):

    customer_id = subscription["customer"]

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.stripe_customer_id == customer_id)
            .first()
        )

        if user is None:

            print("❌ Usuario no encontrado")

        else:

            print(f"🗑️ Premium expirado para {user.email}")

            user.subscription = "free"
            user.subscription_status = None
            user.subscription_end = None

            db.commit()

            send_premium_expired_email(
                user.email,
                user.language,
            )

            print("✅ Usuario actualizado a FREE")

    finally:

        db.close()

def handle_webhook(payload, signature):

    try:

        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=STRIPE_WEBHOOK_SECRET,
        )

    except Exception as e:

        print(f"❌ Invalid webhook: {e}")

        return JSONResponse(
            status_code=400,
            content={
                "status": "invalid",
            },
        )

    print(f"✅ Event received: {event['type']}")

    if event["type"] == "customer.subscription.updated":

        subscription = event["data"]["object"]

        handle_subscription_updated(
            subscription,
        )

        return JSONResponse(
            {
                "status": "ok",
            }
        )

    # ==========================================================
    # SUBSCRIPTION DELETED
    # ==========================================================

    if event["type"] == "customer.subscription.deleted":

        subscription = event["data"]["object"]

        handle_subscription_deleted(
            subscription,
        )

        return JSONResponse(
            {
                "status": "ok",
            }
        )
    
    # ==========================================================
    # CHECKOUT COMPLETED
    # ==========================================================

    if event["type"] != "checkout.session.completed":

        return JSONResponse(
            {
                "status": "ignored",
            }
        )

    session = event["data"]["object"]

    print("🎉 CHECKOUT COMPLETED")

    user_id = int(session.metadata["user_id"])

    print(f"Activando Premium para User ID: {user_id}")

    db = SessionLocal()



    try:

        user = db.query(User).filter(User.id == user_id).first()

        if user is None:

            print("❌ Usuario no encontrado")

        else:

            stripe_customer_id = session.customer

            if stripe_customer_id:
                user.stripe_customer_id = stripe_customer_id

            user.subscription = "premium"

            db.commit()

            

            send_premium_activated_email(
                user.email,
                user.language,
            )

            print(f"✅ Usuario {user.email} actualizado a PREMIUM")
            print(f"💳 Stripe Customer: {user.stripe_customer_id}")

    finally:

        db.close()

    return JSONResponse(
        {
            "status": "ok",
        }
    )

def cancel_subscription(user):
    raise NotImplementedError