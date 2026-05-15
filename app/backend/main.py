import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.users import router as users_router
from api.sellers import router as sellers_router
from api.buyers import router as buyers_router
from api.auth import router as auth_router
from api.products import router as products_router
from api.safety import router as safety_router
from api.notifications import router as notifications_router
from api.purchases import router as purchases_router
from api.ratings import router as ratings_router
from api.charity_applications import router as charity_applications_router
from api.charities import router as charities_router
from api.charity_posts import router as charity_posts_router
from api.social_impact import router as social_impact_router
from api.admin_activity import router as admin_activity_router
from api.uploads import router as uploads_router

app = FastAPI(title="SurePlus API")

def _cors_origins() -> list[str]:
    configured = os.getenv(
        "BACKEND_CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173",
    )
    return [origin.strip() for origin in configured.split(",") if origin.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Routers for the app
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(buyers_router, prefix="/buyers", tags=["Buyers"])
app.include_router(sellers_router, prefix="/sellers", tags=["Sellers"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(products_router, prefix="/products", tags=["Products"])
app.include_router(safety_router, prefix="/safety", tags=["Safety"])
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
app.include_router(purchases_router, prefix="/purchases", tags=["Purchases"])
app.include_router(ratings_router, prefix="/ratings", tags=["Ratings"])
app.include_router(charity_applications_router, prefix="/charity-applications", tags=["Charity Applications"])
app.include_router(charities_router, prefix="/charities", tags=["Charities"])
app.include_router(charity_posts_router, prefix="/charity-posts", tags=["Charity Posts"])
app.include_router(social_impact_router, prefix="/social-impact", tags=["Social Impact"])
app.include_router(admin_activity_router, prefix="/admin-activity", tags=["Admin Activity"])
app.include_router(uploads_router, prefix="/uploads", tags=["Uploads"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello sureplus!"}
