import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

# Set up paths
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Mock environment variables
os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")

from fastapi import HTTPException
from api.users import get_my_profile, get_user_by_id

class TestUsersAPI(unittest.IsolatedAsyncioTestCase):
    @patch("api.users.supabase_admin")
    async def test_get_my_profile_success(self, mock_supabase_admin):
        # Setup mock user data
        mock_user_data = {
            "firstName": "John",
            "lastName": "Doe",
            "role": "buyer",
            "emailAddress": "john@example.com"
        }
        
        # Configure mock supabase response
        mock_execute = MagicMock()
        mock_execute.data = [mock_user_data]
        
        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_execute
        
        # Call the function
        current_user = {"userID": "test-uuid", "role": "buyer"}
        result = await get_my_profile(current_user=current_user)
        
        # Assertions
        self.assertEqual(result, mock_user_data)
        mock_supabase_admin.table.assert_called_with("User")
        
    @patch("api.users.supabase_admin")
    async def test_get_my_profile_not_found(self, mock_supabase_admin):
        # Configure mock supabase response with empty data
        mock_execute = MagicMock()
        mock_execute.data = []
        
        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_execute
        
        # Call the function and expect 404
        current_user = {"userID": "test-uuid", "role": "buyer"}
        with self.assertRaises(HTTPException) as context:
            await get_my_profile(current_user=current_user)
            
        self.assertEqual(context.exception.status_code, 404)
        self.assertEqual(context.exception.detail, "User not found!")

    @patch("api.users.user_service")
    async def test_get_user_by_id_success(self, mock_user_service):
        mock_user_data = {"userID": "test-uuid", "firstName": "John"}
        mock_response = MagicMock()
        mock_response.data = [mock_user_data]
        mock_user_service.fetch_user_by_id.return_value = mock_response
        
        result = await get_user_by_id(user_id="test-uuid", current_user={"userID": "other", "role": "admin"})
        self.assertEqual(result, mock_user_data)

    @patch("api.users.user_service")
    async def test_get_user_by_id_not_found(self, mock_user_service):
        mock_response = MagicMock()
        mock_response.data = []
        mock_user_service.fetch_user_by_id.return_value = mock_response
        
        with self.assertRaises(HTTPException) as context:
            await get_user_by_id(user_id="test-uuid", current_user={"userID": "other", "role": "admin"})
        self.assertEqual(context.exception.status_code, 404)

if __name__ == "__main__":
    unittest.main()
