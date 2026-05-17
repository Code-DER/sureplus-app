import unittest
from unittest.mock import patch, MagicMock
import os
import sys
from pathlib import Path

# Set up paths
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Mock environment variables for database import
os.environ["SUPABASE_URL"] = "http://localhost:54321"
os.environ["SUPABASE_ANON_KEY"] = "test-key"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "test-key"

from services.social_impact_service import fetch_summary_by_user

class TestSocialImpactB3(unittest.TestCase):
    @patch("services.social_impact_service.supabase_admin")
    def test_fetch_summary_by_user_success(self, mock_supabase):
        user_id = "test-user-id"
        purchase_ids = ["p1", "p2"]
        
        # Mock Step 1: Purchase lookup
        mock_purchase_query = MagicMock()
        mock_purchase_query.select.return_value.eq.return_value.execute.return_value.data = [
            {"purchaseID": "p1"}, {"purchaseID": "p2"}
        ]
        
        # Mock Step 2: SocialImpact lookup
        mock_impact_query = MagicMock()
        mock_impact_query.select.return_value.in_.return_value.execute.return_value.data = [
            {"carbonOffset": 1.0, "rescuedKilos": 2.0, "peopleFed": 3},
            {"carbonOffset": 4.0, "rescuedKilos": 5.0, "peopleFed": 6}
        ]
        
        # Set up side effects for table() calls
        def table_side_effect(table_name):
            if table_name == "Purchase":
                return mock_purchase_query
            if table_name == "SocialImpact":
                return mock_impact_query
            return MagicMock()
            
        mock_supabase.table.side_effect = table_side_effect
        
        result = fetch_summary_by_user(user_id)
        
        # Assertions
        self.assertEqual(result["totalCarbonOffset"], 5.0)
        self.assertEqual(result["totalRescuedKilos"], 7.0)
        self.assertEqual(result["totalPeopleFed"], 9)
        self.assertEqual(result["purchaseCount"], 2)
        
        mock_supabase.table.assert_any_call("Purchase")
        mock_supabase.table.assert_any_call("SocialImpact")

    @patch("services.social_impact_service.supabase_admin")
    def test_fetch_summary_by_user_no_purchases(self, mock_supabase):
        user_id = "test-user-id"
        
        # Mock Step 1: No purchases found
        mock_purchase_query = MagicMock()
        mock_purchase_query.select.return_value.eq.return_value.execute.return_value.data = []
        
        mock_supabase.table.return_value = mock_purchase_query
        
        result = fetch_summary_by_user(user_id)
        
        # Assertions
        self.assertEqual(result["purchaseCount"], 0)
        self.assertEqual(result["totalCarbonOffset"], 0.0)
        # Should NOT call SocialImpact table if no purchases
        self.assertNotIn("SocialImpact", [call.args[0] for call in mock_supabase.table.call_args_list])

if __name__ == "__main__":
    unittest.main()
