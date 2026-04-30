from app.core.database import SessionLocal
from app.services.standings_builder import build_standings

db = SessionLocal()

build_standings(db)