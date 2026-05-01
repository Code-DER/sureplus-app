import os
import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import patch

import jwt
from fastapi import HTTPException


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")
os.environ.setdefault("ALGORITHM", "HS256")

from api import dependency  # noqa: E402


def make_token(secret: str, role: str = "seller") -> str:
    payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


class AuthDependencyTests(unittest.TestCase):
    def test_rejects_token_signed_with_supabase_anon_key(self):
        with patch.dict(os.environ, {"JWT_SECRET_KEY": "private-test-secret"}):
            forged_token = make_token("test-anon-key", role="admin")

            with self.assertRaises(HTTPException) as context:
                dependency.get_current_user(token=forged_token)

        self.assertEqual(context.exception.status_code, 401)

    def test_rejects_token_role_that_does_not_match_database(self):
        token = make_token("private-test-secret", role="admin")

        with (
            patch.dict(os.environ, {"JWT_SECRET_KEY": "private-test-secret"}),
            patch.object(
                dependency.auth_service,
                "fetch_user_auth_context",
                return_value={
                    "userID": "00000000-0000-0000-0000-000000000001",
                    "role": "seller",
                },
            ),
            self.assertRaises(HTTPException) as context,
        ):
            dependency.get_current_user(token=token)

        self.assertEqual(context.exception.status_code, 401)

    def test_accepts_token_role_that_matches_database(self):
        token = make_token("private-test-secret", role="seller")

        with (
            patch.dict(os.environ, {"JWT_SECRET_KEY": "private-test-secret"}),
            patch.object(
                dependency.auth_service,
                "fetch_user_auth_context",
                return_value={
                    "userID": "00000000-0000-0000-0000-000000000001",
                    "role": "seller",
                },
            ),
        ):
            current_user = dependency.get_current_user(token=token)

        self.assertEqual(
            current_user,
            {
                "userID": "00000000-0000-0000-0000-000000000001",
                "role": "seller",
            },
        )


if __name__ == "__main__":
    unittest.main()
