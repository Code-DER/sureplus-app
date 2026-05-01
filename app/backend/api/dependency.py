from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
import os

from services import auth_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def _get_jwt_secret() -> str:
    secret_key = os.getenv("JWT_SECRET_KEY")
    if not secret_key:
        raise HTTPException(status_code=500, detail="Authentication configuration is incomplete.")
    return secret_key

# To be used as a dependency in routes that require authentication.
# It decodes the JWT token and returns the userID and role of the logged in user.
# If the token is invalid or expired, it raises an HTTP 401 Unauthorized error.
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the userID and role
        payload = jwt.decode(
            token,
            _get_jwt_secret(),
            algorithms=[os.getenv("ALGORITHM", "HS256")],
        )
        user_id: str = payload.get("sub")
        token_role: str = payload.get("role")

        # Raise an error if the userID or role is missing
        if user_id is None or token_role is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials!")

        user_context = auth_service.fetch_user_auth_context(user_id)
        if not user_context or user_context.get("role") != token_role:
            raise HTTPException(status_code=401, detail="Could not validate credentials!")

        # Return the userID and role
        return {"userID": user_context["userID"], "role": user_context["role"]}
    except jwt.PyJWTError:
        # Raise an error if there is an error in decoding the token
        raise HTTPException(status_code=401, detail="Could not validate credentials!")
