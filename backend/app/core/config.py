import os
from dotenv import load_dotenv

load_dotenv()

API_FOOTBALL_KEY = os.getenv("API_FOOTBALL_KEY")
BASE_URL = "https://v3.football.api-sports.io"
DATABASE_URL = "sqlite:///./app.db"
SEASONS = [2025]
CURRENT_SEASON = 2025
#Ligas:
# - 39: Premier leage
# - 61: Ligue 1
# - 71: Serie A Brasil
# - 78: Bundesliga
# - 135: Seria A Italia
# - 140: La Liga EA Sports
# - 141: La Liga Hypermotion
LEAGUES = [39, 61, 135, 140, 141]
# LEAGUES = [78]
