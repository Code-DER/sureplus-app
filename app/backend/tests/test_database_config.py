import importlib
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))


class DatabaseConfigTests(unittest.TestCase):
    def tearDown(self):
        sys.modules.pop("database", None)

    def test_missing_service_role_key_fails_fast(self):
        sys.modules.pop("database", None)

        env = {
            "SUPABASE_URL": "http://localhost:54321",
            "SUPABASE_ANON_KEY": "test-anon-key",
            "SUPABASE_SERVICE_ROLE_KEY": "",
        }

        with (
            patch.dict(os.environ, env, clear=True),
            self.assertRaisesRegex(RuntimeError, "SUPABASE_SERVICE_ROLE_KEY"),
        ):
            importlib.import_module("database")


if __name__ == "__main__":
    unittest.main()