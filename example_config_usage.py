"""
Example showing how the configuration system works with different values
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Example settings to demonstrate the concept."""
    
    # Default value
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    
    @property
    def allowed_hosts_list(self) -> List[str]:
        """Convert ALLOWED_HOSTS string to list."""
        return [host.strip() for host in self.ALLOWED_HOSTS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Example 1: Using default values
print("=== Example 1: Default Values ===")
settings1 = Settings()
print(f"ALLOWED_HOSTS string: {settings1.ALLOWED_HOSTS}")
print(f"allowed_hosts_list: {settings1.allowed_hosts_list}")
print()

# Example 2: With environment variable (simulated)
print("=== Example 2: With Environment Variable ===")
import os
os.environ["ALLOWED_HOSTS"] = "example.com,api.example.com,localhost"

settings2 = Settings()
print(f"ALLOWED_HOSTS string: {settings2.ALLOWED_HOSTS}")
print(f"allowed_hosts_list: {settings2.allowed_hosts_list}")
print()

# Example 3: Another example
print("=== Example 3: Another Example ===")
os.environ["ALLOWED_HOSTS"] = "  myapp.com  ,  staging.myapp.com  ,  localhost  "

settings3 = Settings()
print(f"ALLOWED_HOSTS string: '{settings3.ALLOWED_HOSTS}'")
print(f"allowed_hosts_list: {settings3.allowed_hosts_list}")
print()

# Clean up
del os.environ["ALLOWED_HOSTS"]
