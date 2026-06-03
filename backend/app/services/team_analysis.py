from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.fixture import Fixture


FINISHED_STATUSES = {
    "FT",
    "AET",
    "PEN",
}


def get_team_analysis(
    db: Session,
    team: str,
    season: int | None = None,
):

    query = db.query(Fixture).filter(
        or_(
            Fixture.home_team == team,
            Fixture.away_team == team,
        )
    )

    # 🔥 SOLO FINALIZADOS
    query = query.filter(
        Fixture.status.in_(FINISHED_STATUSES)
    )

    # 🔥 TEMPORADA
    if season:
        query = query.filter(
            Fixture.season == season
        )

    # matches = query.all()
    matches = sorted(
        query.all(),
        key=lambda x: x.date
    )

    if not matches:
        return None

    wins = 0
    draws = 0
    losses = 0

    goals_scored = 0
    goals_conceded = 0

    clean_sheets = 0

    btts = 0
    over25 = 0
    over35 = 0

    home_matches = 0
    away_matches = 0

    home_wins = 0
    away_wins = 0

    home_goals_scored = 0
    away_goals_scored = 0

    home_goals_conceded = 0
    away_goals_conceded = 0

    home_btts = 0
    away_btts = 0

    home_over25 = 0
    away_over25 = 0

    last_5 = []
    goals_timeline = []

    # 🔥 ordenar recientes
    matches_sorted = sorted(
        matches,
        key=lambda x: x.date,
        reverse=True
    )

    for match in matches:
        
        is_home = (
            match.home_team == team
        )

        scored = (
            match.home_goals
            if is_home
            else match.away_goals
        )

        conceded = (
            match.away_goals
            if is_home
            else match.home_goals
        )

        goals_timeline.append({
            "date": match.date.strftime("%Y-%m-%d"),

            "home_team": match.home_team,
            "away_team": match.away_team,

            "home_goals": match.home_goals,
            "away_goals": match.away_goals,

            "league": match.league,

            "scored": scored,
            "conceded": conceded,
        })

        goals_scored += scored
        goals_conceded += conceded

        # RESULTADOS
        if scored > conceded:
            wins += 1

        elif scored < conceded:
            losses += 1

        else:
            draws += 1

        # CLEAN SHEET
        if conceded == 0:
            clean_sheets += 1

        # BTTS
        if (
            match.home_goals > 0 and
            match.away_goals > 0
        ):
            btts += 1

        # OVERS
        total_goals = (
            match.home_goals +
            match.away_goals
        )

        if total_goals >= 3:
            over25 += 1

        if total_goals >= 4:
            over35 += 1

        # HOME / AWAY
        if is_home:
            home_matches += 1
        else:
            away_matches += 1

        # HOME / AWAY SPLITS

        if is_home:

            home_goals_scored += scored
            home_goals_conceded += conceded

            if scored > conceded:
                home_wins += 1

            if (
                match.home_goals > 0 and
                match.away_goals > 0
            ):
                home_btts += 1

            if total_goals >= 3:
                home_over25 += 1

        else:

            away_goals_scored += scored
            away_goals_conceded += conceded

            if scored > conceded:
                away_wins += 1

            if (
                match.home_goals > 0 and
                match.away_goals > 0
            ):
                away_btts += 1

            if total_goals >= 3:
                away_over25 += 1    

    # 🔥 LAST 5
    for match in matches_sorted[:5]:

        is_home = (
            match.home_team == team
        )

        scored = (
            match.home_goals
            if is_home
            else match.away_goals
        )

        conceded = (
            match.away_goals
            if is_home
            else match.home_goals
        )

        if scored > conceded:
            last_5.append("W")

        elif scored < conceded:
            last_5.append("L")

        else:
            last_5.append("D")

    total = len(matches)

    return {

        "team": team,

        "season": season,

        "matches": total,

        "wins": wins,
        "draws": draws,
        "losses": losses,

        "goals_scored": goals_scored,
        "goals_conceded": goals_conceded,
        "goals_timeline": goals_timeline,

        "avg_goals_scored": round(
            goals_scored / total,
            2
        ),

        "avg_goals_conceded": round(
            goals_conceded / total,
            2
        ),

        "clean_sheets": round(
            (clean_sheets / total) * 100,
            1
        ),

        "btts": round(
            (btts / total) * 100,
            1
        ),

        "over25": round(
            (over25 / total) * 100,
            1
        ),

        "over35": round(
            (over35 / total) * 100,
            1
        ),

        "home_matches": home_matches,
        "away_matches": away_matches,

        "last_5": "".join(reversed(last_5)),

        "home": {

            "matches": home_matches,

            "wins": home_wins,

            "goals_scored": home_goals_scored,
            "goals_conceded": home_goals_conceded,

            "btts": round(
                (home_btts / home_matches) * 100,
                1
            ) if home_matches else 0,

            "over25": round(
                (home_over25 / home_matches) * 100,
                1
            ) if home_matches else 0,
        },

        "away": {

            "matches": away_matches,

            "wins": away_wins,

            "goals_scored": away_goals_scored,
            "goals_conceded": away_goals_conceded,

            "btts": round(
                (away_btts / away_matches) * 100,
                1
            ) if away_matches else 0,

            "over25": round(
                (away_over25 / away_matches) * 100,
                1
            ) if away_matches else 0,
        },
    }