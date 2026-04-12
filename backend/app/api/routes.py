from fastapi import Response, APIRouter, Depends, Query, Request, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
from collections import defaultdict
from pydantic import BaseModel

from app.core.database import SessionLocal
from app.core.config import CURRENT_SEASON, LEAGUES, SELECTED_LEAGUES
from app.core.auth import create_token
from app.core.security import SECRET_KEY, ALGORITHM, create_access_token, hash_password, verify_password
from app.core.email import send_verification_email, send_reset_email

from app.models.fixture import Fixture
from app.models.user import User
from app.models.analysis import Analysis

from app.schemas.auth import LoginRequest

from app.services.api_football import get_fixtures, save_fixtures, get_odds_by_date, get_odds_by_league
from app.services.export import export_to_csv, export_to_excel
from app.services.format import format_message
from app.services.injuries import fetch_injuries
from app.services.notifications import send_email, send_telegram
from app.services.odds import save_odds
from app.services.value import get_value_bets, get_top_value_bets

import io
import csv
import secrets, datetime

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/fixtures/save/{league_id}/{season}")
def fetch_and_store(league_id: int, season: int, db: Session = Depends(get_db)):
    data = get_fixtures(league_id, season)
    save_fixtures(db, data)
    return {"message": f"Fixtures saved for league {league_id}, season {season}"}


@router.get("/value-bets")
def value_bets(db: Session = Depends(get_db)):
    return get_value_bets(db)



@router.get("/odds/save/{league_id}/{season}")
def fetch_odds(league_id: int, season: int, db: Session = Depends(get_db)):
    data = get_odds_by_league(league_id, season)
    save_odds(db, data)
    return {"message": "Odds saved"}



@router.get("/odds/update")
def update_odds(db: Session = Depends(get_db)):
    today = datetime.utcnow()

    dates = [
        today.strftime("%Y-%m-%d"),
        (today + timedelta(days=1)).strftime("%Y-%m-%d"),
        (today + timedelta(days=2)).strftime("%Y-%m-%d"),
    ]

    for league in LEAGUES:
        for date in dates:
            print(f"Fetching odds for league {league} date {date}")
            data = get_odds_by_date(league, date, CURRENT_SEASON)
            save_odds(db, data)

    return {"message": "Odds updated (today + next 2 days)"}

@router.get("/team/{team_name}/matches")
def get_team_matches(team_name: str, db: Session = Depends(get_db)):
    matches = (
        db.query(Fixture)
        .filter(
            (Fixture.home_team == team_name) | (Fixture.away_team == team_name),
            Fixture.status == "FT"
        )
        .order_by(Fixture.date.desc())
        .limit(5)
        .all()
    )

    result = []

    for m in matches:
        result.append({
            "home": m.home_team,
            "away": m.away_team,
            "home_goals": m.home_goals,
            "away_goals": m.away_goals,
            "date": m.date
        })

    return result


@router.get("/injuries/update")
def update_injuries(db: Session = Depends(get_db)):
    for league in LEAGUES:
        fetch_injuries(db, league, CURRENT_SEASON)

    return {"status": "injuries updated"}


# @router.get("/top-value")
# def top_value(
#     action: str = Query("view"),
#     format: str = Query("csv"),
#     top_n: int = Query(10),
#     db: Session = Depends(get_db)
# ):

#     bets = get_top_value_bets(db, top_n)

#     # -----------------------------
#     # VIEW (por defecto)
#     # -----------------------------
#     if action == "view":
#         return bets

#     # -----------------------------
#     # EXPORT CSV
#     # -----------------------------
#     if action == "export" and format == "csv":
#         file = export_to_csv(bets)
#         return {"status": "csv generado", "file": file}

#     # -----------------------------
#     # EXPORT EXCEL
#     # -----------------------------
#     if action == "export" and format == "excel":
#         file = export_to_excel(bets)
#         return {"status": "excel generado", "file": file}

#     # -----------------------------
#     # EMAIL
#     # -----------------------------
#     if action == "email":
#         message = format_message(bets)
#         send_email(message)
#         return {"status": "email enviado"}

#     # -----------------------------
#     # TELEGRAM
#     # -----------------------------
#     if action == "telegram":
#         message = format_message(bets)
#         send_telegram(message)
#         return {"status": "telegram enviado"}

#     # -----------------------------
#     # WHATSAPP (link)
#     # -----------------------------
#     if action == "whatsapp":
#         message = format_message(bets)
#         url = f"https://wa.me/?text={message}"
#         return {"url": url}

