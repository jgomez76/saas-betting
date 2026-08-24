import random
from sqlalchemy.orm import Session
from datetime import date, datetime, timezone
from app.models.top_picks import TopPick
from app.models.top_picks_history import TopPickHistory
from app.models.fixture import Fixture
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

    # print("TOTAL MATCHES:", len(matches))
    # print("TODAY:", today)

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

    print("\n📊 CANDIDATOS INICIALES\n")

    for c in candidates:
        print(
            f"{c['match']} | {c['market']} {c['selection']} | "
            f"Prob: {c['probability']:.2f} | "
            f"Value: {c['value']:.2f} | "
            f"Odd: {c['odd']}"
    )

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

def generate_top_picks_v2(db: Session):

    today = date.today()

    if db.query(TopPick).filter(TopPick.date == today).first():
        print("Top picks ya generados hoy")
        return

    candidates = extract_candidates(db)

    print("TOTAL CANDIDATES:", len(candidates))

    enriched = []

    for c in candidates:

        prob = c["probability"]
        odd = c["odd"]
        value = c["value"]

        if not prob or not odd or not value:
            continue

        # -----------------------------
        # 🔴 FILTROS DUROS
        # -----------------------------

        if prob < MIN_PROB:
            continue

        if value < MIN_VALUE:
            continue

        if odd > MAX_ODD:
            continue

        # -----------------------------
        # 🧠 SCORE NUEVO (CLAVE)
        # -----------------------------

        ev = prob * odd - 1

        # penaliza odds altas (riesgo)
        risk_penalty = odd ** 0.5

        score = (ev * prob) / risk_penalty

        c["score"] = score
        c["ev"] = ev

        enriched.append(c)

    if not enriched:
        print("NO HAY PICKS TRAS FILTRO")
        return

    # -----------------------------
    # 🔥 ORDENAR
    # -----------------------------

    enriched = sorted(enriched, key=lambda x: x["score"], reverse=True)

    # -----------------------------
    # 🚫 EVITAR DUPLICADOS PARTIDO
    # -----------------------------

    used_fixtures = set()
    used_markets = {}

    final = []

    for p in enriched:

        fixture_id = p["fixture_id"]
        market = p["market"]

        if fixture_id in used_fixtures:
            continue

        # limitar por mercado
        if used_markets.get(market, 0) >= MAX_PER_MARKET:
            continue

        final.append(p)

        used_fixtures.add(fixture_id)
        used_markets[market] = used_markets.get(market, 0) + 1

        if len(final) >= TARGET_PICKS:
            break

    if not final:
        print("NO PICKS TRAS FILTRO FINAL")
        return

    # -----------------------------
    # 🎯 FREE PICK = EL MEJOR
    # -----------------------------

    for i, p in enumerate(final):
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
            is_free=(i == 0)  # 🔥 EL MEJOR
        ))

        db.add(TopPickHistory(
            date=today,
            fixture_id=p["fixture_id"],
            market=p["market"],
            selection=p["selection"],
            odd=p["odd"],
            probability=p["probability"],
            value=p["value"],
        ))

    db.commit()

    print("TOP PICKS V2:", len(final))

def generate_top_picks_v3(db: Session):

    today = date.today()

    if db.query(TopPick).filter(TopPick.date == today).first():
        print("Top picks ya generados hoy")
        return

    candidates = extract_candidates(db)

    enriched = []

    for c in candidates:

        prob = c["probability"]
        odd = c["odd"]
        value = c["value"]

        if not prob or not odd or not value:
            continue

        # 🔴 FILTROS
        if prob < MIN_PROB:
            continue

        if value < MIN_VALUE:
            continue

        if odd > MAX_ODD:
            continue

        # 🧠 SCORE LIMPIO
        edge = (prob * odd) - 1
        score = edge * prob

        c["score"] = score
        c["edge"] = edge

        enriched.append(c)

    if not enriched:
        print("NO HAY PICKS")
        return

    # 🔥 ORDENAR
    enriched.sort(key=lambda x: x["score"], reverse=True)

    # 🔥 SOLO TOP POOL (evita ruido)
    enriched = enriched[:TOP_CANDIDATES_POOL]

    # -----------------------------
    # 🎯 SELECCIÓN INTELIGENTE
    # -----------------------------

    used_fixtures = set()
    used_markets = {}
    final = []

    for p in enriched:

        fixture_id = p["fixture_id"]
        market = p["market"]

        if fixture_id in used_fixtures:
            continue

        if used_markets.get(market, 0) >= MAX_PER_MARKET:
            continue

        final.append(p)

        used_fixtures.add(fixture_id)
        used_markets[market] = used_markets.get(market, 0) + 1

        if len(final) >= TARGET_PICKS:
            break

    n = len(final)

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

    # -----------------------------
    # 💾 GUARDAR
    # -----------------------------

    for i, p in enumerate(final):

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
            is_free=(i == free_index)
        ))

        db.add(TopPickHistory(
            date=today,
            fixture_id=p["fixture_id"],
            market=p["market"],
            selection=p["selection"],
            odd=p["odd"],
            probability=p["probability"],
            value=p["value"],
        ))

    db.commit()

    print("TOP PICKS V3:", n)



