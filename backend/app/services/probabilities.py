from app.services.stats import get_team_stats

def calculate_match_probabilities(db, home_team: str, away_team: str):
    home_stats = get_team_stats(db, home_team)
    away_stats = get_team_stats(db, away_team)

    if not home_stats or not away_stats:
        return None

    # ⚽ estimación básica
    home_strength = home_stats["avg_goals_scored"] - home_stats["avg_goals_conceded"]
    away_strength = away_stats["avg_goals_scored"] - away_stats["avg_goals_conceded"]

    total = home_strength + away_strength

    if total == 0:
        return None

    # home_prob = home_strength / total
    # away_prob = away_strength / total
    # draw_prob = 1 - (home_prob + away_prob)

# base empate realista
    draw_prob = 0.25

    # redistribuir el resto
    remaining = 1 - draw_prob

    home_prob = (home_strength / total) * remaining
    away_prob = (away_strength / total) * remaining

    return {
        "home_win_prob": round(home_prob, 2),
        "draw_prob": round(draw_prob, 2),
        "away_win_prob": round(away_prob, 2),

        "home_odds": round(1 / home_prob, 2) if home_prob > 0 else None,
        "draw_odds": round(1 / draw_prob, 2) if draw_prob > 0 else None,
        "away_odds": round(1 / away_prob, 2) if away_prob > 0 else None,
    }