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
        # Decode the JWT token to get the userID and role
        payload = jwt.decode(token, os.getenv("SUPABASE_ANON_KEY"), algorithms=[os.getenv("ALGORITHM")])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")

        # Raise an error if the userID or role is missing
        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials!")
        
        # Return the userID and role
        return {"userID": user_id, "role": role}
    except jwt.PyJWTError:
        # Raise an error if there is an error in decoding the token
        raise HTTPException(status_code=401, detail="Could not validate credentials!")