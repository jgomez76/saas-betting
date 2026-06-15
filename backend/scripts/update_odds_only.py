import time
from datetime import datetime, timedelta

from app.core.database import SessionLocal

from app.services.odds import fetch_odds

from app.core.config import (
    LEAGUES,
    get_current_season
)


# -----------------------------
# CONFIG
# -----------------------------
DAYS_AHEAD = 1  # hoy + 1 día


# -----------------------------
# RATE LIMIT CONTROL
# -----------------------------
def wait():
    time.sleep(7)  # evita superar 10 calls/min


# -----------------------------
# MAIN
# -----------------------------
def update_odds_only():

    db = SessionLocal()

    today = datetime.utcnow().date()

    print(
        "💰 START ODDS UPDATE:",
        datetime.utcnow()
    )

    try:

        for league in LEAGUES:

            season = get_current_season(
                league
            )

            for i in range(
                DAYS_AHEAD + 1
            ):

                date = today + timedelta(
                    days=i
                )

                print(
                    f"➡️ League {league} | Season {season} | Date {date}"
                )

                try:

                    fetch_odds(
                        db,
                        league=league,
                        season=season,
                        date=str(date)
                    )

                except Exception as e:

                    print(
                        f"❌ ERROR League {league}: {e}"
                    )

                wait()

    finally:

        db.close()

    print(
        "✅ ODDS UPDATE FINISHED:",
        datetime.utcnow()
    )


# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    update_odds_only()