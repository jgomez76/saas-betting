from app.core.database import engine, Base

# 🔥 IMPORTANTE: importar modelos
from app.models.top_picks_history import TopPickHistory  # 👈 clave

# 👉 crear tablas
Base.metadata.create_all(bind=engine)

print("✅ Tablas creadas")