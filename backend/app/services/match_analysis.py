from sqlalchemy.orm import Session

from app.services.team_analysis import (
    get_team_analysis
)

from app.services.h2h_analysis import (
    get_h2h_analysis
)

from app.models.value_bet import ValueBet


def consecutive_true(values):

    streak = 0

    for v in values:

        if v:
            streak += 1
        else:
            break

    return streak


def get_match_analysis(
    db: Session,
    home_team: str,
    away_team: str,
):

    # ---------------- TEAM ANALYSIS

    home = get_team_analysis(
        db=db,
        team=home_team,
    )

    away = get_team_analysis(
        db=db,
        team=away_team,
    )

    if not home or not away:
        return None

    # ---------------- H2H

    h2h = get_h2h_analysis(
        db=db,
        team1=home_team,
        team2=away_team,
    )

    # ---------------- VALUE BET DATA

    value_bet = db.query(ValueBet).filter(

        ValueBet.home_team == home_team,
        ValueBet.away_team == away_team,

    ).first()

    # ---------------- COMBINED

    combined_btts = round(

        (
            home["home"]["btts"] +
            away["away"]["btts"]
        ) / 2,

        1
    )

    combined_over25 = round(

        (
            home["home"]["over25"] +
            away["away"]["over25"]
        ) / 2,

        1
    )

    # ---------------- STREAKS

    home_winning_streak = consecutive_true(

        [
            m == "W"
            for m in home["last_5"]
        ]

    )

    away_winning_streak = consecutive_true(

        [
            m == "W"
            for m in away["last_5"]
        ]

    )

    # ---------------- INSIGHTS


    insights = []

    def add_insight(
        score: int,
        type_: str,
        subtype: str,
        data: dict,
    ):

        insights.append({

            "score": score,
            "type": type_,
            "subtype": subtype,

            "priority": (

                "high"

                if score >= 90
                else "medium"

                if score >= 70
                else "low"

            ),

            "category": type_,
            "data": data,

        })

    # HOME ATTACK

    if home["avg_goals_scored"] >= 1.4:

        add_insight(

            90,

            "attack",

            "home_scoring",

            {

                "team": home_team,

                "avg_goals": home["avg_goals_scored"],

            }

        )

    # AWAY DEFENSE

    if away["avg_goals_conceded"] >= 1.3:

        add_insight(

            85,

            "defence",

            "away_conceding",

            {

                "team": away_team,

                "avg_goals": away["avg_goals_conceded"],

            }

        )

    # HOME OVER

    if home["home"]["over25"] >= 55:

        add_insight(

            80,

            "market",

            "home_over25",

            {

                "team": home_team,

                "over25": home["home"]["over25"],

            }

        )

    # AWAY BTTS

    if away["away"]["btts"] >= 55:

        add_insight(

            80,

            "market",

            "away_btts",

            {

                "team": away_team,

                "btts": away["away"]["btts"],

            }

        )

    # H2H OVER

    if h2h and h2h["over25"] >= 60:

        add_insight(

            75,

            "h2h",

            "over25",

            {

                "over25": h2h["over25"],

            }

        )

    # H2H BTTS

    if h2h and h2h["btts"] >= 60:

        add_insight(

            75,

            "h2h",

            "btts",

            {

                "btts": h2h["btts"],

            }

        )

    # STRONG OVER TREND

    if combined_over25 >= 60:

        add_insight(

            95,

            "composite",

            "combined_over25",

            {

                "combined_over25": combined_over25,

                "h2h_over25": (
                    h2h["over25"]
                    if h2h
                    else None
                ),

            }

        )

    # STRONG BTTS TREND

    if combined_btts >= 55:

        add_insight(

            95,

            "composite",

            "combined_btts",

            {

                "combined_btts": combined_btts,

                "h2h_btts": (

                    h2h["btts"]

                    if h2h

                    else None

                ),

            }

        )

    # HOME WINNING STREAK

    if home_winning_streak >= 3:

        add_insight(

            88,

            "streak",

            "home_winning",

            {

                "team": home_team,

                "matches": home_winning_streak,

            }

        )

    # AWAY WINNING STREAK

    if away_winning_streak >= 3:

        add_insight(

            88,

            "streak",

            "away_winning",

            {

                "team": away_team,

                "matches": away_winning_streak,

            }

        )

    # ---------------- CONFIDENCE ENGINE

    markets = []

    value_opportunities = []

    # =========================================================
    # OVER 2.5
    # =========================================================

    over25_confidence = round(

        (
            combined_over25 +

            (h2h["over25"] if h2h else 0)

        ) / 2,

        1
    )

    if over25_confidence >= 80:
        strength = "VERY STRONG"

    elif over25_confidence >= 65:
        strength = "STRONG"

    elif over25_confidence >= 55:
        strength = "MEDIUM"

    else:
        strength = "LOW"

    markets.append({

        "market": "Over 2.5",

        "confidence": over25_confidence,

        "strength": strength,
    })

    # ---------------- REAL VALUE BET

    if value_bet:

        ou25_market = value_bet.markets.get(
            "OU25",
            {}
        )

        ou25_values = value_bet.market_values.get(
            "OU25",
            {}
        )

        over_value = ou25_values.get(
            "over_value"
        )

        if (
            over_value is not None and
            over_value > 0
        ):

            bookmaker_data = ou25_market.get(
                "over",
                {}
            )

            probability = (
                value_bet.extra_probabilities.get(
                    "over25_prob",
                    0
                ) * 100
            )

            if probability > 0:

                fair_odds = round(
                    100 / probability,
                    2
                )

                value_opportunities.append({

                    "market": "Over 2.5",

                    "edge": round(
                        over_value * 100,
                        1
                    ),

                    "bookmaker": bookmaker_data.get(
                        "bookmaker"
                    ),

                    "market_odds": bookmaker_data.get(
                        "odd"
                    ),

                    "fair_odds": fair_odds,
                })

    # =========================================================
    # BTTS
    # =========================================================

    btts_confidence = round(

        (
            combined_btts +

            (h2h["btts"] if h2h else 0)

        ) / 2,

        1
    )

    if btts_confidence >= 80:
        strength = "VERY STRONG"

    elif btts_confidence >= 65:
        strength = "STRONG"

    elif btts_confidence >= 55:
        strength = "MEDIUM"

    else:
        strength = "LOW"

    markets.append({

        "market": "BTTS",

        "confidence": btts_confidence,

        "strength": strength,
    })

    # ---------------- REAL VALUE BET

    if value_bet:

        btts_market = value_bet.markets.get(
            "BTTS",
            {}
        )

        btts_values = value_bet.market_values.get(
            "BTTS",
            {}
        )

        yes_value = btts_values.get(
            "yes_value"
        )

        if (
            yes_value is not None and
            yes_value > 0
        ):

            bookmaker_data = btts_market.get(
                "yes",
                {}
            )

            probability = (
                value_bet.extra_probabilities.get(
                    "btts_yes_prob",
                    0
                ) * 100
            )

            if probability > 0:

                fair_odds = round(
                    100 / probability,
                    2
                )

                value_opportunities.append({

                    "market": "BTTS",

                    "edge": round(
                        yes_value * 100,
                        1
                    ),

                    "bookmaker": bookmaker_data.get(
                        "bookmaker"
                    ),

                    "market_odds": bookmaker_data.get(
                        "odd"
                    ),

                    "fair_odds": fair_odds,
                })

    # ---------------- NO CLEAR PATTERN

    if not insights:

        add_insight(

            10,

            "general",

            "no_clear_pattern",

            {}

        )
        
    # ---------------- SORT INSIGHTS

    insights.sort(

        key=lambda x: x["priority"],

        reverse=True,

    )

    insights = insights[:4]
    
    return {

        "home_team": home_team,
        "away_team": away_team,

        "home_analysis": home,
        "away_analysis": away,

        "h2h": h2h,

        "combined": {

            "btts": combined_btts,

            "over25": combined_over25,
        },

        "insights": insights,

        "markets": markets,

        "value_opportunities": value_opportunities,
    }