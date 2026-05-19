from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Literal

# Model for Creating a Charity Application
class CharityApplicationCreate(BaseModel):
    purpose: str
    govID: str
    secRegistration: Optional[str] = None

# Model for the response of a Charity Application
class CharityApplicationResponse(BaseModel):
    applicationID: UUID
    userID: UUID
    purpose: str
    govID: str
    secRegistration: Optional[str] = None
    status: str

# Model for Reviewing a Charity Application
class CharityApplicationReview(BaseModel):
    status: Literal["approved", "rejected"]
    organizationName: Optional[str] = None
