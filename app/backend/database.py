import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

class BackendConfigurationError(RuntimeError):
    pass


def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise BackendConfigurationError(f"{name} is required for backend database access.")
    return value


url: str = _require_env("SUPABASE_URL")
key: str = _require_env("SUPABASE_ANON_KEY")
service_key: str = _require_env("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)
supabase_admin: Client = create_client(url, service_key)
