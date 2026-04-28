from pydantic import BaseModel, EmailStr
from uuid import UUID

class UserSignUp(BaseModel):
    firstName: str
    lastName: str
    emailAddress: EmailStr
    password: str
    role: str
    street: str
    residentialName: str
    barangay: str
    city: str

class UserResponse(BaseModel):
    userID: UUID
    firstName: str
    lastName: str
    emailAddress: EmailStr