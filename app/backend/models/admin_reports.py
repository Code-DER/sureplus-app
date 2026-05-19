from typing import List, Optional
from pydantic import BaseModel

# Model for Accounting Report
class ReportsAccounting(BaseModel):
    grossSales: float
    platformMarkupRate: float
    platformEarnings: float
    subscriptionFees: float
    totalEarnings: float

# Model for Inventory Reports
class ReportsInventory(BaseModel):
    sold: int
    donated: int
    innovator: int
    composted: int

# Model for the response of Report Overview
class ReportsOverviewResponse(BaseModel):
    accounting: ReportsAccounting
    inventory: ReportsInventory
    notes: List[str]

# Model for Transactions Report
class ReportsTransactionRow(BaseModel):
    purchaseID: str
    totalPrice: float
    purchaseDate: Optional[str] = None
    status: str
    userID: str
    quantity: int = 0
    foodID: Optional[str] = None

# Model for Transactions Report Response
class ReportsTransactionsResponse(BaseModel):
    transactions: List[ReportsTransactionRow]
    total: int
    page: int
    limit: int
