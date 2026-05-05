from fastapi import FastAPI
from api.users import router as users_router
from api.auth import router as auth_router
from api.notifications import router as notifications_router
from api.charity_applications import router as charity_applications_router
from api.charities import router as charities_router
from api.charity_posts import router as charity_posts_router
from api.social_impact import router as social_impact_router

app = FastAPI(title="SurePlus API")

# Routers for the app
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
app.include_router(charity_applications_router, prefix="/charity-applications", tags=["Charity Applications"])
app.include_router(charities_router, prefix="/charities", tags=["Charities"])
app.include_router(charity_posts_router, prefix="/charity-posts", tags=["Charity Posts"])
app.include_router(social_impact_router, prefix="/social-impact", tags=["Social Impact"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello sureplus!"}
