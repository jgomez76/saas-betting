import requests
from sqlalchemy.orm import Session
from app.models.injury import Injury
from app.core.config import API_FOOTBALL_KEY


# -----------------------------
# FETCH DESDE API
# -----------------------------
def fetch_injuries(db: Session, league: int, season: int):
    url = "https://v3.football.api-sports.io/injuries"

    headers = {
        "x-apisports-key": API_FOOTBALL_KEY
    }

    params = {
        "league": league,
        "season": season
    }

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    # 🔥 limpiar solo esa liga
    db.query(Injury).filter(Injury.league_id == league).delete()
    db.commit()

    for item in data.get("response", []):

        player_data = item.get("player", {})
        team_data = item.get("team", {})
        fixture_data = item.get("fixture", {})

        player_id = player_data.get("id")
        player = player_data.get("name")
        team = team_data.get("name")
        fixture_id = fixture_data.get("id")

        reason = player_data.get("reason", "")
        type_ = player_data.get("type", "")

        # 🚨 VALIDACIÓN
        if not player_id or not player or not team or not fixture_id:
            continue

        db.add(Injury(
            player_id=player_id,
            player=str(player).strip(),
            team=str(team).strip(),
            reason=reason,
            type=type_,
            league_id=league,
            fixture_id=fixture_id
        ))

    db.commit()


# -----------------------------
# JUGADORES NO DISPONIBLES
# -----------------------------
def get_unavailable_players(db: Session, team: str, fixture_id: int):
    return db.query(Injury).filter(
        Injury.team == team,
        Injury.fixture_id == fixture_id
    ).all()


# -----------------------------
# IMPACTO EN MODELO
# -----------------------------
# def get_team_injuries_impact(db: Session, team: str, fixture_id: int):

#     injuries = get_unavailable_players(db, team, fixture_id)

#     if not injuries:
#         return {
#             "attack_impact": 0,
#             "defense_impact": 0
#         }

#     attack_impact = 0
#     defense_impact = 0

#     for inj in injuries:
#         if not inj.player:
#             continue

#         name = inj.player.lower()

#         # lógica básica (mejoraremos luego)
#         if any(x in name for x in ["st", "fw", "wing"]):
#             attack_impact -= 0.05

#         elif any(x in name for x in ["cb", "back", "def"]):
#             defense_impact += 0.05

#     # límites
#     attack_impact = max(attack_impact, -0.3)
#     defense_impact = min(defense_impact, 0.3)

#     return {
#         "attack_impact": attack_impact,
#         "defense_impact": defense_impact
#     }


def get_team_injuries_impact(db: Session, team: str, fixture_id: int):

    injuries = get_unavailable_players(db, team, fixture_id)

    if not injuries:
        return {
            "attack_impact": 0,
            "defense_impact": 0
        }

    attack_impact = 0
    defense_impact = 0

    for inj in injuries:
        name = inj.player.lower()

        # 🔥 TOP PLAYERS (puedes ampliar esto)
        if any(x in name for x in ["mbappe", "vinicius", "lewandowski", "griezmann"]):
            attack_impact -= 0.12
            continue

        # 🧠 ATAQUE
        if any(x in name for x in ["fw", "st", "wing"]):
            attack_impact -= 0.05

        # 🛡 DEFENSA
        elif any(x in name for x in ["cb", "back", "def"]):
            defense_impact += 0.05

        # 🧩 NEUTRAL (centrocampistas)
        else:
            attack_impact -= 0.02
            defense_impact += 0.02

    # límites
    attack_impact = max(attack_impact, -0.4)
    defense_impact = min(defense_impact, 0.4)

    return {
        "attack_impact": attack_impact,
        "defense_impact": defense_impact
    }