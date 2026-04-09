from app.core.database import SessionLocal
from app.models.user import User

db = SessionLocal()

admin = User(
    email="admin@test.com",
    password="1234",
    is_admin=True
)

db.add(admin)
db.commit()

print("✅ Admin creado")