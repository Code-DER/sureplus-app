from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

# Model for Admin Activity Logs
class AdminActivityResponse(BaseModel):
    activityID: UUID
    userID: UUID
    actionType: Optional[str] = None
    description: Optional[str] = None
    timestamp: datetime
    targetID: Optional[str] = None
    targetEntity: Optional[str] = None
