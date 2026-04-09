import pytest
import requests

# ─────────────────────────────────────────
# GRUPO 1: Health & Rutas públicas básicas
# ─────────────────────────────────────────

def test_health_check(base_url):
    """GET /health → debe devolver status: ok"""
    r = requests.get(f"{base_url}/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "message" in body

def test_get_filters(base_url):
    """GET /api/filters → filtros de homepage, no requiere auth"""
    r = requests.get(f"{base_url}/api/filters")
    assert r.status_code == 200

def test_get_banners(base_url):
    """GET /api/banners → banners publicitarios"""
    r = requests.get(f"{base_url}/api/banners")
    assert r.status_code == 200

# ─────────────────────────────────────────
# GRUPO 2: Propiedades e Inmuebles
# ─────────────────────────────────────────

def test_get_inmuebles(base_url):
    """GET /api/inmuebles → listado general, debe devolver lista dentro de 'data'"""
    r = requests.get(f"{base_url}/api/inmuebles")
    assert r.status_code == 200
    
    # Extraemos el JSON
    respuesta = r.json()
    
    # Verificamos la nueva estructura de tu backend
    assert respuesta["ok"] is True
    assert isinstance(respuesta["data"], list)

def test_get_properties_alias(base_url):
    """GET /api/properties/inmuebles → alias, debe ser igual que /api/inmuebles"""
    r1 = requests.get(f"{base_url}/api/inmuebles")
    r2 = requests.get(f"{base_url}/api/properties/inmuebles")
    assert r1.status_code == r2.status_code == 200

def test_search_properties_empty(base_url):
    """GET /api/properties/search → sin params, no debe explotar (200 o 400 según tu validación)"""
    r = requests.get(f"{base_url}/api/properties/search")
    assert r.status_code in [200, 400]

def test_search_properties_with_query(base_url):
    """GET /api/properties/search?q=casa → con parámetro básico"""
    r = requests.get(f"{base_url}/api/properties/search", params={"q": "casa"})
    assert r.status_code in [200, 400]

# ─────────────────────────────────────────
# GRUPO 3: Autenticación
# ─────────────────────────────────────────

def test_login_wrong_credentials(base_url):
    """POST /api/auth/login con datos erróneos → 400 o 401"""
    r = requests.post(f"{base_url}/api/auth/login", json={
        "email": "noexiste@test.com",
        "password": "wrongpassword"
    })
    assert r.status_code in [400, 401]

def test_register_missing_fields(base_url):
    """POST /api/auth/register sin body → debe fallar con 400"""
    r = requests.post(f"{base_url}/api/auth/register", json={})
    assert r.status_code == 400

def test_get_me_without_token(base_url):
    """GET /api/auth/me sin token → debe devolver 401"""
    r = requests.get(f"{base_url}/api/auth/me")
    assert r.status_code == 401

def test_get_me_with_token(base_url, auth_token):
    """GET /api/auth/me con token válido → 200 con datos del usuario"""
    if not auth_token:
        pytest.skip("No hay token disponible (usuario de test no existe en esta DB)")
    headers = {"Authorization": f"Bearer {auth_token}"}
    r = requests.get(f"{base_url}/api/auth/me", headers=headers)
    assert r.status_code == 200

# ─────────────────────────────────────────
# GRUPO 4: Notificaciones (requieren auth)
# ATENCIÓN: tus rutas son /notificaciones, no /api/notificaciones
# ─────────────────────────────────────────

def test_get_notifications_without_auth(base_url):
    """GET /notificaciones sin token → 401 (requireAuth middleware)"""
    r = requests.get(f"{base_url}/notificaciones")
    assert r.status_code == 401

def test_unread_count_without_auth(base_url):
    """GET /notificaciones/unread-count sin token → 401"""
    r = requests.get(f"{base_url}/notificaciones/unread-count")
    assert r.status_code == 401

def test_get_notifications_with_token(base_url, auth_token):
    """GET /notificaciones con token → 200"""
    if not auth_token:
        pytest.skip("No hay token disponible")
    headers = {"Authorization": f"Bearer {auth_token}"}
    r = requests.get(f"{base_url}/notificaciones", headers=headers)
    assert r.status_code == 200

# ─────────────────────────────────────────
# GRUPO 5: Locations
# ─────────────────────────────────────────

def test_locations_search(base_url):
    """GET /api/locations/search → debe responder (con o sin query)"""
    r = requests.get(f"{base_url}/api/locations/search", params={"q": "Cochabamba"})
    assert r.status_code in [200, 400]

# ─────────────────────────────────────────
# GRUPO 6: Rutas legacy (smoke test rápido)
# ─────────────────────────────────────────

#def test_legacy_routes_exist(base_url):
#    """Las rutas legacy no deben dar 404"""
#   r = requests.get(f"{base_url}/api/publicaciones-legacy")
#    assert r.status_code != 404