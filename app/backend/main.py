from fastapi import FastAPI
from api.users import router as users_router

app = FastAPI(title="SurePlus API")

app.include_router(users_router, prefix="/users", tags=["Users"])

@app.get("/")
async def root():
    return {"message": "Hello sureplus!"}