import stripe

from app.core.config import (
    STRIPE_SECRET_KEY,
    STRIPE_PREMIUM_PRICE_ID,
    FRONTEND_URL,
)



# ==========================================================
# STRIPE CLIENT
# ==========================================================

stripe.api_key = STRIPE_SECRET_KEY


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
    raise NotImplementedError


def handle_webhook(payload, signature):
    raise NotImplementedError


def cancel_subscription(user):
    raise NotImplementedError