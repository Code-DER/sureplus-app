from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional

# Base Models for the Users

# Model for user information
class UserResponse(BaseModel):
    userID: UUID
    firstName: str
    lastName: str
    emailAddress: EmailStr
    role: str
    phoneNumber: Optional[str] = None
    street: Optional[str] = None
    residentialName: Optional[str] = None
    barangay: Optional[str] = None
    city: Optional[str] = None

# Model for a seller sign up
class SellerSignUp(BaseModel):
    sellerType: Optional[str] = None
    companyName: Optional[str] = None

# Model for a user sign up
class UserSignUp(BaseModel):
    firstName: str
    lastName: str
    emailAddress: EmailStr
    password: str
    phoneNumber: Optional[str] = None
    street: Optional[str] = None
    residentialName: Optional[str] = None
    barangay: Optional[str] = None
    city: Optional[str] = None
    becomeSeller: bool = False
    sellerInfo: Optional[SellerSignUp] = None

# Model for the user login
class UserLogin(BaseModel):
    emailAddress: EmailStr
    password: str

# Model for the token response after login
class Token(BaseModel):
    access_token: str
    token_type: str

# Model for the response of a seller profile
class SellerRead(BaseModel):
    userID: UUID
    sellerType: str
    isVerified: bool = False
    companyName: str

    class Config:
        from_attributes = True

# Model for the response of a buyer profile
class BuyerRead(BaseModel):
    userID: UUID
    points: int

    class Config:
        from_attributes = True

# Model for updating user information
class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phoneNumber: Optional[str] = None
    street: Optional[str] = None
    residentialName: Optional[str] = None
    barangay: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True

# Model for updating seller information
class SellerUpdate(BaseModel):
    sellerType: Optional[str] = None
    companyName: Optional[str] = None

    class Config:
        from_attributes = True

# Model for changing user password
class PasswordChange(BaseModel):
    currentPassword: str
    newPassword: str =  Field(..., min_length=8)

# Model for the admin creating a new user
class AdminCreateUserRequest(BaseModel):
    firstName: str
    lastName: str
    emailAddress: EmailStr
    password: str = Field(..., min_length=8)

# Model for updating a user's role for admin only
class UpdateUserRoleRequest(BaseModel):
    role: str
    employeeID: Optional[str] = None
    adminType: Optional[str] = None