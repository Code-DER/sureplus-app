from fastapi import FastAPI
from api.users import router as users_router
from api.auth import router as auth_router
from api.products import router as products_router
from api.safety import router as safety_router

app = FastAPI(title="SurePlus API")

# Routers for the app
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(products_router, prefix="/products", tags=["Products"])
app.include_router(safety_router, prefix="/safety", tags=["Safety"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello sureplus!"}
