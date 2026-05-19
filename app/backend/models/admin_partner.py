from pydantic import BaseModel

# Model for Seller Verification Update Request
class SellerVerificationUpdateRequest(BaseModel):
    isVerified: bool

# Model for Seller Verification Update Response
class SellerVerificationUpdateResponse(BaseModel):
    message: str
    userID: str
    isVerified: bool
