from sqlalchemy.orm import Session
from app.models.fixture import Fixture
from app.models.standings import Standings


def build_standings(db: Session):
    db.query(Standings).delete()
    db.commit()

    print("🏆 Generando standings desde fixtures...")

    # 🔥 solo partidos finalizados
    matches = db.query(Fixture).filter(
        Fixture.status.in_(["FT", "AET", "PEN"])
    ).all()

    table = {}

    for m in matches:

        league = m.league_id

        if league not in table:
            table[league] = {}

        for team in [m.home_team, m.away_team]:

            if team not in table[league]:
                table[league][team] = {
                    "points": 0,
                    "played": 0
                }

        # partidos jugados
        table[league][m.home_team]["played"] += 1
        table[league][m.away_team]["played"] += 1

        # puntos
        if m.home_goals > m.away_goals:
            table[league][m.home_team]["points"] += 3
        elif m.home_goals < m.away_goals:
            table[league][m.away_team]["points"] += 3
        else:
            table[league][m.home_team]["points"] += 1
            table[league][m.away_team]["points"] += 1

    # -------------------------
    # 🏆 ORDENAR Y GUARDAR
    # -------------------------

    for league_id, teams in table.items():

        sorted_teams = sorted(
            teams.items(),
            key=lambda x: x[1]["points"],
            reverse=True
        )

        for pos, (team, data) in enumerate(sorted_teams, start=1):

            existing = db.query(Standings).filter(
                Standings.team == team,
                Standings.league_id == league_id
            ).first()

            if existing:
                existing.position = pos
                existing.points = data["points"]
            else:
                db.add(Standings(
                    league_id=league_id,
                    team=team,
                    position=pos,
                    points=data["points"]
                ))

    db.commit()

    print("✅ Standings generados")