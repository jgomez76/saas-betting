from app.models.league_season import LeagueSeason
from app.services.api_football import get_leagues
from app.core.config import LEAGUES_ALL


def get_current_season_db(
    db,
    league_id: int
):
    row = (
        db.query(LeagueSeason)
        .filter(
            LeagueSeason.league_id == league_id
        )
        .first()
    )

    return row.season if row else None


def update_league_seasons(db):

    data = get_leagues()

    for item in data.get("response", []):

        league_id = item["league"]["id"]

        # Solo nuestras ligas
        found = False

        for leagues in LEAGUES_ALL.values():
            if league_id in leagues:
                found = True
                break

        if not found:
            continue

        current_season = None

        for season in item.get("seasons", []):

            if season.get("current") is True:
                current_season = season["year"]
                break

        if not current_season:
            continue

        row = (
            db.query(LeagueSeason)
            .filter(
                LeagueSeason.league_id == league_id
            )
            .first()
        )

        if row:
            row.season = current_season
        else:
            db.add(
                LeagueSeason(
                    league_id=league_id,
                    season=current_season
                )
            )

    db.commit()

def get_current_season_dynamic(
    db,
    league_id: int
):
    row = (
        db.query(LeagueSeason)
        .filter(
            LeagueSeason.league_id == league_id
        )
        .first()
    )

    if row:
        return row.season

    return None