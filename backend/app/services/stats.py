from sqlalchemy.orm import Session
from app.models.fixture import Fixture

def get_team_stats(db: Session, team_name: str):
    matches = db.query(Fixture)\
        .filter(
            (Fixture.home_team == team_name) | 
            (Fixture.away_team == team_name)
        )\
        .filter(Fixture.status == "FT")\
        .all()

    if not matches:
        return None

    total_scored = 0
    total_conceded = 0
    over_25 = 0
    btts = 0

    for match in matches:
        if match.home_team == team_name:
            scored = match.home_goals
            conceded = match.away_goals
        else:
            scored = match.away_goals
            conceded = match.home_goals

        total_scored += scored
        total_conceded += conceded

        if (match.home_goals + match.away_goals) > 2.5:
            over_25 += 1

        if match.home_goals > 0 and match.away_goals > 0:
            btts += 1

    total_matches = len(matches)

    return {
        "team": team_name,
        "avg_goals_scored": round(total_scored / total_matches, 2),
        "avg_goals_conceded": round(total_conceded / total_matches, 2),
        "over_2_5_percentage": round((over_25 / total_matches) * 100, 2),
        "btts_percentage": round((btts / total_matches) * 100, 2)
    }