import time
from datetime import datetime

from app.core.database import SessionLocal
from app.services.fixtures import fetch_fixtures
from app.core.config import (
    LEAGUES,
    get_current_season
)

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

    print("🚀 START UPDATE:", datetime.utcnow())

    try:

        # -----------------------------
        # FIXTURES
        # -----------------------------
        print("\n📅 Updating fixtures...")

        for league in LEAGUES:

            season = get_current_season(
                league
            )

            print(
                f"➡️ League {league} | Season {season}"
            )

            fetch_fixtures(
                db,
                league,
                season
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