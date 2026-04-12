import resend
import os

api_key = os.getenv("RESEND_API_KEY")

if not api_key:
    raise ValueError("RESEND_API_KEY no definida")

resend.api_key = api_key
# print(api_key)


def send_verification_email(to_email: str, token: str):
    try:
        link = f"http://localhost:3000/verify?token={token}"

        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to_email,
            "subject": "Verifica tu cuenta",
            "html": f"""
                <h2>Bienvenido 👋</h2>
                <p>Haz click para verificar tu cuenta:</p>
                <a href="{link}">{link}</a>
            """
        })

        print(f"📧 Email enviado a {to_email}")

    except Exception as e:
        print("❌ ERROR EMAIL:", str(e))


def send_reset_email(to_email: str, token: str):
    link = f"http://localhost:3000/reset?token={token}"

    resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": to_email,
        "subject": "Recuperar contraseña",
        "html": f"""
            <h2>Reset password</h2>
            <a href="{link}">Resetear contraseña</a>
        """
    })