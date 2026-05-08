import os
import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")

from services import purchase_service
from models.purchase import PurchaseCreateWithItems, PurchaseItemCreate
from uuid import uuid4

class TestPurchaseService(unittest.TestCase):
    @patch("services.purchase_service.supabase_admin")
    @patch("services.purchase_service.social_impact_service")
    def test_create_purchase(self, mock_social_impact, mock_supabase):
        # Mocking the database responses
        purchase_id = str(uuid4())
        mock_supabase.table.return_value.insert.return_value.execute.side_effect = [
            Mock(data=[{"purchaseID": purchase_id}]), # Purchase insert
            Mock(data=[{"purchaseID": purchase_id, "foodID": "food1"}]), # PurchaseItems insert
            Mock(data=[{"purchaseID": purchase_id, "status": "completed"}]) # Purchase update (complete)
        ]
        
        data = PurchaseCreateWithItems(
            paymentMethod="GCash",
            totalPrice=100.0,
            items=[
                PurchaseItemCreate(foodID=uuid4(), quantity=2, totalPerItem=50.0)
            ]
        )
        
        user_id = str(uuid4())
        result = purchase_service.create_purchase(user_id, data)
        
        self.assertIsNotNone(result)
        self.assertEqual(result["purchaseID"], purchase_id)
        mock_social_impact.create_impact.assert_called_with(purchase_id)

    @patch("services.purchase_service.supabase_admin")
    def test_fetch_all_purchases(self, mock_supabase):
        user_id = str(uuid4())
        purchase_service.fetch_all_purchases(user_id)
        mock_supabase.table.assert_called_with("Purchase")
        mock_supabase.table().select.assert_called_with("*")
        mock_supabase.table().select().eq.assert_called_with("userID", user_id)

    @patch("services.purchase_service.supabase_admin")
    def test_fetch_purchase_by_id(self, mock_supabase):
        purchase_id = str(uuid4())
        purchase_service.fetch_purchase_by_id(purchase_id)
        mock_supabase.table.assert_called_with("Purchase")
        mock_supabase.table().select.assert_called_with("*, PurchaseItems(*, Food(*))")
        mock_supabase.table().select().eq.assert_called_with("purchaseID", purchase_id)

    @patch("services.purchase_service.supabase_admin")
    def test_cancel_purchase(self, mock_supabase):
        purchase_id = str(uuid4())
        # Configure the mock to return itself for chained calls
        mock_query = mock_supabase.table.return_value.update.return_value
        mock_query.eq.return_value = mock_query
        
        purchase_service.cancel_purchase(purchase_id)
        
        mock_supabase.table.assert_called_with("Purchase")
        mock_supabase.table().update.assert_called_with({"status": "cancelled"})
        
        # Check if eq was called with both conditions
        self.assertEqual(mock_query.eq.call_count, 2)
        mock_query.eq.assert_any_call("purchaseID", purchase_id)
        mock_query.eq.assert_any_call("status", "pending")

if __name__ == "__main__":
    unittest.main()
