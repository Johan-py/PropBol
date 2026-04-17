import { Info } from 'lucide-react'

export default function TwoFactorSection() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Verificación en dos pasos
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Protege tu cuenta con un código de verificación enviado a tu correo electrónico.
        </p>
      </header>

      <div className="max-w-3xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-neutral-200">
                <Info className="h-4 w-4 text-neutral-500" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-neutral-900">¿Cómo funciona?</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-500">
                  Cada vez que inicies sesión, recibirás un código de verificación en tu correo
                  electrónico. Deberás ingresar ese código para completar el inicio de sesión.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Activar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
