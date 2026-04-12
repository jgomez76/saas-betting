from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

import hashlib

SECRET_KEY = "SUPER_SECRET_KEY"
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: int = 60 * 24):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_delta)

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# def hash_password(password: str) -> str:
#     return pwd_context.hash(password[:72])

def hash_password(password: str) -> str:
    # 🔥 SHA256 antes de bcrypt (evita límite)
    hashed = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(hashed)

# def verify_password(plain: str, hashed: str) -> bool:
#     return pwd_context.verify(plain[:72], hashed)

def verify_password(plain: str, hashed: str) -> bool:
    hashed_input = hashlib.sha256(plain.encode()).hexdigest()
    return pwd_context.verify(hashed_input, hashed)