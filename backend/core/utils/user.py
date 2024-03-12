from core.config import get_settings
from httpx import post, HTTPStatusError, get
from fastapi import HTTPException

async def google_tokens(code: str, redirect_uri: str):
    data = {
        "code": code,
        "client_id": get_settings().GOOGLE_CLIENT_ID,
        "client_secret": get_settings().GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    try:
        response = post(
            "https://oauth2.googleapis.com/token", data=data, headers=headers
        )
        response.raise_for_status()
    except HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code, detail="Failed to get tokens"
        )

    tokens = response.json()
    return tokens


async def google_user_info(token: str):
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = get("https://www.googleapis.com/userinfo/v2/me", headers=headers)
        response.raise_for_status()
    except HTTPStatusError as exc:
        raise HTTPException(
            status_code=exc.response.status_code, detail="Failed to get user info"
        )

    user_info = response.json()

    return user_info


