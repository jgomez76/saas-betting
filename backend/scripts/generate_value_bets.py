from app.core.database import SessionLocal
from app.services.value import get_value_bets
from app.models.value_bet import ValueBet
from datetime import datetime

db = SessionLocal()

print("🚀 Generando value bets...")

matches = get_value_bets(db)

print(f"📊 Calculados: {len(matches)} partidos")

saved = 0
updated = 0

for m in matches:

    existing = db.query(ValueBet).filter(
        ValueBet.fixture_id == m["fixture_id"]
    ).first()

    if existing:
        # 🔄 UPDATE
        existing.league = m["league"]
        existing.league_id = m["league_id"]
        existing.home_team = m["home_team"]
        existing.away_team = m["away_team"]
        existing.date = m["date"]

        existing.markets = m["markets"]
        existing.value = m["value"]
        existing.probabilities = m["probabilities"]
        existing.extra_probabilities = m["extra_probabilities"]
        existing.market_values = m["market_values"]

        existing.updated_at = datetime.utcnow()

        updated += 1

    else:
        # ➕ INSERT
        db.add(ValueBet(
            fixture_id=m["fixture_id"],
            league=m["league"],
            league_id=m["league_id"],
            home_team=m["home_team"],
            away_team=m["away_team"],
            date=m["date"],
            markets=m["markets"],
            value=m["value"],
            probabilities=m["probabilities"],
            extra_probabilities=m["extra_probabilities"],
            market_values=m["market_values"],
        ))

        saved += 1

db.commit()

print(f"✅ Guardados: {saved}")
print(f"🔄 Actualizados: {updated}")