from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# To be used as a dependency in routes that require authentication.
# It decodes the JWT token and returns the userID and role of the logged in user.
# If the token is invalid or expired, it raises an HTTP 401 Unauthorized error.
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, os.getenv("SUPABASE_ANON_KEY"), algorithms=[os.getenv("ALGORITHM")])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials!")
        return {"userID": user_id, "role": role}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials!")