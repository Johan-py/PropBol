import pytest
@pytest.fixture(scope="session")
def base_url():
    
    return "https://prop-bol-cicd.vercel.app/" 

@pytest.fixture(scope="session")
def auth_token():
    
    return None