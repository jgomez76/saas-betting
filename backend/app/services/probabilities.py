import random
from app.services.stats import get_team_stats, get_team_stats_split, get_recent_stats

def calculate_match_probabilities(db, home_team: str, away_team: str):
    home_stats = get_team_stats(db, home_team)
    away_stats = get_team_stats(db, away_team)

    if not home_stats or not away_stats:
        return None

    # fuerza ofensiva (mínimo 0.1 para evitar negativos)

    ## Paso 3, Home/Away Split
    # home_attack = max(home_stats["avg_goals_scored"], 0.1)
    # away_attack = max(away_stats["avg_goals_scored"], 0.1)

    # home_defense = max(home_stats["avg_goals_conceded"], 0.1)
    # away_defense = max(away_stats["avg_goals_conceded"], 0.1)
    home_split = get_team_stats_split(db, home_team)
    away_split = get_team_stats_split(db, away_team)

    # -------------------------
    # ATTACK
    # -------------------------
    ## Paso 4 , forma reciente

    # home_attack = max(
    #     home_split["home_scored_avg"]
    #     if home_split["home_scored_avg"] is not None
    #     else home_stats["avg_goals_scored"],
    #     0.1
    # )

    # away_attack = max(
    #     away_split["away_scored_avg"]
    #     if away_split["away_scored_avg"] is not None
    #     else away_stats["avg_goals_scored"],
    #     0.1
    # )

    # # -------------------------
    # # DEFENSE
    # # -------------------------
    # home_defense = max(
    #     home_split["home_conceded_avg"]
    #     if home_split["home_conceded_avg"] is not None
    #     else home_stats["avg_goals_conceded"],
    #     0.1
    # )

    # away_defense = max(
    #     away_split["away_conceded_avg"]
    #     if away_split["away_conceded_avg"] is not None
    #     else away_stats["avg_goals_conceded"],
    #     0.1
    # )
    # ## Fin paso 3

        # 🔥 RECENT FORM
    home_recent = get_recent_stats(db, home_team)
    away_recent = get_recent_stats(db, away_team)

    # PESOS
    SEASON_WEIGHT = 0.7
    RECENT_WEIGHT = 0.3

    # -------------------------
    # ATTACK
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

    # aplicar forma reciente
    if home_recent:
        home_attack = (
            home_attack_base * SEASON_WEIGHT +
            home_recent["scored_avg"] * RECENT_WEIGHT
        )
    else:
        home_attack = home_attack_base

    if away_recent:
        away_attack = (
            away_attack_base * SEASON_WEIGHT +
            away_recent["scored_avg"] * RECENT_WEIGHT
        )
    else:
        away_attack = away_attack_base

    # -------------------------
    # DEFENSE
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

    if home_recent:
        home_defense = (
            home_defense_base * SEASON_WEIGHT +
            home_recent["conceded_avg"] * RECENT_WEIGHT
        )
    else:
        home_defense = home_defense_base

    if away_recent:
        away_defense = (
            away_defense_base * SEASON_WEIGHT +
            away_recent["conceded_avg"] * RECENT_WEIGHT
        )
    else:
        away_defense = away_defense_base

    # seguridad mínima
    home_attack = max(home_attack, 0.1)
    away_attack = max(away_attack, 0.1)
    home_defense = max(home_defense, 0.1)
    away_defense = max(away_defense, 0.1)

    ## Fin paso 4

    # expected goals simples
    home_xg = home_attack * away_defense
    away_xg = away_attack * home_defense

    total_xg = home_xg + away_xg

    if total_xg == 0:
        return None

    # base probabilidades
    home_prob = home_xg / total_xg
    away_prob = away_xg / total_xg

    # empate fijo
    draw_prob = 0.25
    remaining = 1 - draw_prob

    home_prob *= remaining
    away_prob *= remaining

    return {
        "home_win_prob": round(home_prob, 2),
        "draw_prob": draw_prob,
        "away_win_prob": round(away_prob, 2),

        "home_odds": round(1 / home_prob, 2) if home_prob > 0 else None,
        "draw_odds": round(1 / draw_prob, 2),
        "away_odds": round(1 / away_prob, 2) if away_prob > 0 else None,
    }

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

def calculate_extra_markets(home_stats, away_stats):
    avg_goals = home_stats["avg_goals_scored"] + away_stats["avg_goals_scored"]

    # Over 2.5 simple
    over25_prob = min(avg_goals / 3, 0.9)
    under25_prob = 1 - over25_prob

    # BTTS simple
    btts_prob = (home_stats["btts_percentage"] + away_stats["btts_percentage"]) / 200
    no_btts_prob = 1 - btts_prob

    return {
        "over25_prob": round(over25_prob, 2),
        "under25_prob": round(under25_prob, 2),
        "btts_yes_prob": round(btts_prob, 2),
        "btts_no_prob": round(no_btts_prob, 2),
    }