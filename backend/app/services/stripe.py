"""
==========================================================
💳 STRIPE SERVICE
==========================================================

This service is the ONLY place allowed to communicate
with the Stripe SDK.

Routes must never import Stripe directly.

subscription.py contains business logic.
stripe.py contains Stripe integration.
"""


def create_checkout_session(user):
    """
    Creates a Stripe Checkout session.

    (Implementation coming soon)
    """
    raise NotImplementedError


def create_customer_portal(user):
    """
    Opens the Stripe Customer Portal.

    (Implementation coming soon)
    """
    raise NotImplementedError


def handle_webhook(payload, signature):
    """
    Handles Stripe webhook events.

    (Implementation coming soon)
    """
    raise NotImplementedError


def cancel_subscription(user):
    """
    Cancels a Premium subscription.

    (Implementation coming soon)
    """
    raise NotImplementedError