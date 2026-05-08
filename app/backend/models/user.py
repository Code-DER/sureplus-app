from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional

# Base Models for the Users

class UserResponse(BaseModel):
    userID: UUID
    firstName: str
    lastName: str
    emailAddress: EmailStr
    role: str
    street: str
    residentialName: str
    barangay: str
    city: str

class SellerSignUp(BaseModel):
    sellerType: Optional[str] = None
    companyName: Optional[str] = None

class UserSignUp(BaseModel):
    firstName: str
    lastName: str
    emailAddress: EmailStr
    password: str
    phoneNumber: str
    street: str
    residentialName: str
    barangay: str
    city: str
    becomeSeller: bool = False
    sellerInfo: Optional[SellerSignUp] = None

class UserLogin(BaseModel):
    emailAddress: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class UserUpdate(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    emailAddress: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None
    street: Optional[str] = None
    residentialName: Optional[str] = None
    barangay: Optional[str] = None
    city: Optional[str] = None

class PasswordChange(BaseModel):
    currentPassword: str
    newPassword: str
