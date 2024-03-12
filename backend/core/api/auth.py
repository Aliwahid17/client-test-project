# fastapi
from fastapi import status
from fastapi.param_functions import Form, Header, Body
from fastapi.requests import Request
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse

# External
from typing import Annotated, Optional
from time import time
from json import loads, dumps
from datetime import datetime, timedelta

# Internal
from core.db.database import RedisString, client as db
from core.utils.db.user import get_user
from core.utils.generateToken import generate_token, create_access_token
from core.tasks.email import signUpEmail, LoginEmail
from core.utils.responses import INTERNAL_SERVER_ERROR
from core.utils.user import google_tokens, google_user_info
from core.types.auth import GoogleType, VerificationType
from core.config import get_settings


authRouter = APIRouter(
    prefix="/api/v1/auth",
    tags=["authentication"],
)

# Api Routes


@authRouter.post("/signup", name="signup")
async def signup(
    request: Request,
    name: Annotated[str, Form()],
    email: Annotated[str, Form()],
    phone: Annotated[Optional[str], Form()] = "",
) -> JSONResponse:

    try:
        user = await get_user(email)
        token = generate_token(16)

        userDetails = RedisString(
            key=f"{email}:SignUp",
            value=dumps(
                {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "token": token,
                    "type": "email",
                }
            ),
        )

        isUserExist = await userDetails.redisStringGet()

        if isUserExist:
            return JSONResponse(
                status_code=status.HTTP_208_ALREADY_REPORTED,
                content={
                    "status": "pending",
                    "message": "User Request is Already Exist. Please check your email",
                },
            )

        if user is not None:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"status": "exist", "message": "User Already Exist"},
            )

        signupEmailStatus = signUpEmail.delay(
            [email],
            f"{get_settings().BACKEND_URL}/auth/verified-user/{email}/{token}",
            name,
        )

        if not signupEmailStatus:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"message": "Failed to send email to your email address"},
            )

        await userDetails.redisString()
        await userDetails.redisExpAt(int(time() + 60 * 60 * 24 * 30))

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "status": "success",
                "message": "Email Successfully Sent to your email address",
            },
        )
    except Exception as e:
        print(e)
        return INTERNAL_SERVER_ERROR


@authRouter.post("/login", name="login")
async def login(request: Request, email: Annotated[str, Form()]) -> JSONResponse:

    try:
        user = await get_user(email)

        if user is None or user["type"] == "gmail":
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"status": "wrong", "message": "Incorrect Email Address"},
            )

        verification_token = create_access_token(
            data={
                "email": email,
                "user_id": user["_id"],
                "secret": get_settings().VERIFICATION_JWT_SECRET,
            },
            expires_delta=timedelta(minutes=5),
        )

        userDetails = RedisString(
            key=f"{email}:Login",
            value=dumps(
                {
                    "email": email,
                    "token": verification_token,
                    "details": user,
                }
            ),
        )

        isUserExist = await userDetails.redisStringGet()

        if isUserExist:
            return JSONResponse(
                status_code=status.HTTP_208_ALREADY_REPORTED,
                content={
                    "status": "pending",
                    "message": "You Already request for Login. Please check your email",
                },
            )

        loginEmailStatus = LoginEmail.delay(
            [email],
            f"{get_settings().FRONTEND_URL}/api/auth/callback?code={verification_token}&email={email}",
            user["name"],
        )  # here going to our login page url

        if not loginEmailStatus:
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"message": "Failed to send email to your email address"},
            )

        await userDetails.redisString()
        await userDetails.redisExpAt(int(time() + 60 * 5))

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "status": "success",
                "message": "Email Successfully Sent to your email address",
            },
        )
    except Exception as e:
        print(e)
        return INTERNAL_SERVER_ERROR


