from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.core.database import SessionLocal
from app.core.config import CURRENT_SEASON, LEAGUES

from app.models.fixture import Fixture

from app.services.api_football import get_fixtures, save_fixtures, get_odds_by_date, get_odds_by_league
from app.services.export import export_to_csv, export_to_excel
from app.services.format import format_message
from app.services.injuries import fetch_injuries
from app.services.notifications import send_email, send_telegram
from app.services.odds import save_odds
from app.services.value import get_value_bets, get_top_value_bets

import io
import csv

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

@router.get("/team/{team_name}/matches")
def get_team_matches(team_name: str, db: Session = Depends(get_db)):
    matches = (
        db.query(Fixture)
        .filter(
            (Fixture.home_team == team_name) | (Fixture.away_team == team_name),
            Fixture.status == "FT"
        )
        .order_by(Fixture.date.desc())
        .limit(5)
        .all()
    )

    result = []

    for m in matches:
        result.append({
            "home": m.home_team,
            "away": m.away_team,
            "home_goals": m.home_goals,
            "away_goals": m.away_goals,
            "date": m.date
        })

    return result


@router.get("/injuries/update")
def update_injuries(db: Session = Depends(get_db)):
    for league in LEAGUES:
        fetch_injuries(db, league, CURRENT_SEASON)

    return {"status": "injuries updated"}


# @router.get("/top-value")
# def top_value(
#     action: str = Query("view"),
#     format: str = Query("csv"),
#     top_n: int = Query(10),
#     db: Session = Depends(get_db)
# ):

#     bets = get_top_value_bets(db, top_n)

#     # -----------------------------
#     # VIEW (por defecto)
#     # -----------------------------
#     if action == "view":
#         return bets

#     # -----------------------------
#     # EXPORT CSV
#     # -----------------------------
#     if action == "export" and format == "csv":
#         file = export_to_csv(bets)
#         return {"status": "csv generado", "file": file}

#     # -----------------------------
#     # EXPORT EXCEL
#     # -----------------------------
#     if action == "export" and format == "excel":
#         file = export_to_excel(bets)
#         return {"status": "excel generado", "file": file}

#     # -----------------------------
#     # EMAIL
#     # -----------------------------
#     if action == "email":
#         message = format_message(bets)
#         send_email(message)
#         return {"status": "email enviado"}

#     # -----------------------------
#     # TELEGRAM
#     # -----------------------------
#     if action == "telegram":
#         message = format_message(bets)
#         send_telegram(message)
#         return {"status": "telegram enviado"}

#     # -----------------------------
#     # WHATSAPP (link)
#     # -----------------------------
#     if action == "whatsapp":
#         message = format_message(bets)
#         url = f"https://wa.me/?text={message}"
#         return {"url": url}

#     return {"error": "acción no válida"}


@router.get("/top-value")
def top_value(request: Request, db: Session = Depends(get_db)):

    action = request.query_params.get("action")
    ids = request.query_params.get("ids")

    bets = get_top_value_bets(db)

    # 🔥 FILTRAR SELECCIONADAS
    if ids:
        ids_list = [int(i) for i in ids.split(",")]
        bets = [b for i, b in enumerate(bets) if i in ids_list]

    # -----------------------
    # CSV
    # -----------------------
    if action == "csv":

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["Match", "Market", "Pick", "Odd", "Bookmaker", "Value"])

        for b in bets:
            writer.writerow([
                b["match"],
                b["market"],
                b["selection"],
                b["odd"],
                b["bookmaker"],
                b["value"]
            ])

        output.seek(0)

        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=top_bets.csv"
            },
        )

    # -----------------------
    # DEFAULT
    # -----------------------
    return bets

@router.get("/fixture/{fixture_id}/result")
def get_fixture_result(fixture_id: int, db: Session = Depends(get_db)):
    match = db.query(Fixture).filter(Fixture.api_id == fixture_id).first()

    if not match:
        return None

    return {
        "home_goals": match.home_goals,
        "away_goals": match.away_goals,
        "status": match.status
    }