from sqlalchemy.orm import Session
from app.models.odds import Odds

def save_odds(db: Session, data: dict):
    for item in data["response"]:
        fixture_id = item["fixture"]["id"]
        league_id = item["league"]["id"]

        for bookmaker in item["bookmakers"]:
            bookmaker_name = bookmaker["name"]

            for bet in bookmaker["bets"]:
                market = bet["name"]  # Match Winner, Over/Under, etc.

                for value in bet["values"]:
                    outcome = value["value"]  # Home, Draw, Away
                    odd = float(value["odd"])

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