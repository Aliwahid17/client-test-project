from fastapi.responses import JSONResponse
from fastapi import status


INTERNAL_SERVER_ERROR = JSONResponse(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    content={"message": "Internal Server Error"},
)
