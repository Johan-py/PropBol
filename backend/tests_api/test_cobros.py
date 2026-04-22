import pytest
import requests


# ---------------------------------------------------------------------------
# Planes
# ---------------------------------------------------------------------------

class TestPlanes:
    def test_planes_endpoint_existe(self, base_url):
        """El endpoint de planes existe (no 404)."""
        r = requests.get(f"{base_url}/api/planes/membership-plans")
        assert r.status_code != 404, "El endpoint /api/planes/membership-plans no está registrado"

    def test_planes_requiere_autenticacion(self, base_url):
        """El endpoint de planes debe requerir token (401)."""
        r = requests.get(f"{base_url}/api/planes/membership-plans")
        assert r.status_code == 401, (
            f"Se esperaba 401 sin token, se obtuvo {r.status_code}"
        )


# ---------------------------------------------------------------------------
# Transacciones – rutas registradas
# ---------------------------------------------------------------------------

class TestTransaccionesRutas:
    def test_crear_transaccion_endpoint_existe(self, base_url):
        """POST /api/transacciones no devuelve 404."""
        r = requests.post(
            f"{base_url}/api/transacciones",
            json={"idSuscripcion": 1},
        )
        assert r.status_code != 404, "El endpoint POST /api/transacciones no está registrado"

    def test_pendiente_endpoint_existe(self, base_url):
        """GET /api/transacciones/pendiente/:userId no devuelve 404."""
        r = requests.get(f"{base_url}/api/transacciones/pendiente/1")
        assert r.status_code != 404, (
            "El endpoint GET /api/transacciones/pendiente/:userId no está registrado"
        )

    def test_estado_endpoint_existe(self, base_url):
        """GET /api/transacciones/:id/estado no devuelve 404."""
        r = requests.get(f"{base_url}/api/transacciones/1/estado")
        assert r.status_code != 404, (
            "El endpoint GET /api/transacciones/:id/estado no está registrado"
        )

    def test_cancelar_endpoint_existe(self, base_url):
        """PATCH /api/transacciones/:id/cancelar no devuelve 404."""
        r = requests.patch(f"{base_url}/api/transacciones/1/cancelar")
        assert r.status_code != 404, (
            "El endpoint PATCH /api/transacciones/:id/cancelar no está registrado"
        )


# ---------------------------------------------------------------------------
# Transacciones – flujo completo (crear → estado → cancelar)
# ---------------------------------------------------------------------------

class TestTransaccionesFlujoCRUD:
    def test_crear_transaccion_json_valido(self, base_url):
        """POST /api/transacciones devuelve JSON con id cuando los datos son válidos."""
        r = requests.post(
            f"{base_url}/api/transacciones",
            json={"idSuscripcion": 1, "userId": 1},
        )
        # Si falla con 500 hay un problema de DB/servidor
        assert r.status_code in (200, 201, 400, 401, 404), (
            f"Error inesperado al crear transacción: {r.status_code} – {r.text}"
        )
        if r.status_code in (200, 201):
            data = r.json()
            assert "id" in data, "La respuesta debería incluir el campo 'id'"

    def test_estado_id_invalido_retorna_400(self, base_url):
        """GET /api/transacciones/abc/estado retorna 400 por ID inválido."""
        r = requests.get(f"{base_url}/api/transacciones/abc/estado")
        assert r.status_code == 400, (
            f"Se esperaba 400 para ID no numérico, se obtuvo {r.status_code}"
        )

    def test_cancelar_id_invalido_retorna_400(self, base_url):
        """PATCH /api/transacciones/abc/cancelar retorna 400 por ID inválido."""
        r = requests.patch(f"{base_url}/api/transacciones/abc/cancelar")
        assert r.status_code == 400, (
            f"Se esperaba 400 para ID no numérico, se obtuvo {r.status_code}"
        )

    def test_cancelar_inexistente_retorna_404(self, base_url):
        """PATCH /api/transacciones/999999999/cancelar retorna 404."""
        r = requests.patch(f"{base_url}/api/transacciones/999999999/cancelar")
        assert r.status_code == 404, (
            f"Se esperaba 404 para transacción inexistente, se obtuvo {r.status_code}"
        )

    def test_estado_inexistente_retorna_404(self, base_url):
        """GET /api/transacciones/999999999/estado retorna 404."""
        r = requests.get(f"{base_url}/api/transacciones/999999999/estado")
        assert r.status_code == 404, (
            f"Se esperaba 404 para transacción inexistente, se obtuvo {r.status_code}"
        )

    def test_flujo_crear_estado_cancelar(self, base_url):
        """Crea transacción, verifica estado PENDIENTE, la cancela y confirma CANCELADO."""
        # 1. Crear
        r = requests.post(
            f"{base_url}/api/transacciones",
            json={"idSuscripcion": 1, "userId": 1},
        )
        if r.status_code not in (200, 201):
            pytest.skip(f"No se pudo crear transacción (status {r.status_code}), se omite flujo.")

        transaccion_id = r.json()["id"]

        # 2. Verificar estado PENDIENTE
        r2 = requests.get(f"{base_url}/api/transacciones/{transaccion_id}/estado")
        assert r2.status_code == 200
        assert r2.json()["estado"] == "pendiente", (
            f"Estado esperado 'pendiente', se obtuvo {r2.json()['estado']}"
        )

        # 3. Cancelar
        r3 = requests.patch(f"{base_url}/api/transacciones/{transaccion_id}/cancelar")
        assert r3.status_code == 200
        assert "cancelada" in r3.json().get("message", "").lower(), (
            "El mensaje de cancelación no es el esperado"
        )

        # 4. Verificar que ya no se puede cancelar de nuevo
        r4 = requests.patch(f"{base_url}/api/transacciones/{transaccion_id}/cancelar")
        assert r4.status_code == 400, (
            "Cancelar una transacción ya cancelada debería retornar 400"
        )
