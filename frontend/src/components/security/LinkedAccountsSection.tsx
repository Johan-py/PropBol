import type { ReactNode } from "react";

type SocialCardProps = {
  platform: string;
  description: string;
  icon?: ReactNode;
  letter?: string;
};

function SocialCard({ platform, description, icon, letter }: SocialCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-lg font-bold text-neutral-700">
            {icon ?? letter}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {platform}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Vincular
        </button>
      </div>
    </article>
  );
}

function DiscordIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-[#5865F2]"
      aria-hidden="true"
    >
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.191.328-.403.769-.552 1.117a18.27 18.27 0 0 0-5.333 0A11.64 11.64 0 0 0 9.448 3a19.736 19.736 0 0 0-4.433 1.369C2.211 8.58 1.443 12.686 1.826 16.735A19.923 19.923 0 0 0 7.239 19.5c.438-.6.828-1.235 1.164-1.904-.634-.24-1.239-.541-1.813-.896.152-.111.301-.227.445-.347 3.495 1.643 7.285 1.643 10.739 0 .146.12.294.236.446.347-.575.355-1.182.656-1.817.896.336.669.726 1.304 1.164 1.904a19.874 19.874 0 0 0 5.416-2.765c.451-4.695-.769-8.763-3.666-12.366ZM9.349 14.546c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.84 2.154-1.909 2.154Zm5.303 0c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.831 2.154-1.909 2.154Z" />
    </svg>
  );
}

export default function LinkedAccountsSection() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Redes vinculadas
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Gestiona las redes sociales vinculadas a tu cuenta para un inicio de
          sesión más rápido.
        </p>
      </header>

      <div className="space-y-4">
        <SocialCard
          platform="Google"
          description="Vincula tu cuenta de Google para iniciar sesión con un solo clic."
          letter="G"
        />

        <SocialCard
          platform="Facebook"
          description="Vincula tu cuenta de Facebook para iniciar sesión con un solo clic."
          letter="f"
        />

        <SocialCard
          platform="Discord"
          description="Vincula tu cuenta de Discord para iniciar sesión con un solo clic."
          icon={<DiscordIcon />}
        />
      </div>
    </div>
  );
}
