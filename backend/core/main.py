from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .config import get_settings
from .api import authRouter, verificationRouter
from fastapi.middleware.cors import CORSMiddleware

DEBUG = get_settings().DEBUG

# def serverShutDown():
#     logging.error("Server Shutting Down")

origins = [
    # "http://localhost:8000",
    "*"
]

app = FastAPI(
    debug=bool(DEBUG),
    title="DEMO",
    summary="Please write Summary here",
    description="Please write descripton here",
    version="0.0.1",
    openapi_url="/api/v1/openapi.json" if DEBUG else None,
    docs_url="/api/v1/docs" if DEBUG else None,
    redoc_url="/api/v1/redoc" if DEBUG else None,
    # on_shutdown=[serverShutDown],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# routers
app.include_router(authRouter)
app.include_router(verificationRouter)
