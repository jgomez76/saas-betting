import random
import math

from app.services.stats import (
    get_team_stats,
    get_team_stats_split,
    get_recent_stats
)

from app.services.injuries import get_team_injuries_impact
from app.services.context import (
    get_team_position,
    get_rest_days,
    get_team_motivation
)


def calculate_match_probabilities(db, home_team: str, away_team: str, fixture_id: int, league_id: int):

    home_stats = get_team_stats(db, home_team)
    away_stats = get_team_stats(db, away_team)

    if not home_stats or not away_stats:
        return None

    home_split = get_team_stats_split(db, home_team)
    away_split = get_team_stats_split(db, away_team)

    home_recent = get_recent_stats(db, home_team)
    away_recent = get_recent_stats(db, away_team)

    # -------------------------
    # ⚖️ PESOS
    # -------------------------
    SEASON_WEIGHT = 0.8
    RECENT_WEIGHT = 0.2

    # -------------------------
    # ATTACK BASE
    # -------------------------
    home_attack_base = (
        home_split["home_scored_avg"]
        if home_split["home_scored_avg"] is not None
        else home_stats["avg_goals_scored"]
    )

    away_attack_base = (
        away_split["away_scored_avg"]
        if away_split["away_scored_avg"] is not None
        else away_stats["avg_goals_scored"]
    )

    home_attack = home_attack_base
    away_attack = away_attack_base

    if home_recent:
        home_attack = (
            home_attack_base * SEASON_WEIGHT +
            home_recent["scored_avg"] * RECENT_WEIGHT
        )

    if away_recent:
        away_attack = (
            away_attack_base * SEASON_WEIGHT +
            away_recent["scored_avg"] * RECENT_WEIGHT
        )

    # -------------------------
    # DEFENSE BASE
    # -------------------------
    home_defense_base = (
        home_split["home_conceded_avg"]
        if home_split["home_conceded_avg"] is not None
        else home_stats["avg_goals_conceded"]
    )

    away_defense_base = (
        away_split["away_conceded_avg"]
        if away_split["away_conceded_avg"] is not None
        else away_stats["avg_goals_conceded"]
    )

    home_defense = home_defense_base
    away_defense = away_defense_base

    if home_recent:
        home_defense = (
            home_defense_base * SEASON_WEIGHT +
            home_recent["conceded_avg"] * RECENT_WEIGHT
        )

    if away_recent:
        away_defense = (
            away_defense_base * SEASON_WEIGHT +
            away_recent["conceded_avg"] * RECENT_WEIGHT
        )

    # -------------------------
    # 🧯 LIMITES INICIALES
    # -------------------------
    def clamp(v):
        return min(max(v, 0.2), 3.0)

    home_attack = clamp(home_attack)
    away_attack = clamp(away_attack)
    home_defense = clamp(home_defense)
    away_defense = clamp(away_defense)

    # -------------------------
    # 🏥 INJURIES
    # -------------------------
    home_injuries = get_team_injuries_impact(db, home_team, fixture_id)
    away_injuries = get_team_injuries_impact(db, away_team, fixture_id)

    def apply_impact(value, impact):
        impact = max(min(impact, 0.2), -0.2)
        return value * (1 + impact)

    home_attack = apply_impact(home_attack, home_injuries["attack_impact"])
    away_attack = apply_impact(away_attack, away_injuries["attack_impact"])

    home_defense = apply_impact(home_defense, home_injuries["defense_impact"])
    away_defense = apply_impact(away_defense, away_injuries["defense_impact"])

    # -------------------------
    # 🏆 STANDINGS IMPACT
    # -------------------------
    home_pos = get_team_position(db, home_team, league_id)
    away_pos = get_team_position(db, away_team, league_id)

    if home_pos and away_pos:

        diff = away_pos - home_pos  # positivo = home mejor

        factor = max(min(diff * 0.01, 0.08), -0.08)

        home_attack *= (1 + factor)
        away_attack *= (1 - factor)

        home_defense *= (1 - factor * 0.5)
        away_defense *= (1 + factor * 0.5)

    # -------------------------
    # 💤 REST DAYS
    # -------------------------
    home_rest = get_rest_days(db, home_team, fixture_id)
    away_rest = get_rest_days(db, away_team, fixture_id)

    def rest_factor(days):
        if days is None:
            return 1
        if days <= 2:
            return 0.96
        if days >= 6:
            return 1.03
        return 1

    rf_home = rest_factor(home_rest)
    rf_away = rest_factor(away_rest)

    home_attack *= rf_home
    away_attack *= rf_away

    home_defense *= rf_home
    away_defense *= rf_away

    # -------------------------
    # 🔥 MOTIVATION (SUAVE)
    # -------------------------
    home_mot = get_team_motivation(home_pos)
    away_mot = get_team_motivation(away_pos)

    home_attack *= (1 + (home_mot - 1) * 0.5)
    away_attack *= (1 + (away_mot - 1) * 0.5)

    home_defense *= (1 - (home_mot - 1) * 0.3)
    away_defense *= (1 - (away_mot - 1) * 0.3)

    # -------------------------
    # 🧯 RE-CAP FINAL
    # -------------------------
    home_attack = clamp(home_attack)
    away_attack = clamp(away_attack)
    home_defense = clamp(home_defense)
    away_defense = clamp(away_defense)

    # -------------------------
    # ⚽ EXPECTED GOALS
    # -------------------------
    home_xg = min(home_attack * away_defense, 3.5)
    away_xg = min(away_attack * home_defense, 3.5)

    total_xg = home_xg + away_xg

    if total_xg == 0:
        return None

    # -------------------------
    # 🎯 PROBABILIDADES BASE
    # -------------------------
    home_prob = home_xg / total_xg
    away_prob = away_xg / total_xg

    # -------------------------
    # 🤝 EMPATE DINÁMICO
    # -------------------------
    diff = abs(home_xg - away_xg)

    draw_prob = 0.28 - (diff * 0.08)
    draw_prob = max(min(draw_prob, 0.30), 0.18)

    remaining = 1 - draw_prob

    home_prob *= remaining
    away_prob *= remaining

    # -------------------------
    # ⚖️ NORMALIZACIÓN
    # -------------------------
    total = home_prob + away_prob + draw_prob

    home_prob /= total
    away_prob /= total
    draw_prob /= total

    # -------------------------
    # 🎯 OUTPUT
    # -------------------------
    return {
        "home_win_prob": round(home_prob, 3),
        "draw_prob": round(draw_prob, 3),
        "away_win_prob": round(away_prob, 3),

        "home_odds": round(1 / home_prob, 2) if home_prob > 0 else None,
        "draw_odds": round(1 / draw_prob, 2),
        "away_odds": round(1 / away_prob, 2) if away_prob > 0 else None,
    }


