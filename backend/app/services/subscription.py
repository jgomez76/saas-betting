from sqlalchemy.orm import Session

from app.models.user import User


# ==========================================================
# SUBSCRIPTION SERVICE
# ==========================================================

def get_subscription(user: User) -> str:
    """
    Returns the current subscription plan.
    """

    return user.subscription or "free"


def set_subscription(
    db: Session,
    user: User,
    plan: str,
) -> User:
    """
    Updates the user's subscription.
    """

    user.subscription = plan

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def is_premium(user: User) -> bool:
    """
    Convenience helper.
    """

    return get_subscription(user) == "premium"