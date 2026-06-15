from app.core.database import SessionLocal
from app.services.league_seasons import update_league_seasons

db = SessionLocal()

update_league_seasons(db)

print("League seasons updated")