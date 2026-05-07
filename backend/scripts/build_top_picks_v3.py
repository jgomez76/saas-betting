from app.core.database import SessionLocal
from app.services.top_picks import generate_top_picks_v3
db = SessionLocal()

generate_top_picks_v3(db)