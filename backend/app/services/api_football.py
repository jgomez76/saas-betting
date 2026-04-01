import requests
from app.core.config import API_FOOTBALL_KEY, BASE_URL
from sqlalchemy.orm import Session
from app.models.fixture import Fixture

headers = {
    "x-apisports-key": API_FOOTBALL_KEY
}

def get_fixtures():
    url = f"{BASE_URL}/fixtures?league=39&season=2023"
    response = requests.get(url, headers=headers)
    return response.json()


def save_fixtures(db: Session, data: dict):
    for item in data["response"]:
        fixture_data = item["fixture"]
        teams = item["teams"]
        league = item["league"]
        goals = item["goals"]

        existing = db.query(Fixture).filter(Fixture.api_id == fixture_data["id"]).first()
        if existing:
            continue

        new_fixture = Fixture(
            api_id=fixture_data["id"],
            home_team=teams["home"]["name"],
            away_team=teams["away"]["name"],
            home_goals=goals["home"],
            away_goals=goals["away"],
            status=fixture_data["status"]["short"],
            date=fixture_data["date"],
            league=league["name"],
            season=league["season"]
        )

        db.add(new_fixture)

    db.commit()