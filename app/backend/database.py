import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load variables from .env
load_dotenv()

# Custom error for missing env variables
class BackendConfigurationError(RuntimeError):
    pass

# Helper function to get required env variables
def _require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise BackendConfigurationError(f"{name} is required for backend database access.")
    return value

# Initialize Supabase clients for both public and admin access
url: str = _require_env("SUPABASE_URL")
key: str = _require_env("SUPABASE_ANON_KEY")
service_key: str = _require_env("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(url, key)
supabase_admin: Client = create_client(url, service_key)
