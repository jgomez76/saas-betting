from app.core.database import SessionLocal
from app.models.league_season import LeagueSeason

db = SessionLocal()

rows = (
    db.query(LeagueSeason)
    .order_by(LeagueSeason.league_id)
    .all()
)

output = []

output.append("CURRENT_SEASON_BY_LEAGUE = {\n")

for row in rows:
    output.append(
        f"    {row.league_id}: {row.season},\n"
    )

output.append("}\n")

with open(
    "app/core/league_seasons_cache.py",
    "w"
) as f:
    f.writelines(output)

print("league_seasons_cache.py generated")