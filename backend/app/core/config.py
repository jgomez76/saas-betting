import os
from dotenv import load_dotenv

load_dotenv()

API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY")
BASE_URL = "https://v3.football.api-sports.io"
DATABASE_URL = "sqlite:///./app.db"
SEASONS = [2025]
CURRENT_SEASON = 2025
#Ligas:
# - 39: Premier League
# - 61: Ligue 1
### - 71: Serie A Brasil
# - 78: Bundesliga
# - 135: Seria A Italia
# - 140: La Liga EA Sports
# - 141: La Liga Hypermotion
# - 2: Champions League
# - 3: Europa League
# - 848 - Conference League 
LEAGUES = [2, 3, 39, 61, 78, 135, 140, 141, 848]
# LEAGUES = [78]
SELECTED_LEAGUES = [39, 61, 78, 135, 140, 141]