# VERSION 4
import random

from datetime import date

from sqlalchemy.orm import Session

from app.models.top_picks import TopPick
from app.models.top_picks_history import TopPickHistory

from app.services.top_picks import extract_candidates


# --------------------------------------------------
# V4 CONFIG
# --------------------------------------------------

MIN_PROB = 0.62
MAX_PROB = 0.82

MIN_VALUE = 0.10

MIN_ODD = 1.70
MAX_ODD = 2.15

TARGET_PICKS = 6

MAX_PER_MARKET = 2

TOP_CANDIDATES_POOL = 15


# --------------------------------------------------
# MARKETS TO AVOID
# --------------------------------------------------

BAD_MARKETS = {
    ("OU25", "over"),
}


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def generate_top_picks_v4(db: Session):

    today = date.today()

    existing = (
        db.query(TopPick)
        .filter(TopPick.date == today)
        .first()
    )

    if existing:
        print("⚠️ Top picks ya generados hoy")
        return

    candidates = extract_candidates(db)

    print("TOTAL CANDIDATES:", len(candidates))

    print("\n========== CANDIDATES BEFORE FILTER ==========")

    for i, c in enumerate(candidates, 1):

        print(
            f"{i}. "
            f"{c['match']} | "
            f"{c['market']} {c['selection']} | "
            f"prob={c.get('probability')} | "
            f"value={c.get('value')} | "
            f"odd={c.get('odd')} | "
            f"bookmaker={c.get('bookmaker')}"
        )

    print("=============================================\n")

    enriched = []

    rejected = {
        "missing_data": 0,
        "prob_low": 0,
        "prob_high": 0,
        "value_low": 0,
        "odd_low": 0,
        "odd_high": 0,
        "bad_market": 0,
        "score_invalid": 0,
    }

    # --------------------------------------------------
    # FILTER + SCORE
    # --------------------------------------------------

    for c in candidates:

        prob = c.get("probability")
        odd = c.get("odd")
        value = c.get("value")

        market = c.get("market")
        selection = c.get("selection")

        if not prob or not odd or not value:
            continue

        if prob is None or odd is None or value is None:
            rejected["missing_data"] += 1
            continue

        if prob < MIN_PROB:
            rejected["prob_low"] += 1
            continue

        if prob > MAX_PROB:
            rejected["prob_high"] += 1
            continue

        if value < MIN_VALUE:
            rejected["value_low"] += 1
            continue

        if odd < MIN_ODD:
            rejected["odd_low"] += 1
            continue

        if odd > MAX_ODD:
            rejected["odd_high"] += 1
            continue

        if (market, selection) in BAD_MARKETS:
            rejected["bad_market"] += 1
            continue

        # --------------------------------------------------
        # SAFE PROBABILITY CAP
        # --------------------------------------------------

        # prob = min(prob, 0.78)

        # --------------------------------------------------
        # EXPECTED VALUE
        # --------------------------------------------------

        ev = (prob * odd) - 1

        # --------------------------------------------------
        # RISK CONTROL
        # --------------------------------------------------

        risk_penalty = odd ** 0.7

        # --------------------------------------------------
        # STABILITY BONUS
        #
        # Favorece odds cercanas a 1.90
        # --------------------------------------------------

        stability_bonus = (
            1 - abs(odd - 1.90)
        )

        # --------------------------------------------------
        # FINAL SCORE
        # --------------------------------------------------

        score = (
            ev *
            stability_bonus *
            prob
        ) / risk_penalty

        # --------------------------------------------------
        # EXTRA PROTECTION
        # --------------------------------------------------

        if score <= 0:
            continue

        c["score"] = score
        c["ev"] = ev

        enriched.append(c)

        print(
            f"VALID CANDIDATE | "
            f"{c['match']} | "
            f"{market} {selection} | "
            f"prob={prob:.3f} | "
            f"odd={odd:.2f} | "
            f"value={value:.3f} | "
            f"ev={ev:.3f} | "
            f"score={score:.5f}"
        )

    # --------------------------------------------------
    # NO PICKS
    # --------------------------------------------------

    print("\n========== TOP PICKS ANALYSIS ==========")

    print(f"TOTAL CANDIDATES: {len(candidates)}")

    print(f"VALID AFTER FILTERS: {len(enriched)}")

    print(f"REJECTED - missing data: {rejected['missing_data']}")
    print(f"REJECTED - probability < {MIN_PROB}: {rejected['prob_low']}")
    print(f"REJECTED - probability > {MAX_PROB}: {rejected['prob_high']}")
    print(f"REJECTED - value < {MIN_VALUE}: {rejected['value_low']}")
    print(f"REJECTED - odd < {MIN_ODD}: {rejected['odd_low']}")
    print(f"REJECTED - odd > {MAX_ODD}: {rejected['odd_high']}")
    print(f"REJECTED - bad market: {rejected['bad_market']}")

    print("========================================\n")

    if not enriched:
        print("❌ NO HAY PICKS VALIDOS")
        return

    # --------------------------------------------------
    # SORT
    # --------------------------------------------------

    enriched.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    # --------------------------------------------------
    # REDUCE NOISE
    # --------------------------------------------------

    enriched = enriched[:TOP_CANDIDATES_POOL]

    print("\n========== TOP CANDIDATES POOL ==========")

    for i, p in enumerate(enriched, 1):
        print(
            f"{i}. "
            f"{p['match']} | "
            f"{p['market']} {p['selection']} | "
            f"prob={p['probability']:.3f} | "
            f"odd={p['odd']:.2f} | "
            f"value={p['value']:.3f} | "
            f"ev={p['ev']:.3f} | "
            f"score={p['score']:.5f}"
        )

    print("==========================================\n")

    # --------------------------------------------------
    # SMART SELECTION
    # --------------------------------------------------

    used_fixtures = set()

    used_markets = {}
    final = []

    for p in enriched:

        fixture_id = p["fixture_id"]
        market = p["market"]

        # --------------------------------------------------
        # AVOID SAME MATCH
        # --------------------------------------------------

        if fixture_id in used_fixtures:
            continue

        # --------------------------------------------------
        # MARKET LIMIT
        # --------------------------------------------------

        if used_markets.get(market, 0) >= MAX_PER_MARKET:
            continue

        final.append(p)

        used_fixtures.add(fixture_id)

        used_markets[market] = (
            used_markets.get(market, 0) + 1
        )

        # --------------------------------------------------
        # MAX PICKS
        # --------------------------------------------------

        if len(final) >= TARGET_PICKS:
            break

    # --------------------------------------------------
    # FINAL CHECK
    # --------------------------------------------------

    n = len(final)

    if n == 0:
        print("❌ NO HAY PICKS TRAS FILTRO FINAL")
        return

    print(f"✅ FINAL PICKS: {n}")

    # --------------------------------------------------
    # FREE PICK LOGIC
    #
    # Evita regalar siempre el top 1
    # --------------------------------------------------

    if n == 1:
        free_index = 0
    elif n <= 3:
        free_index = 1
    elif n <= 5:
        free_index = random.choice([1, 2])
    else:
        free_index = random.choice([1, 2, 3])

    # --------------------------------------------------
    # SAVE PICKS
    # --------------------------------------------------

    for i, p in enumerate(final):

        db.add(
            TopPick(
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
                is_free=(i == free_index),
            )
        )

        db.add(
            TopPickHistory(
                date=today,
                fixture_id=p["fixture_id"],
                market=p["market"],
                selection=p["selection"],
                odd=p["odd"],
                probability=p["probability"],
                value=p["value"],
            )
        )

    db.commit()

    print("🔥 TOP PICKS V4 GENERATED")

