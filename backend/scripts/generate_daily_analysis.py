import requests
from app.core.database import SessionLocal
from app.models.analysis import Analysis
from datetime import datetime
import pytz

API_URL = "http://127.0.0.1:8000/value-bets"

db = SessionLocal()

tz = pytz.timezone("Europe/Madrid")
today = datetime.now(tz).date()

res = requests.get(API_URL)
matches = res.json()

for m in matches:

    # 🔥 FILTRO SOLO HOY
    match_date = datetime.fromisoformat(m["date"]).replace(tzinfo=pytz.UTC)
    match_date_local = match_date.astimezone(tz)

    if match_date_local.date() != today:
        continue

    fixture_id = m["fixture_id"]

    # ---------------- 1X2 ----------------
    if m.get("value") and m.get("markets", {}).get("1X2"):
        for selection in ["home", "draw", "away"]:

            value = m["value"].get(f"{selection}_value")
            odd = m["markets"]["1X2"].get(selection, {}).get("odd")

            if value is None or value <= 0:
                continue

            if odd is None or odd < 1.5:
                continue

            exists = db.query(Analysis).filter(
                Analysis.fixture_id == fixture_id,
                Analysis.market == "1X2",
                Analysis.selection == selection
            ).first()

            if not exists:
                db.add(Analysis(
                    fixture_id=fixture_id,
                    league=m["league"],
                    home_team=m["home_team"],
                    away_team=m["away_team"],
                    market="1X2",
                    selection=selection,
                    odd=odd,
                    value=value,
                    date=datetime.fromisoformat(m["date"])
                ))

    # ---------------- OU25 & OU35 ----------------
    for market in ["OU25", "OU35"]:

        if not m.get("markets", {}).get(market):
            continue

        market_values = m.get("market_values", {}).get(market, {})
        market_odds = m["markets"][market]

        for selection in ["over", "under"]:

            value_key = f"{selection}_value"
            value = market_values.get(value_key)
            odd = market_odds.get(selection, {}).get("odd")

            if value is None or value <= 0:
                continue

            if odd is None or odd < 1.5:
                continue

            exists = db.query(Analysis).filter(
                Analysis.fixture_id == fixture_id,
                Analysis.market == market,
                Analysis.selection == selection
            ).first()

            if not exists:
                db.add(Analysis(
                    fixture_id=fixture_id,
                    league=m["league"],
                    home_team=m["home_team"],
                    away_team=m["away_team"],
                    market=market,
                    selection=selection,
                    odd=odd,
                    value=value,
                    date=datetime.fromisoformat(m["date"])
                ))

    # ---------------- BTTS ----------------
    if m.get("markets", {}).get("BTTS"):

        market_values = m.get("market_values", {}).get("BTTS", {})
        market_odds = m["markets"]["BTTS"]

        for selection in ["yes", "no"]:

            value_key = f"{selection}_value"
            value = market_values.get(value_key)
            odd = market_odds.get(selection, {}).get("odd")

            if value is None or value <= 0:
                continue

            if odd is None or odd < 1.5:
                continue

            exists = db.query(Analysis).filter(
                Analysis.fixture_id == fixture_id,
                Analysis.market == "BTTS",
                Analysis.selection == selection
            ).first()

            if not exists:
                db.add(Analysis(
                    fixture_id=fixture_id,
                    league=m["league"],
                    home_team=m["home_team"],
                    away_team=m["away_team"],
                    market="BTTS",
                    selection=selection,
                    odd=odd,
                    value=value,
                    date=datetime.fromisoformat(m["date"])
                ))

db.commit()

print("✅ Analysis generado")