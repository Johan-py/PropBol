import pytest
import os
from dotenv import load_dotenv

load_dotenv()

@pytest.fixture(scope="session")
def base_url():
    return os.getenv("API_URL", "http://localhost:5000")

@pytest.fixture(scope="session")
def auth_token(base_url):
    """
    Hace login una vez y reutiliza el token en todos los tests que lo necesiten.
    Ajusta el email/password a un usuario de prueba que tengas en tu DB de test.
    """
    import requests
    response = requests.post(f"{base_url}/api/auth/login", json={
        "email": os.getenv("TEST_USER_EMAIL", "test@test.com"),
        "password": os.getenv("TEST_USER_PASSWORD", "password123")
    })
    if response.status_code == 200:
        return response.json().get("token") or response.headers.get("set-cookie")
    return None