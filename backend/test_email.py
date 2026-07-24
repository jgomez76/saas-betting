from app.emails.service import send_verification_email


def main():

    send_verification_email(
        to_email="josebagomez@gmail.com",
        token="123456789",
    )

    print("✅ Test finalizado")


if __name__ == "__main__":
    main()