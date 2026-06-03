import time
from datetime import datetime, timedelta

from app.core.database import SessionLocal
from app.services.odds import fetch_odds
from app.core.config import LEAGUES
from app.services.league_season import get_season


# -----------------------------
# CONFIG
# -----------------------------
DAYS_AHEAD = 1  # hoy + 1 día


# -----------------------------
# RATE LIMIT CONTROL
# -----------------------------
def wait():
    time.sleep(7)  # 🔥 evita superar 10 calls/min


# -----------------------------
# MAIN
# -----------------------------
def update_odds_only():
    db = SessionLocal()

    today = datetime.utcnow().date()

    print("💰 START ODDS UPDATE:", datetime.utcnow())

    for league in LEAGUES:
        for i in range(DAYS_AHEAD + 1):

            date = today + timedelta(days=i)

            print(f"➡️ League {league} | Date {date}")

            try:
                fetch_odds(
                    db,
                    league=league,
                    season=get_season(league),  # temporada actual
                    date=str(date)
                )
            except Exception as e:
                print("❌ ERROR:", e)

            wait()

    db.close()

    print("✅ ODDS UPDATE FINISHED:", datetime.utcnow())


# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    update_odds_only()