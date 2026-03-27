export default function ProfileCard() {
  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-2xl bg-white p-8 shadow md:flex-row">

        {/* LADO IZQUIERDO */}
        <div className="flex w-full flex-col items-center justify-start md:w-1/3">
          <div className="h-28 w-28 rounded-full bg-gray-300"></div>
          <p className="mt-4 text-xl font-semibold text-gray-800">Perfil1</p>
          <p className="text-sm text-gray-500">perfil1@gmail.com</p>
        </div>

        {/* LADO DERECHO */}
        <div className="w-full md:w-2/3">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Datos Personales
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="md:w-40 font-medium text-gray-700">
                Nombre Completo
              </label>
              <input
                type="text"
                defaultValue="Perfil1"
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="md:w-40 font-medium text-gray-700">
                E-mail
              </label>
              <input
                type="email"
                defaultValue="perfil1@gmail.com"
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="md:w-40 font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="Ingresa tu teléfono"
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="md:w-40 font-medium text-gray-700">
                País
              </label>
              <select className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none">
                <option value="">Selecciona un país</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Peru">Perú</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="md:w-40 font-medium text-gray-700">
                Género
              </label>
              <select className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none">
                <option value="">Selecciona un género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label className="md:w-40 font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                placeholder="Ingresa tu dirección"
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 outline-none"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center md:justify-end">
            <button className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}