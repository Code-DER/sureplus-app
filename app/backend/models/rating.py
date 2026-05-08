from pydantic import BaseModel, Field

class RatingCreate(BaseModel):
    purchaseID: str
    rating: int = Field(ge=1, le=5)
    comment: str | None = None