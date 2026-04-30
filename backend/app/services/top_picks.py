import random
from sqlalchemy.orm import Session
from datetime import date, datetime, timezone
from app.models.top_picks import TopPick
from app.services.value import get_value_bets

# 🎯 thresholds dinámicos
STRICT_PROB = 0.55
STRICT_VALUE = 0.01

RELAX_PROB = 0.50
RELAX_VALUE = -0.01


# -----------------------------------------
# 🔥 FILTRO REUTILIZABLE
# -----------------------------------------
def filter_candidates(candidates, min_prob, min_value):
    return [
        c for c in candidates
        if c["probability"] is not None
        and c["probability"] >= min_prob
        and c["odd"] >= 1.5
        and c["value"] >= min_value
    ]


# -----------------------------------------
# 🔥 EXTRAER CANDIDATOS
# -----------------------------------------
def extract_candidates(db: Session):

    now = datetime.now(timezone.utc)
    today = now.date()

    matches = get_value_bets(db)

    print("TOTAL MATCHES:", len(matches))
    print("TODAY:", today)

    candidates = []

    for m in matches:

        # 🕒 IMPORTANTE: NO TOCAR HORA
        try:
            kickoff = m["date"]
        except:
            continue

        # ✅ SOLO PARTIDOS DE HOY
        if kickoff.date() != today:
            continue

        match_name = f"{m['home_team']} vs {m['away_team']}"

        markets = m.get("markets") or {}
        probs_1x2 = m.get("probabilities") or {}
        probs_extra = m.get("extra_probabilities") or {}
        values_1x2 = m.get("value") or {}
        values_markets = m.get("market_values") or {}

        # =====================================================
        # 🟢 1X2
        # =====================================================
        if markets.get("1X2"):
            odds = markets["1X2"]

            mapping = [
                ("home", probs_1x2.get("home_win_prob"), values_1x2.get("home_value"), odds.get("home")),
                ("draw", probs_1x2.get("draw_prob"), values_1x2.get("draw_value"), odds.get("draw")),
                ("away", probs_1x2.get("away_win_prob"), values_1x2.get("away_value"), odds.get("away")),
            ]

            for sel, prob, val, odd in mapping:
                if not odd or not odd.get("odd"):
                    continue

                candidates.append({
                    "fixture_id": m["fixture_id"],
                    "match": match_name,
                    "market": "1X2",
                    "selection": sel,
                    "probability": prob,
                    "odd": odd["odd"],
                    "bookmaker": odd.get("bookmaker"),
                    "value": val or 0,
                    "kickoff": kickoff
                })

        # =====================================================
        # 🟡 OU25
        # =====================================================
        if markets.get("OU25"):
            odds = markets["OU25"]
            vals = values_markets.get("OU25", {})

            if odds.get("over"):
                candidates.append({
                    "fixture_id": m["fixture_id"],
                    "match": match_name,
                    "market": "OU25",
                    "selection": "over",
                    "probability": probs_extra.get("over25_prob"),
                    "odd": odds["over"]["odd"],
                    "bookmaker": odds["over"].get("bookmaker"),
                    "value": vals.get("over_value", 0),
                    "kickoff": kickoff
                })

            if odds.get("under"):
                candidates.append({
                    "fixture_id": m["fixture_id"],
                    "match": match_name,
                    "market": "OU25",
                    "selection": "under",
                    "probability": probs_extra.get("under25_prob"),
                    "odd": odds["under"]["odd"],
                    "bookmaker": odds["under"].get("bookmaker"),
                    "value": vals.get("under_value", 0),
                    "kickoff": kickoff
                })

        # =====================================================
        # 🟠 OU35
        # =====================================================
        if markets.get("OU35"):
            odds = markets["OU35"]
            vals = values_markets.get("OU35", {})

            if odds.get("over"):
                candidates.append({
                    "fixture_id": m["fixture_id"],
                    "match": match_name,
                    "market": "OU35",
                    "selection": "over",
                    "probability": probs_extra.get("over35_prob"),
                    "odd": odds["over"]["odd"],
                    "bookmaker": odds["over"].get("bookmaker"),
                    "value": vals.get("over_value", 0),
                    "kickoff": kickoff
                })

            if odds.get("under"):
                candidates.append({
                    "fixture_id": m["fixture_id"],
                    "match": match_name,
                    "market": "OU35",
                    "selection": "under",
                    "probability": probs_extra.get("under35_prob"),
                    "odd": odds["under"]["odd"],
                    "bookmaker": odds["under"].get("bookmaker"),
                    "value": vals.get("under_value", 0),
                    "kickoff": kickoff
                })

        # =====================================================
        # 🔵 BTTS
        # =====================================================
        if markets.get("BTTS"):
            odds = markets["BTTS"]
            vals = values_markets.get("BTTS", {})

            if odds.get("yes"):
                candidates.append({
                    "fixture_id": m["fixture_id"],
                    "match": match_name,
                    "market": "BTTS",
                    "selection": "yes",
                    "probability": probs_extra.get("btts_yes_prob"),
                    "odd": odds["yes"]["odd"],
                    "bookmaker": odds["yes"].get("bookmaker"),
                    "value": vals.get("yes_value", 0),
                    "kickoff": kickoff
                })

            if odds.get("no"):
                candidates.append({
                    "fixture_id": m["fixture_id"],
                    "match": match_name,
                    "market": "BTTS",
                    "selection": "no",
                    "probability": probs_extra.get("btts_no_prob"),
                    "odd": odds["no"]["odd"],
                    "bookmaker": odds["no"].get("bookmaker"),
                    "value": vals.get("no_value", 0),
                    "kickoff": kickoff
                })

    print("TOTAL CANDIDATES BEFORE FILTER:", len(candidates))

    return candidates


