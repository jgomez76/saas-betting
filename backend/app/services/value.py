from sqlalchemy.orm import Session
from app.models.fixture import Fixture
from app.models.odds import Odds
from app.services.probabilities import calculate_match_probabilities, add_bookmaker_odds
from datetime import datetime


def calculate_value(probability: float, bookmaker_odds: float):
    if bookmaker_odds is None:
        return None
    return round((probability * bookmaker_odds) - 1, 3)


def detect_value(probabilities: dict, bookmaker: dict):
    return {
        "home_value": calculate_value(probabilities["home_win_prob"], bookmaker["home_odds_book"]),
        "draw_value": calculate_value(probabilities["draw_prob"], bookmaker["draw_odds_book"]),
        "away_value": calculate_value(probabilities["away_win_prob"], bookmaker["away_odds_book"]),
    }

def get_value_bets(db: Session, limit=10):
    now = datetime.utcnow()

    matches = db.query(Fixture)\
        .filter(Fixture.date >= now)\
        .filter(Fixture.status == "NS")\
        .filter(Fixture.league_id.in_([140, 141]))\
        .order_by(Fixture.date.asc())\
        .limit(limit)\
        .all()

    results = []

    for match in matches:
        print("MATCH:", match.home_team, "vs", match.away_team, "|", match.date)

        probs = calculate_match_probabilities(db, match.home_team, match.away_team)

        if not probs:
            print("NO PROBS")
            continue

        if probs["home_odds"] is None or probs["away_odds"] is None:
            continue

        # bookmaker = add_bookmaker_odds(probs)
        # value = detect_value(probs, bookmaker)

        best_odds = get_best_odds(db, match.api_id)
        print("ODDS:", best_odds)

        if not best_odds:
            continue

        value = {
            "home_value": calculate_value(probs["home_win_prob"], best_odds.get("home", {}).get("odd")),
            "draw_value": calculate_value(probs["draw_prob"], best_odds.get("draw", {}).get("odd")),
            "away_value": calculate_value(probs["away_win_prob"], best_odds.get("away", {}).get("odd")),
        }

        results.append({
            "home_team": match.home_team,
            "away_team": match.away_team,
            "league": match.league,
            "date": match.date,
            "probabilities": probs,
            "best_odds": best_odds,
            "value": value
        })

    return results

def get_best_odds(db: Session, fixture_id: int):
    odds = db.query(Odds).filter(Odds.fixture_id == fixture_id).all()

    best = {}

    for o in odds:
        # solo mercado 1X2 por ahora
        if o.market != "Match Winner":
            continue

        key = o.outcome.lower()  # home, draw, away

        if key not in best or o.odd > best[key]["odd"]:
            best[key] = {
                "odd": o.odd,
                "bookmaker": o.bookmaker
            }

    return best