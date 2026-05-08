import os
import sys
import unittest
import math
from pathlib import Path
from unittest.mock import Mock, patch

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")

from services import social_impact_service

class TestSocialImpactService(unittest.TestCase):
    
    def test_compute_metrics_with_items(self):
        # Setup mock data for purchase items
        # Case 1: Multiple items with different weights
        mock_items = [
            {"quantity": 2, "Food": {"weightKg": 0.5}},  # 1.0 kg
            {"quantity": 1, "Food": {"weightKg": 2.0}},  # 2.0 kg
            {"quantity": 3, "Food": None}                # 3 * 0.5 = 1.5 kg (default)
        ]
        # Total rescued = 1.0 + 2.0 + 1.5 = 4.5 kg
        
        with patch("services.social_impact_service.supabase_admin") as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = Mock(data=mock_items)
            
            purchase_id = "test-purchase-id"
            metrics = social_impact_service.compute_metrics(purchase_id)
            
            expected_rescued = 4.5
            expected_carbon = 4.5 * 2.5 # CO2_PER_KG = 2.5
            expected_people = math.floor(4.5 / 0.5) # KG_PER_MEAL = 0.5
            
            self.assertEqual(metrics["rescuedKilos"], expected_rescued)
            self.assertEqual(metrics["carbonOffset"], expected_carbon)
            self.assertEqual(metrics["peopleFed"], expected_people)
            self.assertEqual(metrics["purchaseID"], purchase_id)

    def test_compute_metrics_empty(self):
        with patch("services.social_impact_service.supabase_admin") as mock_supabase:
            mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = Mock(data=[])
            
            purchase_id = "empty-purchase"
            metrics = social_impact_service.compute_metrics(purchase_id)
            
            self.assertEqual(metrics["rescuedKilos"], 0)
            self.assertEqual(metrics["carbonOffset"], 0)
            self.assertEqual(metrics["peopleFed"], 0)

    @patch("services.social_impact_service.compute_metrics")
    @patch("services.social_impact_service.supabase_admin")
    def test_create_impact(self, mock_supabase, mock_compute):
        mock_compute.return_value = {"purchaseID": "p1", "carbonOffset": 10, "rescuedKilos": 4, "peopleFed": 8}
        
        social_impact_service.create_impact("p1")
        
        mock_supabase.table.assert_called_with("SocialImpact")
        mock_supabase.table().insert.assert_called_with(mock_compute.return_value)

    @patch("services.social_impact_service.supabase_admin")
    def test_fetch_summary_by_user(self, mock_supabase):
        mock_rows = [
            {"carbonOffset": 5.0, "rescuedKilos": 2.0, "peopleFed": 4},
            {"carbonOffset": 7.5, "rescuedKilos": 3.0, "peopleFed": 6}
        ]
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = Mock(data=mock_rows)
        
        user_id = "user123"
        summary = social_impact_service.fetch_summary_by_user(user_id)
        
        self.assertEqual(summary["totalCarbonOffset"], 12.5)
        self.assertEqual(summary["totalRescuedKilos"], 5.0)
        self.assertEqual(summary["totalPeopleFed"], 10)
        self.assertEqual(summary["purchaseCount"], 2)

if __name__ == "__main__":
    unittest.main()
