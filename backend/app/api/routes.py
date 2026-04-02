from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal

from app.services.api_football import get_fixtures, save_fixtures, get_odds_by_date
from app.services.value import get_value_bets

from app.services.api_football import get_odds_by_league
from app.services.odds import save_odds

from datetime import datetime, timedelta

from app.core.config import CURRENT_SEASON, LEAGUES

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/fixtures/save/{league_id}/{season}")
def fetch_and_store(league_id: int, season: int, db: Session = Depends(get_db)):
    data = get_fixtures(league_id, season)
    save_fixtures(db, data)
    return {"message": f"Fixtures saved for league {league_id}, season {season}"}


@router.get("/value-bets")
def value_bets(db: Session = Depends(get_db)):
    return get_value_bets(db)



@router.get("/odds/save/{league_id}/{season}")
def fetch_odds(league_id: int, season: int, db: Session = Depends(get_db)):
    data = get_odds_by_league(league_id, season)
    save_odds(db, data)
    return {"message": "Odds saved"}



@router.get("/odds/update")
def update_odds(db: Session = Depends(get_db)):
    today = datetime.utcnow()

    dates = [
        today.strftime("%Y-%m-%d"),
        (today + timedelta(days=1)).strftime("%Y-%m-%d"),
        (today + timedelta(days=2)).strftime("%Y-%m-%d"),
    ]

    for league in LEAGUES:
        for date in dates:
            print(f"Fetching odds for league {league} date {date}")
            data = get_odds_by_date(league, date, CURRENT_SEASON)
            save_odds(db, data)

    return {"message": "Odds updated (today + next 2 days)"}