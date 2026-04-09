from app.core.database import SessionLocal
from app.models.analysis import Analysis
from app.models.fixture import Fixture

db = SessionLocal()

pending = db.query(Analysis).filter(
    Analysis.status == "pending"
).all()

for bet in pending:

    f = db.query(Fixture).filter(
        Fixture.fixture_id == bet.fixture_id
    ).first()

    if not f or f.status != "FT":
        continue

    home = f.home_goals
    away = f.away_goals

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
    if bet.market == "OU25":
        total = home + away
        if (
            (bet.selection == "over" and total > 2.5) or
            (bet.selection == "under" and total < 2.5)
        ):
            status = "won"

        # -------- OU35 --------
    if bet.market == "OU35":
        total = home + away
        if (
            (bet.selection == "over" and total > 3.5) or
            (bet.selection == "under" and total < 3.5)
        ):
            status = "won"

    # -------- BTTS --------
    if bet.market == "BTTS":
        btts = home > 0 and away > 0
        if (
            (bet.selection == "yes" and btts) or
            (bet.selection == "no" and not btts)
        ):
            status = "won"

    bet.status = status
    bet.result = f"{home}-{away}"

db.commit()

print("✅ Results updated desde fixtures")