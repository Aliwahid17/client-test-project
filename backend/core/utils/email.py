from typing import List
from fastapi_mail import FastMail, MessageSchema, MessageType
from pydantic import EmailStr
from core.config import emailConf
from asyncio import run


def baseEmail(
    email: List[EmailStr], subject: str, body: dict[str, str | int | list], template: str
) -> bool:
    try:
        message = MessageSchema(
            subject=subject,
            recipients=email,
            template_body=body,
            subtype=MessageType.html,
        )

        fm = FastMail(emailConf)
        run(fm.send_message(message=message, template_name=template))
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")  # We will add log later
        return False
