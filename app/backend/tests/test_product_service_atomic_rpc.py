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

from services import product_service  # noqa: E402


class ProductServiceAtomicRpcTests(unittest.TestCase):
    def test_create_food_uses_atomic_rpc_for_food_and_allergens(self):
        rpc_query = object()
        supabase_admin = Mock()
        supabase_admin.rpc.return_value = rpc_query

        food_data = {
            "foodName": "Rice meal",
            "price": "75.00",
            "stockQuantity": 2,
            "allergenIDs": ["allergen-1"],
        }

        with (
            patch.object(product_service, "supabase_admin", supabase_admin),
            patch.object(product_service, "_validate_allergen_ids", return_value=["allergen-1"]),
            patch.object(
                product_service,
                "_execute",
                return_value=SimpleNamespace(data=[{"foodID": "food-1"}]),
            ) as execute,
            patch.object(product_service, "get_food", return_value={"foodID": "food-1"}) as get_food,
        ):
            result = product_service.create_food("seller-1", food_data)

        self.assertEqual(result, {"foodID": "food-1"})
        supabase_admin.rpc.assert_called_once_with(
            "create_food_with_allergens",
            {
                "food_data": {
                    "foodName": "Rice meal",
                    "price": "75.00",
                    "stockQuantity": 2,
                    "userID": "seller-1",
                },
                "allergen_ids": ["allergen-1"],
            },
        )
        execute.assert_called_once_with(rpc_query, "Failed to create food listing")
        get_food.assert_called_once_with("food-1", user_id="seller-1")

    def test_update_food_replaces_allergens_with_atomic_rpc(self):
        rpc_query = object()
        supabase_admin = Mock()
        supabase_admin.rpc.return_value = rpc_query

        with (
            patch.object(product_service, "supabase_admin", supabase_admin),
            patch.object(
                product_service,
                "get_food",
                side_effect=[
                    {"foodID": "food-1", "userID": "seller-1"},
                    {"foodID": "food-1", "userID": "seller-1"},
                ],
            ),
            patch.object(product_service, "_validate_allergen_ids", return_value=["allergen-2"]),
            patch.object(product_service, "_execute") as execute,
        ):
            result = product_service.update_food(
                "seller-1",
                "food-1",
                {"allergenIDs": ["allergen-2"]},
            )

        self.assertEqual(result, {"foodID": "food-1", "userID": "seller-1"})
        supabase_admin.rpc.assert_called_once_with(
            "replace_food_allergens",
            {"target_food_id": "food-1", "allergen_ids": ["allergen-2"]},
        )
        execute.assert_called_once_with(rpc_query, "Failed to replace food allergens")

    def test_replace_user_allergies_uses_atomic_rpc(self):
        rpc_query = object()
        supabase_admin = Mock()
        supabase_admin.rpc.return_value = rpc_query

        with (
            patch.object(product_service, "supabase_admin", supabase_admin),
            patch.object(product_service, "_validate_allergen_ids", return_value=["allergen-3"]),
            patch.object(product_service, "_execute") as execute,
            patch.object(
                product_service,
                "get_user_allergies",
                return_value={"userID": "user-1", "allergens": []},
            ),
        ):
            result = product_service.replace_user_allergies("user-1", ["allergen-3"])

        self.assertEqual(result, {"userID": "user-1", "allergens": []})
        supabase_admin.rpc.assert_called_once_with(
            "replace_user_allergies",
            {"target_user_id": "user-1", "allergen_ids": ["allergen-3"]},
        )
        execute.assert_called_once_with(rpc_query, "Failed to replace user allergies")


if __name__ == "__main__":
    unittest.main()