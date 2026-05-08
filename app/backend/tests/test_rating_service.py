import os
import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
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
        purchase_id = str(uuid4())
        seller_id = str(uuid4())
        food_id = str(uuid4())
        
        data = RatingCreate(
            purchaseID=purchase_id,
            sellerID=seller_id,
            rating=5,
            comment="Excellent service!"
        )
        
        # Setup chained mock
        mock_table = MagicMock()
        mock_supabase.table.return_value = mock_table
        
        mock_query = MagicMock()
        mock_table.select.return_value = mock_query
        mock_table.insert.return_value = mock_query
        
        mock_query.eq.return_value = mock_query
        mock_query.single.return_value = mock_query
        mock_query.maybe_single.return_value = mock_query
        mock_query.in_.return_value = mock_query
        
        # Configure execution side effects
        mock_query.execute.side_effect = [
            Mock(data={"userID": buyer_id, "status": "completed"}), # Purchase check
            Mock(data=[]), # Duplicate rating check
            Mock(data=[{"foodID": food_id}]), # PurchaseItems check
            Mock(data={"userID": seller_id}), # Food/Seller check
            Mock(data=[{"ratingID": "new-rating-id"}]) # Final insert
        ]
        
        rating_service.create_rating(buyer_id, data)
        
        # Check if insert was called
        mock_table.insert.assert_called()

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
        
        mock_table = MagicMock()
        mock_supabase.table.return_value = mock_table
        mock_query = MagicMock()
        mock_table.update.return_value = mock_query
        mock_query.eq.return_value = mock_query
        
        rating_service.update_rating(rating_id, buyer_id, data)
        
        mock_supabase.table.assert_called_with("Rating")
        mock_table.update.assert_called_with(data.model_dump(exclude_unset=True))
        self.assertEqual(mock_query.eq.call_count, 2)

if __name__ == "__main__":
    unittest.main()
