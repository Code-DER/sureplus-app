import os
import sys
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")

from services import charity_post_service, purchase_service  # noqa: E402

class CharityPostServiceF10Tests(unittest.TestCase):
    # ... (existing test)
    def test_donate_purchased_food_calls_new_rpc(self):
        rpc_query = object()
        supabase_admin = Mock()
        supabase_admin.rpc.return_value = rpc_query

        post_id = "post-1"
        purchase_id = "purchase-1"
        food_id = "food-1"
        quantity = 2

        with (
            patch.object(charity_post_service, "supabase_admin", supabase_admin),
            patch.object(
                charity_post_service,
                "_execute",
                return_value=SimpleNamespace(data=[{"charityID": post_id}]),
            ) as execute
        ):
            result = charity_post_service.donate_purchased_food(
                post_id, purchase_id, food_id, quantity
            )

        self.assertEqual(result.data, [{"charityID": post_id}])
        supabase_admin.rpc.assert_called_once_with(
            "donate_purchased_food_to_post",
            {
                "p_post_id": post_id,
                "p_purchase_id": purchase_id,
                "p_food_id": food_id,
                "p_quantity": quantity
            },
        )
        execute.assert_called_once_with(rpc_query, "Failed to process purchased food donation")

    def test_get_buyer_food_list_returns_formatted_data(self):
        supabase_admin = Mock()
        
        # Mock 1: fetch purchases
        purchases_res = SimpleNamespace(data=[{"purchaseID": "p-1"}])
        
        # Mock 2: fetch purchase items joined with Food
        items_res = SimpleNamespace(data=[
            {
                "purchaseID": "p-1",
                "foodID": "f-1",
                "quantity": 10,
                "donatedQuantity": 2,
                "totalPerItem": 100.0,
                "Food": {
                    "foodName": "Apple",
                    "description": "Red apple",
                    "picture": "apple.png",
                    "weightKg": 0.2,
                    "expirationDate": "2026-06-01"
                }
            }
        ])

        with (
            patch.object(purchase_service, "supabase_admin", supabase_admin),
            patch.object(purchase_service, "_execute", side_effect=[purchases_res, items_res])
        ):
            results = purchase_service.get_buyer_food_list("user-1")

        self.assertEqual(len(results), 1)
        item = results[0]
        self.assertEqual(item["foodName"], "Apple")
        self.assertEqual(item["donatableQuantity"], 8)
        self.assertEqual(item["pricePaid"], 10.0)

if __name__ == "__main__":
    unittest.main()
