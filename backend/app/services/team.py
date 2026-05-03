from sqlalchemy.orm import Session
from app.models.fixture import Fixture


def get_team_form(db: Session, team_id: int, limit: int = 5):

    print(f"👉 get_team_form CALLED for team_id: {team_id}")

    matches = (
        db.query(Fixture)
        .filter(
            (Fixture.home_team_id == team_id) |
            (Fixture.away_team_id == team_id),
            Fixture.status == "FT"
        )
        .order_by(Fixture.date.desc())
        .limit(limit)
        .all()
    )

    print(f"👉 matches found: {len(matches)}")

    form = ""

    for match in matches:
        print(
            f"   MATCH → {match.home_team_id} vs {match.away_team_id} | {match.home_goals}-{match.away_goals}"
        )

        if match.home_team_id == team_id:
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

    print(f"👉 FINAL FORM: {form}")

    return form[::-1]


# 🔥 NUEVO → HOME / AWAY SPLIT
def get_team_stats(db: Session, team: str):
    home_matches = db.query(Fixture).filter(
        Fixture.home_team == team,
        Fixture.status == "FT"
    ).all()

    away_matches = db.query(Fixture).filter(
        Fixture.away_team == team,
        Fixture.status == "FT"
    ).all()

    # HOME
    home_scored = sum(m.home_goals for m in home_matches)
    home_conceded = sum(m.away_goals for m in home_matches)

    # AWAY
    away_scored = sum(m.away_goals for m in away_matches)
    away_conceded = sum(m.home_goals for m in away_matches)

    return {
        "home_avg_scored": home_scored / len(home_matches) if home_matches else 0,
        "home_avg_conceded": home_conceded / len(home_matches) if home_matches else 0,
        "away_avg_scored": away_scored / len(away_matches) if away_matches else 0,
        "away_avg_conceded": away_conceded / len(away_matches) if away_matches else 0,
    }