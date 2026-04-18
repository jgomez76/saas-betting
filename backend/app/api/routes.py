from fastapi import Response, APIRouter, Depends, Query, Request, HTTPException, BackgroundTasks, Body, UploadFile, File, Cookie
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

from app.schemas.auth import LoginRequest, ForgotRequest

from app.services.api_football import get_fixtures, save_fixtures, get_odds_by_date, get_odds_by_league
from app.services.export import export_to_csv, export_to_excel
from app.services.format import format_message
from app.services.injuries import fetch_injuries
from app.services.notifications import send_email, send_telegram
from app.services.odds import save_odds
from app.services.value import get_value_bets, get_top_value_bets

from uuid import uuid4

import io
import csv
import os
import secrets
import shutil

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
        # print("DATA:", data)

        user = db.query(User).filter(User.email == data.email).first()
        # print("USER:", user)

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
        
        if not user.is_active:
            raise HTTPException(status_code=403, detail="User deactivated") 

        if not user.is_verified:
            raise HTTPException(status_code=403, detail="Email not verified")
        
        if user.provider != "email" and not user.password:
            raise HTTPException(
                status_code=400,
                detail="Usa Google o GitHub para iniciar sesión"
            )
        
        # 🔥 FORZAR provider a email en login normal
        if user.provider != "email":
            user.provider = "email"
            db.commit()

        token = create_access_token({
            "sub": str(user.id),   # 🔥 CLAVE
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

def get_current_user(
    access_token: str = Cookie(None),
    db: Session = Depends(get_db),
):
    if not access_token:
        return None

    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])

        user_id = payload.get("sub")

        if not user_id:
            return None

        user = db.query(User).filter(User.id == user_id).first()

        if not user or not user.is_active:
            return None

        return user

    except Exception:
        return None
    

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    if not user:
        return {
            "email": None,
            "is_admin": False
        }

    return {
        "email": user.email,
        "is_admin": user.is_admin,
        "subscription": user.subscription,
        "name": user.name,
        "avatar": user.avatar,
        "provider": user.provider,
    }

# # REGISTER
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
        name=data.email.split("@")[0],
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
    response = JSONResponse({"message": "logout ok"})
    response.delete_cookie("access_token")
    return response

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
def forgot_password(data: ForgotRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.email == data.email).first()

    # 🔥 SI existe → generar token + enviar email
    if user:
        token = secrets.token_urlsafe(32)

        user.reset_token = token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)

        db.commit()

        background_tasks.add_task(
            send_reset_email,
            user.email,
            token
        )

    # 🔥 SIEMPRE misma respuesta (seguridad)
    return {
        "message": "📧 Si el email existe, te hemos enviado instrucciones"
    }

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

@router.post("/deactivate-account")
def deactivate_account(
    response: Response,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🔥 desactivar usuario
    db_user.is_active = False
    db.commit()

    # 🔥 LOGOUT AUTOMÁTICO (CLAVE)
    response.delete_cookie(
        key="access_token",
        path="/",
    )

    return {"message": "account deactivated"}


# REENVIO DE VERIFICACION
@router.post("/resend-verification")
def resend_verification(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Email required")

    user = db.query(User).filter(User.email == email).first()

    # 🔐 seguridad: no revelar si existe o no
    if not user:
        return {"message": "ok"}

    # ✅ ya verificado
    if user.is_verified:
        return {"message": "already_verified"}

    try:
        # 🔐 nuevo token
        token = secrets.token_urlsafe(32)
        user.verification_token = token
        db.commit()

        # 📧 enviar email
        send_verification_email(user.email, token)

        return {"message": "sent"}

    except Exception as e:
        print("❌ RESEND ERROR:", e)
        return {"message": "failed"}

# LOGIN GOOGLE/GITHUB
@router.post("/oauth-login")
def oauth_login(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    name = data.get("name")
    avatar = data.get("avatar")
    provider = data.get("provider")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            email=email,
            password="",
            is_verified=True,
            provider=provider,
            name=name or email.split("@")[0],
            avatar=avatar,
        )
        db.add(user)
        db.commit()


    if not user.name or user.name == "" or user.name == user.email:
        user.name = data.name

    if not user.avatar or user.avatar.startswith("http"):
       user.avatar = avatar
       
    user.provider = provider
    db.commit()

    token = create_access_token({"sub": str(user.id)})

    response = JSONResponse({"message": "ok"})
    # response.set_cookie("access_token", token)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False, #En Local SIEMPRE!!
        path="/",
    )

    return response

@router.put("/update-profile")
def update_profile(
    data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    name = data.get("name")
    avatar = data.get("avatar")

    if name is not None:
        user.name = name

    if avatar is not None:
        user.avatar = avatar


    db.commit()

    return {"message": "Profile updated"}

@router.put("/change-password")
def change_password(
    data: dict = Body(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # 🚫 bloquear OAuth
    if user.provider != "email":
        raise HTTPException(
            status_code=400,
            detail="Usa Google o GitHub para iniciar sesión"
        )

    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Missing fields")

    # 🔐 comprobar password actual
    if not verify_password(current_password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # 🔐 nueva password
    user.password = hash_password(new_password)

    db.commit()

    return {"message": "Password updated"}

@router.post("/upload-avatar")
def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # 📁 carpeta uploads
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # 🧠 nombre único
    # filename = f"user_{user.id}.png"
    

    filename = f"user_{user.id}_{uuid4().hex}.png"
    file_path = os.path.join(upload_dir, filename)

    # 💾 guardar archivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🌐 URL accesible
    # avatar_url = f"http://localhost:8000/uploads/{filename}"
    avatar_url = f"/uploads/{filename}"

    user.avatar = avatar_url
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"avatar": avatar_url}