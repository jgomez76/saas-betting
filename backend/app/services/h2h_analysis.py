from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app.models.fixture import Fixture


FINISHED_STATUSES = {
    "FT",
    "AET",
    "PEN",
}


def get_h2h_analysis(
    db: Session,
    team1: str,
    team2: str,
):

    matches = db.query(Fixture).filter(

        or_(

            and_(
                Fixture.home_team == team1,
                Fixture.away_team == team2,
            ),

            and_(
                Fixture.home_team == team2,
                Fixture.away_team == team1,
            ),
        )

    ).filter(

        Fixture.status.in_(
            FINISHED_STATUSES
        )

    ).order_by(
        Fixture.date.desc()
    ).all()

    if not matches:
        return None

    team1_wins = 0
    team2_wins = 0
    draws = 0

    btts = 0
    over25 = 0

    total_goals = 0

    recent_matches = []

    for match in matches:

        home_goals = match.home_goals
        away_goals = match.away_goals

        total_goals += (
            home_goals +
            away_goals
        )

        # ---------------- RESULTS

        if home_goals == away_goals:

            draws += 1

        else:

            winner = (
                match.home_team
                if home_goals > away_goals
                else match.away_team
            )

            if winner == team1:
                team1_wins += 1
            else:
                team2_wins += 1

        # ---------------- BTTS

        if (
            home_goals > 0 and
            away_goals > 0
        ):
            btts += 1

        # ---------------- OVER 2.5

        if (
            home_goals +
            away_goals
        ) >= 3:
            over25 += 1

        # ---------------- RECENT

        recent_matches.append({

            "date": match.date.strftime(
                "%Y-%m-%d"
            ),

            "home_team": match.home_team,
            "away_team": match.away_team,

            "home_goals": home_goals,
            "away_goals": away_goals,
        })

    total_matches = len(matches)

    return {

        "team1": team1,
        "team2": team2,

        "matches": total_matches,

        "team1_wins": team1_wins,
        "team2_wins": team2_wins,
        "draws": draws,

        "btts": round(
            (btts / total_matches) * 100,
            1
        ),

        "over25": round(
            (over25 / total_matches) * 100,
            1
        ),

        "avg_goals": round(
            total_goals / total_matches,
            2
        ),

        "recent_matches": recent_matches[:10],
    }