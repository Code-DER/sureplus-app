from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Literal

class CharityApplicationCreate(BaseModel):
    purpose: str
    govID: str

class CharityApplicationResponse(BaseModel):
    applicationID: UUID
    userID: UUID
    purpose: Optional[str] = None
    govID: Optional[str] = None
    status: str

class CharityApplicationReview(BaseModel):
    status: Literal["approved", "rejected"]
    organizationName: Optional[str] = None
