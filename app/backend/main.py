from fastapi import FastAPI
from api.users import router as users_router
from api.auth import router as auth_router

app = FastAPI(title="SurePlus API")

app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

@app.get("/")
async def root():
    return {"message": "Hello sureplus!"}