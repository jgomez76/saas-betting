import requests
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.config import API_FOOTBALL_KEY, BASE_URL
from app.models.fixture import Fixture

headers = {
    "x-apisports-key": API_FOOTBALL_KEY
}

def get_fixtures(league_id: int, season: int):
    url = f"{BASE_URL}/fixtures?league={league_id}&season={season}"
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
            league_id=league["id"],
            league=league["name"],
            
            home_team=teams["home"]["name"],
            away_team=teams["away"]["name"],
            
            home_goals=goals["home"] if goals["home"] is not None else 0,
            away_goals=goals["away"] if goals["away"] is not None else 0,
            
            status=fixture_data["status"]["short"],
            date=datetime.fromisoformat(fixture_data["date"].replace("Z", "+00:00")),
            
            season=league["season"]
        )

        db.add(new_fixture)

    db.commit()

def get_odds_by_league(league_id: int, season: int):
    url = f"{BASE_URL}/odds?league={league_id}&season={season}"
    response = requests.get(url, headers=headers)
    return response.json()

def get_odds_by_date(league_id: int, date: str, season: int):
    url = f"{BASE_URL}/odds?league={league_id}&season={season}&date={date}"
    response = requests.get(url, headers=headers)
    return response.json()