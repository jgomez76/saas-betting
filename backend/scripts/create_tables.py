from app.core.database import engine, Base

# 🔥 IMPORTANTE: importar modelos
from app.models.favorite import Favorite  # 👈 clave

# 👉 crear tablas
Base.metadata.create_all(bind=engine)

print("✅ Tablas creadas")