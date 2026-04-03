from sqlalchemy.orm import Session
from app.models.fixture import Fixture

def get_team_stats(db: Session, team_name: str):
    matches = db.query(Fixture)\
        .filter(
            (Fixture.home_team == team_name) | 
            (Fixture.away_team == team_name)
        )\
        .filter(Fixture.status.in_(["FT", "AET", "PEN"]))\
        .all()
        # .filter(Fixture.status == "FT")\

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

## Paso 3, Home/Away Split
def get_team_stats_split(db: Session, team: str):
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
        "home_scored_avg": home_scored / len(home_matches) if home_matches else None,
        "home_conceded_avg": home_conceded / len(home_matches) if home_matches else None,
        "away_scored_avg": away_scored / len(away_matches) if away_matches else None,
        "away_conceded_avg": away_conceded / len(away_matches) if away_matches else None,
    }

## Paso 4, forma reciente
def get_recent_stats(db: Session, team: str, limit: int = 5):
    matches = (
        db.query(Fixture)
        .filter(
            ((Fixture.home_team == team) | (Fixture.away_team == team)),
            Fixture.status == "FT"
        )
        .order_by(Fixture.date.desc())
        .limit(limit)
        .all()
    )

    if not matches:
        return None

    goals_scored = 0
    goals_conceded = 0

    for m in matches:
        if m.home_team == team:
            goals_scored += m.home_goals
            goals_conceded += m.away_goals
        else:
            goals_scored += m.away_goals
            goals_conceded += m.home_goals

    return {
        "scored_avg": goals_scored / len(matches),
        "conceded_avg": goals_conceded / len(matches),
    }