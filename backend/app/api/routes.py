from fastapi import APIRouter
from app.services.api_football import get_fixtures
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.services.api_football import get_fixtures, save_fixtures
from app.services.analysis import get_last_5_results
from app.services.stats import get_team_stats
from app.services.probabilities import calculate_match_probabilities

router = APIRouter()

@router.get("/fixtures")
def fixtures():
    return get_fixtures()



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/fixtures/save")
def fetch_and_store(db: Session = Depends(get_db)):
    data = get_fixtures()
    save_fixtures(db, data)
    return {"message": "Fixtures saved"}


@router.get("/team/{team_name}/form")
def team_form(team_name: str, db: Session = Depends(get_db)):
    form = get_last_5_results(db, team_name)

    if form is None:
        return {
            "team": team_name,
            "form": None,
            "message": "No data available yet"
        }

    return {"team": team_name, "form": form}

@router.get("/team/{team_name}/stats")
def team_stats(team_name: str, db: Session = Depends(get_db)):
    stats = get_team_stats(db, team_name)

    if stats is None:
        return {
            "team": team_name,
            "message": "No data available"
        }

    return stats

@router.get("/match/probabilities")
def match_probabilities(home: str, away: str, db: Session = Depends(get_db)):
    result = calculate_match_probabilities(db, home, away)

    if result is None:
        return {"message": "Not enough data"}

    return {
        "home_team": home,
        "away_team": away,
        **result
    }