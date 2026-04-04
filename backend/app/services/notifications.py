import requests
import smtplib
from email.mime.text import MIMEText


def send_email(body, subject="Top Value Bets"):

    sender = "TU_EMAIL@gmail.com"
    password = "TU_PASSWORD"
    receiver = "DESTINO@gmail.com"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = receiver

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender, password)
        server.send_message(msg)


def send_telegram(message):

    BOT_TOKEN = "TU_TOKEN"
    CHAT_ID = "TU_CHAT_ID"

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

    requests.post(url, json={
        "chat_id": CHAT_ID,
        "text": message
    })