def update_top_pick_results(db: Session):

    picks = db.query(TopPickHistory)\
        .filter(TopPickHistory.result == None)\
        .all()

    for p in picks:

        fixture = db.query(Fixture)\
            .filter(Fixture.api_id == p.fixture_id)\
            .first()

        FINISHED_STATUSES = {"FT", "AET", "PEN"}

        if not fixture or fixture.status not in FINISHED_STATUSES:
            continue

        home_goals = fixture.home_goals or 0
        away_goals = fixture.away_goals or 0
        total_goals = home_goals + away_goals

        # -----------------------------
        # 1X2
        # -----------------------------
        if p.market == "1X2":

            if p.selection == "home" and home_goals > away_goals:
                p.result = "win"
            elif p.selection == "away" and away_goals > home_goals:
                p.result = "win"
            elif p.selection == "draw" and home_goals == away_goals:
                p.result = "win"
            else:
                p.result = "loss"

        # -----------------------------
        # OVER / UNDER 2.5
        # -----------------------------
        elif p.market == "OU25":

            if p.selection == "over" and total_goals > 2.5:
                p.result = "win"
            elif p.selection == "under" and total_goals <= 2.5:
                p.result = "win"
            else:
                p.result = "loss"

        # -----------------------------
        # OVER / UNDER 3.5
        # -----------------------------
        elif p.market == "OU35":

            if p.selection == "over" and total_goals > 3.5:
                p.result = "win"
            elif p.selection == "under" and total_goals <= 3.5:
                p.result = "win"
            else:
                p.result = "loss"

        # -----------------------------
        # BTTS
        # -----------------------------
        elif p.market == "BTTS":

            both_score = home_goals > 0 and away_goals > 0

            if p.selection == "yes" and both_score:
                p.result = "win"
            elif p.selection == "no" and not both_score:
                p.result = "win"
            else:
                p.result = "loss"

    db.commit()