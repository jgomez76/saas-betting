from app.core.database import engine, Base

# 🔥 IMPORTANTE: importar modelos
# from app.models.user import User  # 👈 clave
from app.models.fixture import Fixture  # 👈 clave

# 👉 crear tablas
Base.metadata.create_all(bind=engine)

print("✅ Tablas creadas")