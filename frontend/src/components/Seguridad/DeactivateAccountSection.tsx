import { AlertTriangle } from 'lucide-react'

export default function DeactivateAccountSection() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Desactiva tu cuenta de PropBol
        </h1>
      </header>

      <div className="max-w-2xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />

            <div>
              <h3 className="text-sm font-semibold text-red-700">Advertencia</h3>
              <p className="mt-1 text-sm text-red-600">
                Al desactivar tu cuenta ya no podrás iniciar sesión nuevamente.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Desactivar mi cuenta
        </button>
      </div>
    </div>
  )
}
