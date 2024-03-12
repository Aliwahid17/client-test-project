from secrets import token_hex
from datetime import datetime, timedelta, timezone
from core.config import get_settings
from jose import jwt


def generate_token(length: int) -> str:
    return token_hex(length)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, get_settings().SECRET_KEY, algorithm=get_settings().ALGORITHM
    )
    return encoded_jwt



def get_email_from_token(token):
    try:
       
        payload=jwt.decode(token,get_settings().SECRET_KEY,algorithms=[get_settings().ALGORITHM], options={"verify_exp": False})
        
        # payload = jwt.decode(token,get_settings().SECRET_KEY, algorithms=get_settings().ALGORITHM)
        return payload.get('email', None)
    except Exception as e:
        print(e)
        return None
