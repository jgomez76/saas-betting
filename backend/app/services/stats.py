from sqlalchemy.orm import Session
from app.models.fixture import Fixture
from app.core.config import CURRENT_SEASON

def get_team_stats(db: Session, team_id: int):

    # matches = db.query(Fixture)\
    #     .filter(
    #         (Fixture.home_team_id == team_id) |
    #         (Fixture.away_team_id == team_id)
    #     )\
    #     .filter(Fixture.status.in_(["FT", "AET", "PEN"]))\
    #     .all()
    matches = db.query(Fixture)\
        .filter(
            (Fixture.home_team_id == team_id) |
            (Fixture.away_team_id == team_id)
        )\
        .filter(Fixture.status.in_(["FT", "AET", "PEN"]))\
        .filter(Fixture.season == CURRENT_SEASON)\
        .all()

    if not matches:
        return {
            "matches": 0,
            "avg_goals_scored": 0,
            "avg_goals_conceded": 0,
            "results": {"win": 0, "draw": 0, "loss": 0},
            "markets": {"over_2_5": 0, "over_3_5": 0, "btts": 0},
        }

    total_scored = 0
    total_conceded = 0
    wins = draws = losses = 0
    over25 = over35 = btts = 0

    for m in matches:

        if m.home_team_id == team_id:
            scored = m.home_goals or 0
            conceded = m.away_goals or 0
        else:
            scored = m.away_goals or 0
            conceded = m.home_goals or 0

        total_scored += scored
        total_conceded += conceded

        # resultados
        if scored > conceded:
            wins += 1
        elif scored == conceded:
            draws += 1
        else:
            losses += 1

        # mercados
        if (m.home_goals or 0) + (m.away_goals or 0) > 2.5:
            over25 += 1

        if (m.home_goals or 0) + (m.away_goals or 0) > 3.5:
            over35 += 1

        if (m.home_goals or 0) > 0 and (m.away_goals or 0) > 0:
            btts += 1

    total = len(matches)

    return {
        "matches": total,
        "avg_goals_scored": round(total_scored / total, 2),
        "avg_goals_conceded": round(total_conceded / total, 2),
        "results": {
            "win": round(wins / total * 100, 1),
            "draw": round(draws / total * 100, 1),
            "loss": round(losses / total * 100, 1),
        },
        "markets": {
            "over_2_5": round(over25 / total * 100, 1),
            "over_3_5": round(over35 / total * 100, 1),
            "btts": round(btts / total * 100, 1),
        }
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

def get_team_form(db: Session, team: str, limit: int = 5):
    matches = (
        db.query(Fixture)
        .filter(
            ((Fixture.home_team == team) | (Fixture.away_team == team)),
            Fixture.status.in_(["FT", "AET", "PEN"])
        )
        .order_by(Fixture.date.desc())
        .limit(limit)
        .all()
    )

    if not matches:
        return ""

    form = ""

    for m in matches:
        if m.home_team == team:
            if m.home_goals > m.away_goals:
                form += "W"
            elif m.home_goals == m.away_goals:
                form += "D"
            else:
                form += "L"
        else:
            if m.away_goals > m.home_goals:
                form += "W"
            elif m.away_goals == m.home_goals:
                form += "D"
            else:
                form += "L"

    # 🔥 importante → orden correcto (más antiguo → más reciente)
    return form[::-1]

def get_team_advanced_stats(db: Session, team: str):

    matches = db.query(Fixture)\
        .filter(
            (Fixture.home_team == team) |
            (Fixture.away_team == team),
            Fixture.status.in_(["FT", "AET", "PEN"])
        )\
        .all()

    if not matches:
        return None

    total = len(matches)

    wins = draws = losses = 0
    goals_scored = 0
    goals_conceded = 0

    for m in matches:
        if m.home_team == team:
            scored = m.home_goals
            conceded = m.away_goals
        else:
            scored = m.away_goals
            conceded = m.home_goals

        goals_scored += scored
        goals_conceded += conceded

        if scored > conceded:
            wins += 1
        elif scored == conceded:
            draws += 1
        else:
            losses += 1

    return {
        "team": team,
        "matches": total,
        "wins": wins,
        "draws": draws,
        "losses": losses,

        "win_rate": round(wins / total * 100, 1),
        "goals_scored_avg": round(goals_scored / total, 2),
        "goals_conceded_avg": round(goals_conceded / total, 2),

        "goal_diff": goals_scored - goals_conceded,
    }

def get_league_stats(db: Session, league_id: int):

    matches = db.query(Fixture)\
        .filter(
            Fixture.league_id == league_id,
            Fixture.status.in_(["FT", "AET", "PEN"])
        )\
        .all()

    if not matches:
        return None

    total = len(matches)

    home_wins = draws = away_wins = 0
    goals = 0

    for m in matches:
        goals += (m.home_goals + m.away_goals)

        if m.home_goals > m.away_goals:
            home_wins += 1
        elif m.home_goals == m.away_goals:
            draws += 1
        else:
            away_wins += 1

    return {
        "matches": total,
        "avg_goals": round(goals / total, 2),

        "home_win_pct": round(home_wins / total * 100, 1),
        "draw_pct": round(draws / total * 100, 1),
        "away_win_pct": round(away_wins / total * 100, 1),
    }