from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal

from app.services.api_football import get_fixtures, save_fixtures
from app.services.value import get_value_bets

from app.services.api_football import get_odds_by_league
from app.services.odds import save_odds

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