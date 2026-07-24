from datetime import datetime

from app.core.config import FRONTEND_URL
from app.emails.renderer import render_template
from app.emails.sender import send_email

from app.emails.translations import translations

def send_verification_email(
    to_email: str,
    token: str,
    language: str,
) -> None:

    # Idioma por defecto
    if language not in translations:
        language = "en"

    t = translations[language]

    html = render_template(
        "verify.html",
        verify_link=f"{FRONTEND_URL}/verify?token={token}",
        t=t,
    )

    send_email(
        to=to_email,
        subject=t["verify_subject"],
        html=html,
    )

def send_reset_password_email(
    to_email: str,
    token: str,
    language: str,
) -> None:

    # 🌍 Idioma por defecto
    if language not in translations:
        language = "en"

    t = translations[language]

    html = render_template(
        "reset_password.html",
        reset_link=f"{FRONTEND_URL}/reset?token={token}",
        t=t,
    )

    send_email(
        to=to_email,
        subject=t["reset_subject"],
        html=html,
    )

def send_reactivation_email(
    to_email: str,
    token: str,
    language: str,
) -> None:

    # 🌍 Idioma por defecto
    if language not in translations:
        language = "en"

    t = translations[language]

    html = render_template(
        "reactivate.html",
        reactivate_link=f"{FRONTEND_URL}/reactivate?token={token}",
        t=t,
    )

    send_email(
        to=to_email,
        subject=t["reactivate_subject"],
        html=html,
    )

def send_premium_activated_email(
    to_email: str,
    language: str,
) -> None:

    if language not in translations:
        language = "en"

    t = translations[language]

    html = render_template(
        "premium_activated.html",
        t=t,
    )

    send_email(
        to=to_email,
        subject=t["premium_activated_subject"],
        html=html,
    )

def send_premium_cancelled_email(
    to_email: str,
    end_date: str,
    language: str,
) -> None:

    if language not in translations:
        language = "en"

    t = translations[language]

    html = render_template(
        "premium_cancelled.html",
        end_date=end_date,
        t=t,
    )

    send_email(
        to=to_email,
        subject=t["premium_cancelled_subject"],
        html=html,
    )

def send_premium_reactivated_email(
    to_email: str,
    language: str,
) -> None:

    if language not in translations:
        language = "en"

    t = translations[language]

    html = render_template(
        "premium_reactivated.html",
        t=t,
    )

    send_email(
        to=to_email,
        subject=t["premium_reactivated_subject"],
        html=html,
    )

def send_premium_expired_email(
    to_email: str,
    language: str,
) -> None:

    if language not in translations:
        language = "en"

    t = translations[language]

    html = render_template(
        "premium_expired.html",
        t=t,
    )

    send_email(
        to=to_email,
        subject=t["premium_expired_subject"],
        html=html,
    )