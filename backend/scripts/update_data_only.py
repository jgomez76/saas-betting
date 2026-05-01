import time
from datetime import datetime, timedelta

from app.core.database import SessionLocal
from app.services.fixtures import fetch_fixtures
from app.services.odds import fetch_odds
from app.services.injuries import fetch_injuries
from app.core.config import LEAGUES, SEASONS

# -----------------------------
# RATE LIMIT CONTROL
# -----------------------------
def wait():
    time.sleep(7)  # 🔥 evita superar 10 calls/min


# -----------------------------
# MAIN UPDATE
# -----------------------------
def update_data_only():
    db = SessionLocal()

    print("🚀 START UPDATE:", datetime.utcnow())

    # -----------------------------
    # 1. FIXTURES
    # -----------------------------
    print("\n📅 Updating fixtures...")

    for league in LEAGUES:
        for season in SEASONS:

            print(f"➡️ League {league} | Season {season}")

            fetch_fixtures(db, league, season)

            wait()

    db.close()

    print("\n✅ UPDATE FINISHED:", datetime.utcnow())


# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    update_data_only()