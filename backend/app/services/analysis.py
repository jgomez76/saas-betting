from sqlalchemy.orm import Session
from app.models.fixture import Fixture

def get_last_5_results(db: Session, team_name: str):
    matches = db.query(Fixture)\
        .filter(
            (Fixture.home_team == team_name) | 
            (Fixture.away_team == team_name)
        )\
        .filter(Fixture.status == "FT")\
        .order_by(Fixture.date.desc())\
        .limit(5)\
        .all()

    if not matches:
        return None  # 👈 importante

    results = []

    for match in matches:
        if match.home_team == team_name:
            if match.home_goals > match.away_goals:
                results.append("W")
            elif match.home_goals < match.away_goals:
                results.append("L")
            else:
                results.append("D")
        else:
            if match.away_goals > match.home_goals:
                results.append("W")
            elif match.away_goals < match.home_goals:
                results.append("L")
            else:
                results.append("D")

    return "".join(results)