#     return {"error": "acción no válida"}


@router.get("/top-value")
def top_value(request: Request, db: Session = Depends(get_db)):

    action = request.query_params.get("action")
    ids = request.query_params.get("ids")

    bets = get_top_value_bets(db)

    # 🔥 FILTRAR SELECCIONADAS
    if ids:
        ids_list = [int(i) for i in ids.split(",")]
        bets = [b for i, b in enumerate(bets) if i in ids_list]

    # -----------------------
    # CSV
    # -----------------------
    if action == "csv":

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["Match", "Market", "Pick", "Odd", "Bookmaker", "Value"])

        for b in bets:
            writer.writerow([
                b["match"],
                b["market"],
                b["selection"],
                b["odd"],
                b["bookmaker"],
                b["value"]
            ])

        output.seek(0)

        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=top_bets.csv"
            },
        )

    # -----------------------
    # DEFAULT
    # -----------------------
    return bets

@router.get("/fixture/{fixture_id}/result")
def get_fixture_result(fixture_id: int, db: Session = Depends(get_db)):
    match = db.query(Fixture).filter(Fixture.api_id == fixture_id).first()

    if not match:
        return None

    return {
        "home_goals": match.home_goals,
        "away_goals": match.away_goals,
        "status": match.status
    }

@router.get("/analysis")
def get_analysis(db: Session = Depends(get_db)):
    return db.query(Analysis).all()

@router.get("/leagues")
def get_leagues(db: Session = Depends(get_db)):
    leagues = db.query(Fixture.league).distinct().all()
    return [l[0] for l in leagues]

@router.get("/results/{league}")
def get_results(league: str, db: Session = Depends(get_db)):
    return db.query(Fixture).filter(
        Fixture.league == league,
        Fixture.status == "FT",
        Fixture.season == CURRENT_SEASON
    ).order_by(Fixture.date.desc()).all()


@router.get("/standings/{league}")
def get_standings(league: str, db: Session = Depends(get_db)):
    CURRENT_SEASON = 2025

    fixtures = (
        db.query(Fixture)
        .filter(Fixture.league == league)
        .filter(Fixture.season == CURRENT_SEASON)
        .all()
    )

    table = defaultdict(lambda: {
        "team": "",
        "played": 0,
        "wins": 0,
        "draws": 0,
        "losses": 0,
        "gf": 0,
        "ga": 0,
        "points": 0,
    })

    for f in fixtures:
        if f.home_goals is None or f.away_goals is None:
            continue

        home = table[f.home_team]
        away = table[f.away_team]

        home["team"] = f.home_team
        away["team"] = f.away_team

        home["played"] += 1
        away["played"] += 1

        home["gf"] += f.home_goals
        home["ga"] += f.away_goals

        away["gf"] += f.away_goals
        away["ga"] += f.home_goals

        if f.home_goals > f.away_goals:
            home["wins"] += 1
            home["points"] += 3
            away["losses"] += 1
        elif f.home_goals < f.away_goals:
            away["wins"] += 1
            away["points"] += 3
            home["losses"] += 1
        else:
            home["draws"] += 1
            away["draws"] += 1
            home["points"] += 1
            away["points"] += 1

    standings = list(table.values())

    standings.sort(
        key=lambda x: (
            -x["points"],
            -(x["gf"] - x["ga"]),
            -x["gf"],
        )
    )

    return standings

@router.get("/leagues-selected")
def get_selected_leagues(db: Session = Depends(get_db)):
    leagues = (
        db.query(Fixture.league)
        .filter(Fixture.league_id.in_(SELECTED_LEAGUES))
        .distinct()
        .all()
    )

    return [l[0] for l in leagues]

###################################
############ LOGIN ################
###################################

@router.post("/login")
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    try:
        print("🔥 LOGIN HIT")
        print("DATA:", data)

        user = db.query(User).filter(User.email == data.email).first()
        print("USER:", user)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # 🔥 proteger verify_password
        try:
            valid = verify_password(data.password, user.password)
        except Exception as e:
            print("💥 PASSWORD ERROR:", e)
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not valid:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if not user.is_verified:
            raise HTTPException(status_code=403, detail="Email not verified")

        token = create_access_token({
            "sub": user.email,
            "is_admin": user.is_admin,
        })

        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            samesite="lax",
            secure=False, #En Local SIEMPRE!!
            path="/",
        )

        return {"message": "ok"}

    except HTTPException:
        raise
    except Exception as e:
        print("💥 LOGIN ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")