# -----------------------------------------
# 🔥 GENERAR PICKS
# -----------------------------------------
def generate_top_picks(db: Session):

    today = date.today()

    # ❌ evitar duplicados
    if db.query(TopPick).filter(TopPick.date == today).first():
        print("Top picks ya generados hoy")
        return

    candidates = extract_candidates(db)

    # =====================================================
    # 🔥 FILTRO DINÁMICO (CLAVE)
    # =====================================================

    strict = filter_candidates(candidates, STRICT_PROB, STRICT_VALUE)

    if len(strict) >= 3:
        filtered = strict
        print("USANDO FILTRO STRICT:", len(filtered))
    else:
        filtered = filter_candidates(candidates, RELAX_PROB, RELAX_VALUE)
        print("USANDO FILTRO RELAX:", len(filtered))

    if not filtered:
        print("NO HAY PICKS VALIDOS")
        return

    # =====================================================
    # ⏰ PRIORIDAD HORARIA (SIN SUMAR +2h)
    # =====================================================

    after_13 = [c for c in filtered if c["kickoff"].hour >= 13]
    before_13 = [c for c in filtered if c["kickoff"].hour < 13]

    pool = after_13 if len(after_13) >= 6 else after_13 + before_13

    # =====================================================
    # 🔥 SCORE
    # =====================================================

    for c in pool:
        c["score"] = c["value"] * (c["probability"] ** 2)

    sorted_picks = sorted(pool, key=lambda x: x["score"], reverse=True)

    # =====================================================
    # 🧠 EVITAR DUPLICADOS
    # =====================================================

    used = set()
    unique = []

    for p in sorted_picks:
        if p["fixture_id"] in used:
            continue
        unique.append(p)
        used.add(p["fixture_id"])

    selected = unique[:6]

    if not selected:
        print("NO HAY PICKS TRAS UNIQUE")
        return
    

    n = len(selected)

    free_index = None

    if n == 0:
        print("NO HAY PICKS VALIDOS")
        return

    elif n == 1:
        free_index = 0

    elif n <= 3:
        free_index = 1

    elif n <= 5:
        free_index = random.choice([1, 2])

    else:
        free_index = random.choice([1, 2, 3])

    # =====================================================
    # 🎯 FREE PICK = MEJOR PICK (NO EL DEL MEDIO)
    # =====================================================

    for i, p in enumerate(selected):
        db.add(TopPick(
            date=today,
            fixture_id=p["fixture_id"],
            match=p["match"],
            market=p["market"],
            selection=p["selection"],
            probability=p["probability"],
            odd=p["odd"],
            bookmaker=p["bookmaker"],
            value=p["value"],
            kickoff=p["kickoff"],
            is_free=(i == free_index)  # 🔥 CLAVE
        ))

    db.commit()

    print("TOP PICKS GENERADOS:", len(selected))