# fastapi
from fastapi.param_functions import Path
from fastapi.requests import Request
from fastapi.routing import APIRouter
from fastapi.responses import RedirectResponse

# External
from typing import Annotated
from json import loads
from datetime import datetime

# Internal
from core.db.database import RedisString, client as db
from core.config import templates


verificationRouter = APIRouter(
    tags=["verification"],
)

@verificationRouter.get("/auth/verified-user/{email}/{token}", name="verified-user")
async def email_verify(
    request: Request,
    email: Annotated[str, Path(title="User Email")],
    token: Annotated[str, Path(title="User Token")],
):
    try:

        if not email or not token:
            return RedirectResponse(url="//localhost:3000")

        userDetails = RedisString(key=f"{email}:SignUp")
        isUser = await userDetails.redisStringGet()

        if isUser is None:
            return RedirectResponse(url="//localhost:3000")

        isUserExist = loads(isUser)

        if isUserExist["email"] != email or isUserExist["token"] != token:
            return RedirectResponse(url="//localhost:3000")

        userData = db['demo']['users']

        result = userData.insert_one({
            "name": isUserExist["name"],
            "email": isUserExist["email"],
            "phone_number": isUserExist["phone"],
            "type": isUserExist["type"],
            "created_at" : datetime.now()
        })
        print(result)
        await userDetails.redisDelete()

        return templates.TemplateResponse(
            "routes/auth/verified-user.html", {"request": request}
        )
    except Exception as e:
        print(e)
        return RedirectResponse(url="//localhost:3000")
