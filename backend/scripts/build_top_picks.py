from app.core.database import SessionLocal
from app.services.top_picks import generate_top_picks
db = SessionLocal()

generate_top_picks(db)