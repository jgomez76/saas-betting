def calculate_value(probability: float, bookmaker_odds: float):
    return round((probability * bookmaker_odds) - 1, 3)

def detect_value(probabilities: dict, bookmaker: dict):
    return {
        "home_value": calculate_value(probabilities["home_win_prob"], bookmaker["home_odds_book"]),
        "draw_value": calculate_value(probabilities["draw_prob"], bookmaker["draw_odds_book"]),
        "away_value": calculate_value(probabilities["away_win_prob"], bookmaker["away_odds_book"]),
    }