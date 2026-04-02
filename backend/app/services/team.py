from sqlalchemy.orm import Session
from app.models.fixture import Fixture


def get_team_form(db: Session, team_name: str, limit: int = 5):
    matches = (
        db.query(Fixture)
        .filter(
            (Fixture.home_team == team_name) | (Fixture.away_team == team_name),
            Fixture.status == "FT"
        )
        .order_by(Fixture.date.desc())
        .limit(limit)
        .all()
    )

    form = ""

    for match in matches:
        if match.home_team == team_name:
            if match.home_goals > match.away_goals:
                form += "W"
            elif match.home_goals == match.away_goals:
                form += "D"
            else:
                form += "L"
        else:
            if match.away_goals > match.home_goals:
                form += "W"
            elif match.away_goals == match.home_goals:
                form += "D"
            else:
                form += "L"

    return form