import { Eye, LockKeyhole } from 'lucide-react'

type PasswordFieldProps = {
  label: string
  placeholder: string
}

function PasswordField({ label, placeholder }: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700">{label}</label>

      <div className="flex items-center rounded-xl border border-neutral-200 bg-white px-3">
        <LockKeyhole className="h-4 w-4 text-neutral-400" />

        <input
          type="password"
          placeholder={placeholder}
          className="h-11 w-full border-none bg-transparent px-3 text-sm text-neutral-900 outline-none"
        />

        <button
          type="button"
          className="text-neutral-400 transition hover:text-neutral-600"
          aria-label={`Mostrar ${label.toLowerCase()}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function PasswordSection() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Cambiar contraseña</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Actualiza tu contraseña para mantener tu cuenta segura.
        </p>
      </header>

      <div className="max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <form className="space-y-4">
          <PasswordField label="Ingresa tu contraseña actual" placeholder="••••••••" />

          <PasswordField label="Ingresa tu nueva contraseña" placeholder="••••••••" />

          <PasswordField label="Confirma tu nueva contraseña" placeholder="••••••••" />

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Cambiar contraseña
          </button>
        </form>
      </div>
    </div>
  )
}
