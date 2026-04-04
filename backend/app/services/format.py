def format_message(bets):

    msg = "🔥 TOP VALUE BETS\n\n"

    for b in bets:
        msg += f"{b['match']} ({b['league']})\n"
        msg += f"{b['market']} - {b['selection']}\n"
        msg += f"Odd: {b['odd']} ({b['bookmaker']})\n"
        msg += f"Value: +{b['value']}%\n\n"

    return msg