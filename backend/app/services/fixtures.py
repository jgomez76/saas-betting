import requests
from sqlalchemy.orm import Session
from app.models.fixture import Fixture
from app.core.config import API_FOOTBALL_KEY
from datetime import datetime


def fetch_fixtures(db: Session, league: int, season: int):

    url = "https://v3.football.api-sports.io/fixtures"

    headers = {
        "x-apisports-key": API_FOOTBALL_KEY
    }

    params = {
        "league": league,
        "season": season
    }

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    for item in data.get("response", []):

        fixture_data = item.get("fixture", {})
        teams_data = item.get("teams", {})
        goals_data = item.get("goals", {})
        league_data = item.get("league", {})

        fixture_id = fixture_data.get("id")
        date_str = fixture_data.get("date")

        try:
            date = datetime.fromisoformat(date_str.replace("Z", "+00:00")) if date_str else None
        except Exception:
            print("⚠️ Error parsing date:", date_str)
            date = None
            
        status = fixture_data.get("status", {}).get("short")

        home_team = teams_data.get("home", {}).get("name")
        away_team = teams_data.get("away", {}).get("name")

        home_team_id = teams_data.get("home", {}).get("id")
        away_team_id = teams_data.get("away", {}).get("id")

        home_goals = goals_data.get("home")
        away_goals = goals_data.get("away")

        league_name = league_data.get("name")

        # 🚨 Validación mínima
        if not fixture_id or not home_team or not away_team:
            continue

        # -----------------------------
        # 🔥 UPSERT
        # -----------------------------
        existing = db.query(Fixture).filter(
            Fixture.api_id == fixture_id
        ).first()

        if existing:
            # ✅ UPDATE COMPLETO
            existing.date = date
            existing.status = status
            existing.home_goals = home_goals
            existing.away_goals = away_goals

            # 🔥 CLAVE (AÑADIR ESTO)
            existing.home_team_id = home_team_id
            existing.away_team_id = away_team_id

        else:
            # ✅ INSERT NUEVO
            db.add(Fixture(
                api_id=fixture_id,
                home_team=home_team,
                away_team=away_team,

                # 🔥 CLAVE
                home_team_id=home_team_id,
                away_team_id=away_team_id,

                league=league_name,
                league_id=league,
                date=date,
                status=status,
                home_goals=home_goals,
                away_goals=away_goals,
                season=season
            ))

    db.commit()