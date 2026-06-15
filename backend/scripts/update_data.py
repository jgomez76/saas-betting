import time
from datetime import datetime, timedelta

from app.core.database import SessionLocal

from app.services.fixtures import fetch_fixtures
from app.services.odds import fetch_odds
from app.services.injuries import fetch_injuries

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
# MAIN UPDATE
# -----------------------------
def update_data():

    db = SessionLocal()

    today = datetime.utcnow().date()

    print("🚀 START UPDATE:", datetime.utcnow())

    try:

        # -----------------------------
        # 1. FIXTURES
        # -----------------------------
        print("\n📅 Updating fixtures...")

        for league in LEAGUES:

            season = get_current_season(
                league
            )

            print(
                f"➡️ Fixtures | League {league} | Season {season}"
            )

            fetch_fixtures(
                db,
                league,
                season
            )

            wait()

        # -----------------------------
        # 2. ODDS
        # -----------------------------
        print("\n💰 Updating odds...")

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
                    f"➡️ Odds | League {league} | Season {season} | Date {date}"
                )

                fetch_odds(
                    db,
                    league=league,
                    season=season,
                    date=str(date)
                )

                wait()

        # -----------------------------
        # 3. INJURIES
        # -----------------------------
        print("\n🏥 Updating injuries...")

        for league in LEAGUES:

            season = get_current_season(
                league
            )

            print(
                f"➡️ Injuries | League {league} | Season {season}"
            )

            fetch_injuries(
                db,
                league=league,
                season=season
            )

            wait()

    finally:

        db.close()

    print(
        "\n✅ UPDATE FINISHED:",
        datetime.utcnow()
    )


# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    update_data()