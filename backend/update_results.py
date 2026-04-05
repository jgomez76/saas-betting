from datetime import datetime, timedelta
import requests

from app.core.database import SessionLocal
from app.models.fixture import Fixture
from app.core.config import API_FOOTBALL_KEY, LEAGUES, CURRENT_SEASON

HEADERS = {
    "x-apisports-key": API_FOOTBALL_KEY
}

BASE_URL = "https://v3.football.api-sports.io/fixtures"


def update_results():
    db = SessionLocal()

    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    from_date = str(yesterday)
    to_date = str(today)

    print(f"Updating results from {from_date} to {to_date}")

    for league_id in LEAGUES:
        print(f"➡️ League {league_id}")

        url = (
            f"{BASE_URL}"
            f"?league={league_id}"
            f"&season={CURRENT_SEASON}"
            f"&from={from_date}"
            f"&to={to_date}"
        )

        res = requests.get(url, headers=HEADERS)
        data = res.json()

        for item in data.get("response", []):
            fixture_id = item["fixture"]["id"]
            status = item["fixture"]["status"]["short"]

            home_goals = item["goals"]["home"]
            away_goals = item["goals"]["away"]

            match = db.query(Fixture).filter(
                Fixture.api_id == fixture_id
            ).first()

            if match:
                match.status = status
                match.home_goals = home_goals
                match.away_goals = away_goals

        db.commit()

    db.close()
    print("✅ Results updated successfully")


if __name__ == "__main__":
    update_results()