def get_current_user(request: Request):
    token = request.cookies.get("access_token")

    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        return None
    
@router.get("/me")
def get_me(request: Request, user=Depends(get_current_user)):
    if not user:
        return JSONResponse(
            status_code=200,  # 👈 CLAVE
            content={
                "email": None,
                "is_admin": False,
                "subscription": "free",
            },
        )

    return {
        "email": user.get("sub"),
        "is_admin": user.get("is_admin", False),
        "subscription": user.get("subscription", "free"),
    }


# # REGISTER
# @router.post("/register")
# def register(data: RegisterRequest, db: Session = Depends(get_db)):
#     # 🔍 comprobar si existe
#     existing = db.query(User).filter(User.email == data.email).first()

#     if existing:
#         raise HTTPException(status_code=400, detail="User already exists")

#     token = secrets.token_urlsafe(32)
    
#     # 👤 crear usuario
#     user = User(
#         email=data.email,
#         # password=data.password,  # luego lo mejoramos (hash)
#         password=hash_password(data.password),  # 🔥
#         is_admin=False,
#         subscription="free",
#         is_verified=False,
#         verification_token=token,
#     )

#     db.add(user)
#     db.commit()

#     print(f"http://localhost:3000/verify?token={token}")

#     return {"message": "user created"}

# @router.post("/register")
# def register(data: RegisterRequest, db: Session = Depends(get_db)):
    try:
        print("🔥 REGISTER HIT", data.email)

        existing = db.query(User).filter(User.email == data.email).first()

        if existing:
            print("❌ USER EXISTS")
            raise HTTPException(400, "User already exists")

        # import secrets
        token = secrets.token_urlsafe(32)

        user = User(
            email=data.email,
            password=hash_password(data.password),
            is_verified=False,
            verification_token=token,
        )

        db.add(user)
        db.commit()

        print("✅ USER CREATED")
        # print(f"http://localhost:3000/verify?token={token}")
        

        send_verification_email(user.email, token)

        return {"message": "user created"}

    except Exception as e:
        print("💥 REGISTER ERROR:", str(e))
        raise HTTPException(500, str(e))

@router.post("/register")
def register(
    data: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    print("🔥 REGISTER HIT:", data.email)

    # 🔍 comprobar si ya existe
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        print("❌ USER EXISTS")
        raise HTTPException(status_code=400, detail="User already exists")

    # 🔐 generar token
    token = secrets.token_urlsafe(32)

    # 👤 crear usuario
    user = User(
        email=data.email,
        password=hash_password(data.password),
        is_verified=False,
        verification_token=token,
    )
    # print(user)


    db.add(user)
    db.commit()

    print("✅ USER CREATED")

    # 📧 enviar email en background (NO bloquea request)
    background_tasks.add_task(
        send_verification_email,
        user.email,
        token
    )

    return {"message": "user created"}


# LOGOUT
@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "logged out"}

# VERIFY
@router.get("/verify")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()

    if not user:
        raise HTTPException(400, "Invalid token")

    user.is_verified = True
    user.verification_token = None
    db.commit()

    return {"message": "verified"}

@router.post("/forgot-password")
def forgot_password(data: dict, db: Session = Depends(get_db)):
    background_tasks: BackgroundTasks
    email = data.get("email")

    user = db.query(User).filter(User.email == email).first()

    # 🔥 IMPORTANTE: NO revelar si existe o no
    if not user:
        return {"message": "ok"}

    import secrets
    from datetime import datetime, timedelta

    token = secrets.token_urlsafe(32)

    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)

    db.commit()

    # 🔥 enviar email
    try:
        send_reset_email(user.email, token)
    except Exception as e:
        print("💥 EMAIL ERROR:", e)
        # 📧 enviar email en background (NO bloquea request)

    return {"message": "ok"}


@router.post("/reset-password")
def reset_password(data: dict, db: Session = Depends(get_db)):
    token = data.get("token")
    password = data.get("password")

    print("🔥 RESET HIT")
    print("TOKEN:", token)
    print("PASSWORD:", password)

    user = db.query(User).filter(User.reset_token == token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")

    from datetime import datetime

    if user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")

    user.password = hash_password(password)
    user.reset_token = None
    user.reset_token_expiry = None

    db.commit()

    return {"message": "ok"}