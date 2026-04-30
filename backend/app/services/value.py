from sqlalchemy.orm import Session
from datetime import datetime

from app.models.fixture import Fixture
from app.models.odds import Odds

from app.services.probabilities import calculate_match_probabilities, calculate_extra_markets
from app.services.stats import get_team_stats
from app.core.config import LEAGUES
from app.services.team import get_team_form

# -----------------------------
# VALUE CALCULATION
# -----------------------------
def calculate_value(probability: float, odd: float):
    if probability is None or odd is None:
        return None
    # return round((probability * odd) - 1, 3)
    
    value = (probability * odd) - 1

   # 🔥 SOFT CAP (MUCHO MEJOR)
    if value > 0.25:
        value = 0.25 + (value - 0.25) * 0.3

    elif value < -0.25:
        value = -0.25 + (value + 0.25) * 0.3

    # limitar valores extremos
    if value > 1:
        value = 1
    if value < -1:
        value = -1

    return round(value, 3)

# -----------------------------
# BEST ODDS POR MERCADO
# -----------------------------
def get_best_odds_by_market(db: Session, fixture_id: int):
    odds = db.query(Odds).filter(Odds.fixture_id == fixture_id).all()

    markets = {
        "1X2": {},
        "OU15": {},
        "OU25": {},
        "OU35": {},
        "BTTS": {}
    }

    for o in odds:
        market_name = o.market.lower()
        outcome = o.outcome.lower()

        # 1X2
        if "Match Winner" in o.market:
            key = o.outcome

            if key not in markets["1X2"] or o.odd > markets["1X2"][key]["odd"]:
                markets["1X2"][key] = {
                    "odd": o.odd,
                    "bookmaker": o.bookmaker
                }

        # -------------------
        # OVER/UNDER 2.5
        # -------------------
        # elif market_name == "goals over/under":

        #     # detectar línea 2.5 en el outcome
        #     if "2.5" in outcome:

        #         if "over" in outcome:
        #             key = "over"
        #         elif "under" in outcome:
        #             key = "under"
        #         else:
        #             continue

        #         if key not in markets["OU25"] or o.odd > markets["OU25"][key]["odd"]:
        #             markets["OU25"][key] = {
        #                 "odd": o.odd,
        #                 "bookmaker": o.bookmaker
        #             }
        # -------------------
        # OVER/UNDER 1.5, 2.5, 3.5
        # -------------------
        elif market_name == "goals over/under":

            lines = ["1.5", "2.5", "3.5"]

            for line in lines:
                if line in outcome:

                    if "over" in outcome:
                        key = "over"
                    elif "under" in outcome:
                        key = "under"
                    else:
                        continue

                    market_key = f"OU{line.replace('.', '')}"

                    if key not in markets[market_key] or o.odd > markets[market_key][key]["odd"]:
                        markets[market_key][key] = {
                            "odd": o.odd,
                            "bookmaker": o.bookmaker
                        }

        # -------------------
        # BTTS
        # -------------------
        elif market_name == "both teams score":

            if "yes" in outcome:
                key = "yes"
            elif "no" in outcome:
                key = "no"
            else:
                continue

            if key not in markets["BTTS"] or o.odd > markets["BTTS"][key]["odd"]:
                markets["BTTS"][key] = {
                    "odd": o.odd,
                    "bookmaker": o.bookmaker
                }

        # print("MARKET RAW:", o.market, "|", o.outcome)
    return markets


