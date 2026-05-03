from app.core.database import SessionLocal
from app.services.top_picks import update_top_pick_results
db = SessionLocal()

update_top_pick_results(db)