import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import (
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    EMAIL_FROM,
)


def send_email(
    *,
    to: str,
    subject: str,
    html: str,
) -> None:
    """
    Sends an HTML email using the configured SMTP server.
    """

    message = MIMEMultipart("alternative")

    message["Subject"] = subject
    message["From"] = EMAIL_FROM
    message["To"] = to

    message.attach(
        MIMEText(
            html,
            "html",
            "utf-8",
        )
    )

    try:

        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT,
        ) as server:

            server.starttls()

            server.set_debuglevel(1)

            server.login(
                SMTP_USER,
                SMTP_PASSWORD,
            )

            server.sendmail(
                SMTP_USER,
                [to],
                message.as_string(),
            )

        print(f"📧 Email enviado correctamente a {to}")

    except Exception as e:

        print(f"❌ Error enviando email a {to}: {e}")

        raise