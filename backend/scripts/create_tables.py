from app.core.database import engine, Base

# 🔥 IMPORTANTE: importar modelos
from app.models.value_bet import ValueBet  # 👈 clave

# 👉 crear tablas
Base.metadata.create_all(bind=engine)

print("✅ Tablas creadas")