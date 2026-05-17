from pydantic import BaseModel


class SellerVerificationUpdateRequest(BaseModel):
    isVerified: bool


class SellerVerificationUpdateResponse(BaseModel):
    message: str
    userID: str
    isVerified: bool
