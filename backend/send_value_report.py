from app.core.database import SessionLocal
from app.services.value import get_top_value_bets
from app.services.export import export_to_csv, export_to_excel
from app.services.notifications import send_email, send_telegram


def format_message(bets):
    msg = "🔥 TOP VALUE BETS\n\n"

    for b in bets:
        msg += f"{b['match']} ({b['league']})\n"
        msg += f"{b['market']} - {b['selection']}\n"
        msg += f"Odd: {b['odd']} ({b['bookmaker']})\n"
        msg += f"Value: +{b['value']}%\n\n"

    return msg


def run():
    db = SessionLocal()

    bets = get_top_value_bets(db, top_n=10)

    # EXPORT
    export_to_csv(bets)
    export_to_excel(bets)

    # MENSAJE
    message = format_message(bets)

    # SEND
    send_email(message)
    send_telegram(message)

    db.close()


if __name__ == "__main__":
    run()