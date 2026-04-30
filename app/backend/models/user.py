from pydantic import BaseModel, EmailStr
from uuid import UUID

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

class UserSignUp(BaseModel):
    firstName: str
    lastName: str
    emailAddress: EmailStr
    password: str
    phoneNumber: str
    role: str = "buyer"
    street: str
    residentialName: str
    barangay: str
    city: str

class UserLogin(BaseModel):
    emailAddress: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str