# -------------------------
# 🎲 BOOKMAKER SIMULATION
# -------------------------
def add_bookmaker_odds(probabilities: dict):
    def safe_odds(odd):
        if odd is None:
            return None
        return round(odd * random.uniform(0.95, 1.05), 2)

    return {
        "home_odds_book": safe_odds(probabilities.get("home_odds")),
        "draw_odds_book": safe_odds(probabilities.get("draw_odds")),
        "away_odds_book": safe_odds(probabilities.get("away_odds")),
    }


# -------------------------
# 📊 POISSON
# -------------------------
def poisson_prob(lmbda, k):
    return (lmbda ** k * math.exp(-lmbda)) / math.factorial(k)


def calculate_extra_markets(home_stats, away_stats):

    total_xg = home_stats["avg_goals_scored"] + away_stats["avg_goals_scored"]

    probs = [poisson_prob(total_xg, k) for k in range(6)]

    p0, p1, p2, p3 = probs[:4]

    over15 = 1 - (p0 + p1)
    over25 = 1 - (p0 + p1 + p2)
    over35 = 1 - (p0 + p1 + p2 + p3)

    under15 = 1 - over15
    under25 = 1 - over25
    under35 = 1 - over35

    btts = min(
        (home_stats["btts_percentage"] + away_stats["btts_percentage"]) / 200,
        0.9
    )

    return {
        "over15_prob": round(over15, 2),
        "under15_prob": round(under15, 2),

        "over25_prob": round(over25, 2),
        "under25_prob": round(under25, 2),

        "over35_prob": round(over35, 2),
        "under35_prob": round(under35, 2),

        "btts_yes_prob": round(btts, 2),
        "btts_no_prob": round(1 - btts, 2),
    }