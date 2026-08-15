def build_h2h_ai_insights(stats: dict) -> dict:

    team1 = stats["team1"]
    team2 = stats["team2"]

    # ---------------------------------------
    # NEW ENGINE (future)
    # ---------------------------------------

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

    # ---------------------------------------
    # HISTORICAL DATA
    # ---------------------------------------

    diff = abs(
        stats["team1_wins"] -
        stats["team2_wins"]
    )

    recent_diff = abs(
        stats["recent3"]["team1_wins"] -
        stats["recent3"]["team2_wins"]
    )



    # ---------------------------------------
    # GOAL TREND
    # ---------------------------------------

    historical_avg = stats["avg_goals"]

    recent_avg = stats["recent5"]["avg_goals"]

    difference = round(
        recent_avg - historical_avg,
        1
    )


    # ---------------------------------------
    # NEW ENGINE - DOMINANCE
    # ---------------------------------------

    historical_diff = stats["trends"]["dominance"]["historical_diff"]
    recent5_diff = stats["trends"]["dominance"]["recent5_diff"]
    recent3_diff = stats["trends"]["dominance"]["recent3_diff"]

    if (
        historical_diff >= 5 and
        recent5_diff < historical_diff and
        recent3_diff < recent5_diff
    ):

        dominant = (
            team1
            if stats["team1_wins"] >
               stats["team2_wins"]
            else team2
        )

        add_insight(

            95,

            "dominance",

            "weakening",

            {

                "team": dominant,

                "historical": historical_diff,

                "recent5": recent5_diff,

                "recent3": recent3_diff,

            }

        )

 
    # ---------------------------------------
    # COMPOSITE - OPEN MATCHES
    # ---------------------------------------

    historical_over = stats["over25"]
    recent5_over = stats["recent5"]["over25"]
    recent3_over = stats["recent3"]["over25"]

    historical_btts = stats["btts"]
    recent5_btts = stats["recent5"]["btts"]
    recent3_btts = stats["recent3"]["btts"]

    open_matches = (

        difference >= 0.5

        and

        recent5_over >= historical_over + 20
        and
        recent3_over >= recent5_over

        and

        recent5_btts >= historical_btts + 20
        and
        recent3_btts >= recent5_btts

    )

    if open_matches:

        add_insight(

            98,

            "composite",

            "open_matches",

            {}

        )

    # ---------------------------------------
    # NEW ENGINE - GOAL TREND
    # ---------------------------------------

    if difference >= 0.5 and not open_matches:

        add_insight(

            90,

            "goal_trend",

            "goals_increasing",

            {

                "historical": historical_avg,

                "recent": recent_avg,

                "difference": difference,

            }

        )

    elif difference <= -0.5:

        add_insight(

            90,

            "goal_trend",

            "goals_decreasing",

            {

                "historical": historical_avg,

                "recent": recent_avg,

                "difference": abs(difference),

            }

        )

    # ---------------------------------------
    # NEW ENGINE - BTTS TREND
    # ---------------------------------------

    historical_btts = stats["btts"]

    recent5_btts = stats["recent5"]["btts"]

    recent3_btts = stats["recent3"]["btts"]

    if (
    not open_matches
    and
        recent5_btts >= historical_btts + 20 and
        recent3_btts >= recent5_btts
    ):

        add_insight(

            85,

            "market",

            "btts_increasing",

            {

                "historical": historical_btts,

                "recent5": recent5_btts,

                "recent3": recent3_btts,

            }

        )

    elif (
        recent5_btts <= historical_btts - 20 and
        recent3_btts <= recent5_btts
    ):

        add_insight(

            85,

            "market",

            "btts_decreasing",

            {

                "historical": historical_btts,

                "recent5": recent5_btts,

                "recent3": recent3_btts,

            }

        )



    # ---------------------------------------
    # NEW ENGINE - OVER 2.5 TREND
    # ---------------------------------------

    historical_over = stats["over25"]

    recent5_over = stats["recent5"]["over25"]

    recent3_over = stats["recent3"]["over25"]

    if (
    not open_matches
    and
        recent5_over >= historical_over + 20 and
        recent3_over >= recent5_over
    ):

        add_insight(

            85,

            "market",

            "over_increasing",

            {

                "historical": historical_over,

                "recent5": recent5_over,

                "recent3": recent3_over,

            }

        )

    elif (
        recent5_over <= historical_over - 20 and
        recent3_over <= recent5_over
    ):

        add_insight(

            85,

            "market",

            "over_decreasing",

            {

                "historical": historical_over,

                "recent5": recent5_over,

                "recent3": recent3_over,

            }

        )


    # ---------------------------------------
    # NEW ENGINE - CLEAN SHEETS
    # ---------------------------------------

    clean_sheets = 0

    for match in stats["recent_matches"]:

        if (
            match["home_goals"] == 0 or
            match["away_goals"] == 0
        ):

            clean_sheets += 1

    if clean_sheets >= 4:

        add_insight(

            80,

            "defence",

            "clean_sheets",

            {

                "matches": clean_sheets,

                "total": len(stats["recent_matches"]),

            }

        )


    # ---------------------------------------
    # NEW ENGINE - TEAM STOPPED SCORING
    # ---------------------------------------

    team1_failed = 0
    team2_failed = 0

    for match in stats["recent_matches"]:

        if match["home_team"] == team1:

            if match["home_goals"] == 0:
                team1_failed += 1

            if match["away_goals"] == 0:
                team2_failed += 1

        else:

            if match["away_goals"] == 0:
                team1_failed += 1

            if match["home_goals"] == 0:
                team2_failed += 1

    if team1_failed >= 4:

        add_insight(

            85,

            "attack",

            "team1_stopped_scoring",

            {

                "team": team1,

                "matches": team1_failed,

            }

        )

    if team2_failed >= 4:

        add_insight(

            85,

            "attack",

            "team2_stopped_scoring",

            {

                "team": team2,

                "matches": team2_failed,

            }

        )

      
    # ---------------------------------------
    # NEW ENGINE - DRAW TREND
    # ---------------------------------------

    historical_draws = (
        stats["draws"] /
        stats["matches"]
    ) * 100

    recent5_draws = (
        stats["recent5"]["draws"] /
        stats["recent5"]["matches"]
    ) * 100

    recent3_draws = (
        stats["recent3"]["draws"] /
        stats["recent3"]["matches"]
    ) * 100

    if (
        recent5_draws >= 60 and
        recent3_draws >= 50
    ):

        add_insight(

            80,

            "draws",

            "frequent_draws",

            {

                "historical": round(historical_draws, 1),

                "recent5": round(recent5_draws, 1),

                "recent3": round(recent3_draws, 1),

            }

        )


    # ---------------------------------------
    # COMPOSITE INSIGHT
    # ---------------------------------------

    has_dominance = any(

        i["type"] == "dominance"

        for i in insights

    )

    has_goal_trend = any(

        i["type"] == "goal_trend"

        and i["subtype"] == "goals_increasing"

        for i in insights

    )

    if has_dominance and has_goal_trend:

        add_insight(

            100,

            "composite",

            "dominance_with_more_goals",

            {}

        )
        
    # ---------------------------------------
    # AI ENGINE
    # ---------------------------------------

    insights.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # ---------------------------------------
    # FALLBACK
    # ---------------------------------------

    if not insights:

        add_insight(

            10,

            "general",

            "no_clear_pattern",

            {}

        )

    # Mostrar únicamente los insights más relevantes
    insights = insights[:4]

    return {

        "insights": insights,

    }