from pydantic import BaseModel, Field


class VerificationType(BaseModel):
    email: str = Field(default=None, title="User Email")

class GoogleType(BaseModel):
    code: str = Field(default=None, title="Google ID Token")
