from typing import List, Optional
from pydantic import BaseModel


class ReportsAccounting(BaseModel):
    grossSales: float
    platformMarkupRate: float
    platformEarnings: float
    subscriptionFees: float
    totalEarnings: float


class ReportsInventory(BaseModel):
    sold: int
    donated: int
    innovator: int
    composted: int


class ReportsOverviewResponse(BaseModel):
    accounting: ReportsAccounting
    inventory: ReportsInventory
    notes: List[str]


class ReportsTransactionRow(BaseModel):
    purchaseID: str
    totalPrice: float
    purchaseDate: Optional[str] = None
    status: str
    userID: str
    quantity: int = 0
    foodID: Optional[str] = None


class ReportsTransactionsResponse(BaseModel):
    transactions: List[ReportsTransactionRow]
    total: int
    page: int
    limit: int
