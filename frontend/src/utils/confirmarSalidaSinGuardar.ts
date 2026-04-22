export function confirmarSalidaDesdeCambioContrasena() {
  if (typeof window === "undefined") return true;

  const estoyEnCambiarContrasena =
    window.location.pathname === "/profile/security/cambiar-contrasena";

  const hayCambiosSinGuardar =
    sessionStorage.getItem("security_password_dirty") === "true";

  if (!estoyEnCambiarContrasena || !hayCambiosSinGuardar) {
    return true;
  }

  return window.confirm(
    "Tienes cambios sin guardar. ¿Seguro que deseas salir?"
  );
}