from app.core.database import engine, Base

# 🔥 IMPORTANTE: importar modelos
from app.models.bet import Bet  # 👈 clave

# 👉 crear tablas
Base.metadata.create_all(bind=engine)

print("✅ Tablas creadas")