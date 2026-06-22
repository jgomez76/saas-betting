from app.core.config import get_current_season


def get_season(league_id: int):
    return get_current_season(league_id)