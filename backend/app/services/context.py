from datetime import datetime, timedelta
from app.models.fixture import Fixture
from app.models.standings import Standings

def get_team_form_score(db, team: str):
    matches = (
        db.query(Fixture)
        .filter(
            ((Fixture.home_team == team) | (Fixture.away_team == team)),
            Fixture.status == "FT"
        )
        .order_by(Fixture.date.desc())
        .limit(5)
        .all()
    )

    if not matches:
        return 0.5

    points = 0

    for m in matches:
        if m.home_team == team:
            if m.home_goals > m.away_goals:
                points += 3
            elif m.home_goals == m.away_goals:
                points += 1
        else:
            if m.away_goals > m.home_goals:
                points += 3
            elif m.away_goals == m.home_goals:
                points += 1

    # normalizar (máx 15 puntos)
    form_score = points / 15

    # 🔥 convertir a motivación
    if form_score < 0.3:
        return 1.0  # equipo en crisis → máxima motivación
    elif form_score < 0.5:
        return 0.8
    elif form_score < 0.7:
        return 0.6
    else:
        return 0.4  # equipo cómodo


def get_rest_days(db, team: str, match_date):
    last_match = (
        db.query(Fixture)
        .filter(
            ((Fixture.home_team == team) | (Fixture.away_team == team)),
            Fixture.date < match_date,
            Fixture.status == "FT"
        )
        .order_by(Fixture.date.desc())
        .first()
    )

    if not last_match:
        return 7

    return (match_date - last_match.date).days

def adjust_probabilities(db, home_team, away_team, match_date, home_prob, draw_prob, away_prob):

    home_rest = get_rest_days(db, home_team, match_date)
    away_rest = get_rest_days(db, away_team, match_date)

    home_mot = get_team_motivation(db, home_team)
    away_mot = get_team_motivation(db, away_team)

    # -------------------------
    # FACTORES
    # -------------------------

    # ⏱️ descanso
    rest_diff = home_rest - away_rest
    rest_factor = rest_diff * 0.015

    # 🔥 motivación
    mot_diff = home_mot - away_mot
    mot_factor = mot_diff * 0.05

    total_adj = rest_factor + mot_factor

    # -------------------------
    # APLICAR
    # -------------------------
    home_prob += total_adj
    away_prob -= total_adj

    # límites
    home_prob = max(home_prob, 0.05)
    away_prob = max(away_prob, 0.05)

    # recalcular empate
    draw_prob = 1 - (home_prob + away_prob)
    draw_prob = max(draw_prob, 0.1)

    # normalizar
    total = home_prob + draw_prob + away_prob

    home_prob /= total
    draw_prob /= total
    away_prob /= total

    return home_prob, draw_prob, away_prob

def get_team_position(db, team, league_id):
    s = db.query(Standings).filter(
        Standings.team == team,
        Standings.league_id == league_id
    ).first()

    return s.position if s else None


def get_rest_days(db, team: str, current_fixture_id: int):

    match = db.query(Fixture).filter(Fixture.api_id == current_fixture_id).first()
    if not match:
        return None

    prev_match = (
        db.query(Fixture)
        .filter(
            ((Fixture.home_team == team) | (Fixture.away_team == team)),
            Fixture.date < match.date,
            Fixture.status.in_(["FT", "AET", "PEN"])
        )
        .order_by(Fixture.date.desc())
        .first()
    )

    if not prev_match:
        return None

    diff = match.date - prev_match.date
    return diff.days

def get_team_motivation(position: int, total_teams: int = 20):

    if not position:
        return 1

    # 🏆 pelea por título / champions
    if position <= 4:
        return 1.05

    # ⚔️ europa
    if position <= 7:
        return 1.03

    # 🧊 tierra de nadie
    if 8 <= position <= 14:
        return 0.96

    # 🔥 descenso
    if position >= total_teams - 3:
        return 1.06

    return 1