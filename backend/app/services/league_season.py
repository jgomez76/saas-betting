from app.core.config import LEAGUES_AMERICA


def get_season(league_id: int):

    if league_id in LEAGUES_AMERICA:
        return 2026

    return 2025