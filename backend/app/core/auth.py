from jose import jwt
from datetime import datetime, timedelta

from fastapi import Cookie, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.core.security import SECRET_KEY, ALGORITHM

def create_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    access_token: str = Cookie(None),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated user from the access_token cookie.
    """

    if not access_token:
        return None

    try:
        payload = jwt.decode(
            access_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:
            return None

        user = db.query(User).filter(User.id == user_id).first()

        if not user or not user.is_active:
            return None

        return user

    except Exception:
        return None