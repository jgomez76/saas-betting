from app.core.database import SessionLocal
from app.models.bet import Bet
from app.models.fixture import Fixture

db = SessionLocal()

pending = db.query(Bet).filter(
    Bet.status == "pending"
).all()

updated = 0

for bet in pending:

    fixture = db.query(Fixture).filter(
        Fixture.api_id == bet.fixture_id
    ).first()

    if not fixture or fixture.status != "FT":
        continue

    home = fixture.home_goals
    away = fixture.away_goals

    status = "lost"

    # -------- 1X2 --------
    if bet.market == "1X2":
        if (
            (bet.selection == "home" and home > away) or
            (bet.selection == "away" and away > home) or
            (bet.selection == "draw" and home == away)
        ):
            status = "won"

    # -------- OU25 --------
    elif bet.market == "OU25":
        total = home + away
        if (
            (bet.selection == "over" and total > 2.5) or
            (bet.selection == "under" and total < 2.5)
        ):
            status = "won"

    # -------- OU35 --------
    elif bet.market == "OU35":
        total = home + away
        if (
            (bet.selection == "over" and total > 3.5) or
            (bet.selection == "under" and total < 3.5)
        ):
            status = "won"

    # -------- BTTS --------
    elif bet.market == "BTTS":
        btts = home > 0 and away > 0
        if (
            (bet.selection == "yes" and btts) or
            (bet.selection == "no" and not btts)
        ):
            status = "won"

    bet.status = status
    bet.result = f"{home}-{away}"

    updated += 1

db.commit()

print(f"✅ Bets actualizadas: {updated}")