# -----------------------------
# MAIN FUNCTION
# -----------------------------
def get_value_bets(db: Session, limit=50):
    now = datetime.utcnow()

    matches = db.query(Fixture)\
        .filter(Fixture.date >= now)\
        .filter(Fixture.status.in_(["NS", "TBD"]))\
        .filter(Fixture.league_id.in_(LEAGUES))\
        .order_by(Fixture.date.asc())\
        .limit(limit)\
        .all()

    results = []

    for match in matches:
        # print("MATCH:", match.home_team, "vs", match.away_team, "|", match.date)
        home_form = get_team_form(db, match.home_team)
        away_form = get_team_form(db, match.away_team)

        # -----------------------------
        # PROBABILIDADES 1X2
        # -----------------------------
        probs = calculate_match_probabilities(
            db, 
            match.home_team, 
            match.away_team,
            match.api_id,
            match.league_id
        )

        if not probs:
            print("NO PROBS")

        # -----------------------------
        # STATS EXTRA
        # -----------------------------
        home_stats = get_team_stats(db, match.home_team)
        away_stats = get_team_stats(db, match.away_team)

        if home_stats and away_stats:
            extra_probs = calculate_extra_markets(home_stats, away_stats)
        else:
            extra_probs = None

        # -----------------------------
        # ODDS
        # -----------------------------
        markets = get_best_odds_by_market(db, match.api_id)

        if not markets.get("1X2") or not any(markets["1X2"].values()):
            continue

        # print("ODDS:", markets)

        # -----------------------------
        # VALUE 1X2
        # -----------------------------
        if probs and markets["1X2"]:
            value_1x2 = {
                "home_value": calculate_value(probs["home_win_prob"], markets["1X2"].get("home", {}).get("odd")),
                "draw_value": calculate_value(probs["draw_prob"], markets["1X2"].get("draw", {}).get("odd")),
                "away_value": calculate_value(probs["away_win_prob"], markets["1X2"].get("away", {}).get("odd")),
            }
        else:
            value_1x2 = None

        # -----------------------------
        # VALUE OTROS MERCADOS
        # -----------------------------
        market_values = {}

        if extra_probs:

            # OU 1.5
            if markets["OU15"]:
                market_values["OU15"] = {
                    "over_value": calculate_value(
                        extra_probs["over15_prob"],
                        markets["OU15"].get("over", {}).get("odd")
                    ),
                    "under_value": calculate_value(
                        extra_probs["under15_prob"],
                        markets["OU15"].get("under", {}).get("odd")
                    ),
                }

            # OU 2.5
            if markets["OU25"]:
                market_values["OU25"] = {
                    "over_value": calculate_value(
                        extra_probs["over25_prob"],
                        markets["OU25"].get("over", {}).get("odd")
                    ),
                    "under_value": calculate_value(
                        extra_probs["under25_prob"],
                        markets["OU25"].get("under", {}).get("odd")
                    ),
                }

            # OU 3.5
            if markets["OU35"]:
                market_values["OU35"] = {
                    "over_value": calculate_value(
                        extra_probs["over35_prob"],
                        markets["OU35"].get("over", {}).get("odd")
                    ),
                    "under_value": calculate_value(
                        extra_probs["under35_prob"],
                        markets["OU35"].get("under", {}).get("odd")
                    ),
                }                

            # BTTS
            if markets["BTTS"]:
                market_values["BTTS"] = {
                    "yes_value": calculate_value(
                        extra_probs["btts_yes_prob"],
                        markets["BTTS"].get("yes", {}).get("odd")
                    ),
                    "no_value": calculate_value(
                        extra_probs["btts_no_prob"],
                        markets["BTTS"].get("no", {}).get("odd")
                    ),
                }

        # -----------------------------
        # OUTPUT
        # -----------------------------
        results.append({
            "api_id": match.api_id,
            "fixture_id": match.api_id,
            "home_team": match.home_team,
            "away_team": match.away_team,
            "home_form": home_form,
            "away_form": away_form,
            "league": match.league,
            "league_id": match.league_id,
            "date": match.date,

            "probabilities": probs,
            "extra_probabilities": extra_probs,

            "markets": markets,

            "value": value_1x2,
            "market_values": market_values if market_values else None
            
        })

    return results



# -----------------------------
# TOP VALUE BETS
# -----------------------------

def get_top_value_bets(db: Session, top_n=5):

    matches = get_value_bets(db)

    all_bets = []

    for match in matches:

        home = match["home_team"]
        away = match["away_team"]
        league = match["league"]
        date = match["date"]

        # 1X2
        if match["value"]:
            for key in ["home", "draw", "away"]:
                value = match["value"].get(f"{key}_value")
                odd = match["markets"]["1X2"].get(key, {}).get("odd")
                book = match["markets"]["1X2"].get(key, {}).get("bookmaker")

                if value and value > 0:
                    all_bets.append({
                        "match": f"{home} vs {away}",
                        "league": league,
                        "date": date,
                        "market": "1X2",
                        "selection": key.upper(),
                        "odd": odd,
                        "bookmaker": book,
                        "value": round(value * 100, 2)
                    })

        # OU25
        if match.get("market_values") and match["market_values"].get("OU25"):
            for key in ["over", "under"]:
                value = match["market_values"]["OU25"].get(f"{key}_value")
                odd = match["markets"]["OU25"].get(key, {}).get("odd")
                book = match["markets"]["OU25"].get(key, {}).get("bookmaker")

                if value and value > 0:
                    all_bets.append({
                        "match": f"{home} vs {away}",
                        "league": league,
                        "date": date,
                        "market": "OU25",
                        "selection": key.upper(),
                        "odd": odd,
                        "bookmaker": book,
                        "value": round(value * 100, 2)
                    })

        # BTTS
        if match.get("market_values") and match["market_values"].get("BTTS"):
            for key in ["yes", "no"]:
                value = match["market_values"]["BTTS"].get(f"{key}_value")
                odd = match["markets"]["BTTS"].get(key, {}).get("odd")
                book = match["markets"]["BTTS"].get(key, {}).get("bookmaker")

                if value and value > 0:
                    all_bets.append({
                        "match": f"{home} vs {away}",
                        "league": league,
                        "date": date,
                        "market": "BTTS",
                        "selection": key.upper(),
                        "odd": odd,
                        "bookmaker": book,
                        "value": round(value * 100, 2)
                    })

    # 🔥 ordenar por value
    all_bets = sorted(all_bets, key=lambda x: x["value"], reverse=True)

    return all_bets[:top_n]