from typing import List
from pydantic import EmailStr
from core.utils.email import baseEmail
from core.celery import celery_app

@celery_app.task(bind=True, max_retries=5, default_retry_delay=10)
def signUpEmail(self, email: List[EmailStr], link: str, name: str) -> bool:

    email_status = baseEmail(
        email,
        "Demo",
        {"name": name, "email": email, "link": link},
        "auth/signup.html",
    )

    return email_status


@celery_app.task(bind=True, max_retries=5, default_retry_delay=10)
def LoginEmail(self, email: List[EmailStr], link: str, name: str) -> bool:

    email_status = baseEmail(
        email,
        "Demo",
        {"name": name, "email": email, "link": link},
        "auth/login.html",
    )

    return email_status


