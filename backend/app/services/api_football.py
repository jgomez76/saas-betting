import requests
from app.core.config import API_FOOTBALL_KEY, BASE_URL

headers = {
    "x-apisports-key": API_FOOTBALL_KEY
}

def get_fixtures():
    url = f"{BASE_URL}/fixtures?league=39&season=2023"
    response = requests.get(url, headers=headers)
    return response.json()