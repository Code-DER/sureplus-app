import os
import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch
from uuid import uuid4

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")

from services import rating_service
from models.rating import RatingCreate, RatingUpdate

class TestRatingService(unittest.TestCase):
    @patch("services.rating_service.supabase_admin")
    def test_create_rating(self, mock_supabase):
        buyer_id = str(uuid4())
        data = RatingCreate(
            purchaseID=uuid4(),
            sellerID=uuid4(),
            rating=5,
            comment="Excellent service!"
        )
        
        rating_service.create_rating(buyer_id, data)
        
        mock_supabase.table.assert_called_with("Rating")
        # Check if insert was called with correct data including buyerID
        expected_data = data.model_dump()
        expected_data["buyerID"] = buyer_id
        mock_supabase.table().insert.assert_called_with(expected_data)

    @patch("services.rating_service.supabase_admin")
    def test_fetch_ratings_by_seller(self, mock_supabase):
        seller_id = str(uuid4())
        rating_service.fetch_ratings_by_seller(seller_id)
        
        mock_supabase.table.assert_called_with("Rating")
        mock_supabase.table().select.assert_called_with("*")
        mock_supabase.table().select().eq.assert_called_with("sellerID", seller_id)

    @patch("services.rating_service.supabase_admin")
    def test_fetch_rating_by_purchase(self, mock_supabase):
        purchase_id = str(uuid4())
        rating_service.fetch_rating_by_purchase(purchase_id)
        
        mock_supabase.table.assert_called_with("Rating")
        mock_supabase.table().select.assert_called_with("*")
        mock_supabase.table().select().eq.assert_called_with("purchaseID", purchase_id)

    @patch("services.rating_service.supabase_admin")
    def test_update_rating(self, mock_supabase):
        rating_id = str(uuid4())
        buyer_id = str(uuid4())
        data = RatingUpdate(rating=4, comment="Updated comment")
        
        # Configure the mock to return itself for chained calls
        mock_query = mock_supabase.table.return_value.update.return_value
        mock_query.eq.return_value = mock_query
        
        rating_service.update_rating(rating_id, buyer_id, data)
        
        mock_supabase.table.assert_called_with("Rating")
        mock_supabase.table().update.assert_called_with(data.model_dump(exclude_unset=True))
        
        # Check if eq was called with both conditions
        self.assertEqual(mock_query.eq.call_count, 2)
        mock_query.eq.assert_any_call("ratingID", rating_id)
        mock_query.eq.assert_any_call("buyerID", buyer_id)

if __name__ == "__main__":
    unittest.main()
