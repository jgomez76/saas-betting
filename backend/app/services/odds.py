from sqlalchemy.orm import Session
from app.models.odds import Odds


def save_odds(db: Session, data: dict):
    for item in data["response"]:
        fixture_id = item["fixture"]["id"]
        league_id = item["league"]["id"]

        for bookmaker in item["bookmakers"]:
            bookmaker_name = bookmaker["name"]

            for bet in bookmaker["bets"]:
                market = bet["name"]

                for value in bet["values"]:
                    # raw_outcome = value["value"]
                    raw_outcome = str(value["value"])
                    odd = float(value["odd"])

                    # -------------------------
                    # NORMALIZACIÓN
                    # -------------------------

                    # 1X2
                    if raw_outcome in ["Home", "1"]:
                        outcome = "home"

                    elif raw_outcome in ["Draw", "X"]:
                        outcome = "draw"

                    elif raw_outcome in ["Away", "2"]:
                        outcome = "away"

                    # OVER / UNDER
                    # elif raw_outcome in "Over":
                    #     print(raw_outcome)
                    #     print(value)
                    #     outcome = "over"

                    # elif raw_outcome in "Under":
                    #     outcome = "under"
                    elif "over/under" in market.lower():

                        raw = str(value["value"]).strip().lower()

                        # SOLO queremos líneas con número (ej: 2.5)
                        if any(x in raw for x in ["0.5", "1.5", "2.5", "3.5", "4.5", "5.5"]):

                            outcome = raw   # 👈 "over 2.5"

                        else:
                            # print("IGNORED OU:", raw)
                            continue

                    # BTTS
                    elif raw_outcome.lower() in ["yes", "no"]:
                        outcome = raw_outcome.lower()

                    else:
                        # print("IGNORED:", raw_outcome)
                        continue

                    # -------------------------
                    # UPSERT
                    # -------------------------
                    existing = db.query(Odds).filter(
                        Odds.fixture_id == fixture_id,
                        Odds.bookmaker == bookmaker_name,
                        Odds.market == market,
                        Odds.outcome == outcome
                    ).first()

                    if existing:
                        existing.odd = odd
                    else:
                        new_odd = Odds(
                            fixture_id=fixture_id,
                            league_id=league_id,
                            bookmaker=bookmaker_name,
                            market=market,
                            outcome=outcome,
                            odd=odd
                        )
                        db.add(new_odd)

    db.commit()