@authRouter.post("/login/verification", name="login-verification")
async def verification(
    request: Request,
    authorization: Annotated[str, Header(description="Authorization token")],
    body: Annotated[VerificationType, Body()],
) -> JSONResponse:
    try:
        
        userDetails = RedisString(
            key=f"{body.email}:Login",
        )

        isUserExist = await userDetails.redisStringGet()

        if isUserExist is None:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"message": "Incorrect User Details"},
            )

        userData = loads(isUserExist)

        if (
            userData["email"] != body.email
            or f"Bearer {userData['token']}" != authorization
        ):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"message": "Incorrect User Details"},
            )

        resData = {
            "accessToken": create_access_token(
                data={
                    "email": userData["email"],
                    "user_id": userData["details"]["_id"],
                    "secret": get_settings().ACCESS_JWT_SECRET,
                },
                expires_delta=timedelta(days=get_settings().ACCESS_TOKEN_EXPIRY),
            ),
            "refreshToken": create_access_token(
                data={
                    "email": userData["email"],
                    "user_id": userData["details"]["_id"],
                    "secret": get_settings().REFRESH_JWT_SECRET,
                },
                expires_delta=timedelta(days=get_settings().REFRESH_TOKEN_EXPIRY),
            ),
            "expiresIn": (
                datetime.now() + timedelta(days=get_settings().ACCESS_TOKEN_EXPIRY)
            ).strftime("%Y-%m-%d %H:%M:%S"),
            "details": userData["details"],
        }

        await userDetails.redisDelete()

        details = await RedisString(
            key=f"{body.email}:Session", value=dumps(resData)
        ).redisString()
        await details.redisExpAt(
            int(time() + get_settings().ACCESS_TOKEN_EXPIRY * 86400)
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Successfully Login", "data": resData},
        )
    except Exception as e:
        print(e)
        return INTERNAL_SERVER_ERROR


@authRouter.post("/google/signup", name="google-signup")
async def googleSignup(
    request: Request,
    body: Annotated[GoogleType, Body()],
) -> JSONResponse:
    try:

        token = await google_tokens(
            body.code, get_settings().GOOGLE_CALLBACK_SIGNUP_URL
        )
        user_info = await google_user_info(token.get("access_token"))
        user_email = user_info.get("email")

        userDetails = await get_user(user_email)

        if userDetails is not None:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"status": "exist", "message": "User Already Exist"},
            )

        if user_info is not None:
            userData = db["demo"]["users"]

            result = userData.insert_one(
                {
                    "name": user_info.get('name'),
                    "email": user_email,
                    "phone_number": "",
                    "type": "gmail",
                    "created_at": datetime.now(),
                }
            )
            print(result)

        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content={
                "status": "success",
                "message": "Your account created Successfully",
            },
        )
    except Exception as e:
        print(e)
        return INTERNAL_SERVER_ERROR


@authRouter.post("/google/login", name="google-login")
async def googleLogin(
    request: Request,
    body: Annotated[GoogleType, Body()],
) -> JSONResponse:
    try:

        token = await google_tokens(body.code, get_settings().GOOGLE_CALLBACK_LOGIN_URL)
        user_info = await google_user_info(token.get("access_token"))
        user_email = user_info.get("email")

        userData = await get_user(user_email)

        if userData is None or userData["type"] == "email":
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"status": "error", "message": "Incorrect User Details"},
            )

        resData = {
            "accessToken": create_access_token(
                data={
                    "email": userData["email"],
                    "user_id": userData["_id"],
                    "secret": get_settings().ACCESS_JWT_SECRET,
                },
                expires_delta=timedelta(days=get_settings().ACCESS_TOKEN_EXPIRY),
            ),
            "refreshToken": create_access_token(
                data={
                    "email": userData["email"],
                    "user_id": userData["_id"],
                    "secret": get_settings().REFRESH_JWT_SECRET,
                },
                expires_delta=timedelta(days=get_settings().REFRESH_TOKEN_EXPIRY),
            ),
            "expiresIn": (
                datetime.now() + timedelta(days=get_settings().ACCESS_TOKEN_EXPIRY)
            ).strftime("%Y-%m-%d %H:%M:%S"),
            "details": userData,
        }

        details = await RedisString(
            key=f"{user_email}:Session", value=dumps(resData)
        ).redisString()
        await details.redisExpAt(
            int(time() + get_settings().ACCESS_TOKEN_EXPIRY * 86400)
        )

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Successfully Login", "data": resData},
        )

    except Exception as e:
        print(e)
        return INTERNAL_SERVER_ERROR
