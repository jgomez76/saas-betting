from app.core.database import engine, Base

# 🔥 IMPORTANTE: importar modelos
from app.models.league_season import LeagueSeason  # 👈 clave

# 👉 crear tablas
Base.metadata.create_all(bind=engine)

print("✅ Tablas creadas")