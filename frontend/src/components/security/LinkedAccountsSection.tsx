<<<<<<< HEAD
import type { ReactNode } from "react";

type SocialCardProps = {
  platform: string;
  description: string;
=======
"use client";

import { useEffect, useState, type ReactNode } from "react";

type AccountStatus = "vinculado" | "no-vinculado";

type LinkedAccount = {
  id: string;
  platform: string;
  description: string;
  status: AccountStatus;
  linkedEmail: string;
  color: string;
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
  icon?: ReactNode;
  letter?: string;
};

<<<<<<< HEAD
function SocialCard({ platform, description, icon, letter }: SocialCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-lg font-bold text-neutral-700">
            {icon ?? letter}
=======
const initialAccounts: LinkedAccount[] = [
  {
    id: "facebook",
    platform: "Facebook",
    description:
      "Vincula tu cuenta de Facebook para iniciar sesión con un solo clic.",
    status: "no-vinculado",
    linkedEmail: "",
    color: "bg-blue-600",
    letter: "f",
  },
  {
    id: "discord",
    platform: "Discord",
    description:
      "Vincula tu cuenta de Discord para iniciar sesión con un solo clic.",
    status: "no-vinculado",
    linkedEmail: "",
    color: "bg-indigo-600",
    icon: <DiscordIcon />,
  },
];

type SocialCardProps = {
  account: LinkedAccount;
  actionLoadingId: string | null;
  onLink: (id: string) => void;
  onOpenUnlinkModal: (id: string) => void;
};

function SocialCard({
  account,
  actionLoadingId,
  onLink,
  onOpenUnlinkModal,
}: SocialCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white ${account.color}`}
          >
            {account.icon ?? account.letter}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
          </div>

          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
<<<<<<< HEAD
              {platform}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
=======
              {account.platform}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {account.description}
            </p>

            <p className="mt-2 text-sm">
              <span className="font-medium text-neutral-700">Estado:</span>{" "}
              <span
                className={
                  account.status === "vinculado"
                    ? "font-semibold text-green-600"
                    : "font-semibold text-neutral-500"
                }
              >
                {account.status === "vinculado" ? "Vinculado" : "No vinculado"}
              </span>
            </p>

            {account.linkedEmail && (
              <p className="mt-1 text-sm text-neutral-500">
                Cuenta asociada: {account.linkedEmail}
              </p>
            )}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
          </div>
        </div>

        <button
          type="button"
<<<<<<< HEAD
          className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Vincular
=======
          onClick={() =>
            account.status === "vinculado"
              ? onOpenUnlinkModal(account.id)
              : onLink(account.id)
          }
          disabled={actionLoadingId === account.id}
         className={`inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 ${
         account.status === "vinculado"
         ? "bg-red-500 hover:bg-red-600"
         : account.id === "facebook"
         ? "bg-[#1877F2] hover:brightness-95"
         : "bg-[#5865F2] hover:brightness-95"
         }`}
        >
          {actionLoadingId === account.id
            ? "Procesando..."
            : account.status === "vinculado"
            ? "Desvincular"
            : "Vincular"}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
        </button>
      </div>
    </article>
  );
}

function DiscordIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
<<<<<<< HEAD
      className="h-6 w-6 fill-[#5865F2]"
=======
      className="h-6 w-6 fill-white"
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
      aria-hidden="true"
    >
      <path d="M20.317 4.369A19.79 19.79 0 0 0 15.885 3c-.191.328-.403.769-.552 1.117a18.27 18.27 0 0 0-5.333 0A11.64 11.64 0 0 0 9.448 3a19.736 19.736 0 0 0-4.433 1.369C2.211 8.58 1.443 12.686 1.826 16.735A19.923 19.923 0 0 0 7.239 19.5c.438-.6.828-1.235 1.164-1.904-.634-.24-1.239-.541-1.813-.896.152-.111.301-.227.445-.347 3.495 1.643 7.285 1.643 10.739 0 .146.12.294.236.446.347-.575.355-1.182.656-1.817.896.336.669.726 1.304 1.164 1.904a19.874 19.874 0 0 0 5.416-2.765c.451-4.695-.769-8.763-3.666-12.366ZM9.349 14.546c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.84 2.154-1.909 2.154Zm5.303 0c-1.047 0-1.909-.966-1.909-2.154 0-1.188.84-2.154 1.909-2.154 1.078 0 1.928.975 1.909 2.154 0 1.188-.831 2.154-1.909 2.154Z" />
    </svg>
  );
}

export default function LinkedAccountsSection() {
<<<<<<< HEAD
=======
  const [accounts, setAccounts] = useState<LinkedAccount[]>(initialAccounts);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [accountToUnlink, setAccountToUnlink] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const handleLink = (id: string) => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!navigator.onLine) {
      setErrorMessage("No tienes conexión a internet.");
      return;
    }

    const current = accounts.find((account) => account.id === id);
    if (!current) return;

    if (current.status === "vinculado") {
      setErrorMessage(`${current.platform} ya está vinculada.`);
      return;
    }

    setActionLoadingId(id);

    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === id
            ? {
                ...account,
                status: "vinculado",
                linkedEmail:
                  id === "facebook"
                    ? "usuario.facebook@mock.com"
                    : "usuario.discord@mock.com",
              }
            : account
        )
      );

      setActionLoadingId(null);
      setSuccessMessage(`${current.platform} fue vinculada correctamente.`);
    }, 1000);
  };

  const openUnlinkModal = (id: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    setAccountToUnlink(id);
  };

  const cancelUnlink = () => {
    setAccountToUnlink(null);
  };

  const confirmUnlink = () => {
    if (!accountToUnlink) return;

    const linkedAccountsCount = accounts.filter(
      (account) => account.status === "vinculado"
    ).length;

    if (linkedAccountsCount <= 1) {
      setErrorMessage(
        "No puedes desvincular el único método de acceso disponible."
      );
      setAccountToUnlink(null);
      return;
    }

    setActionLoadingId(accountToUnlink);

    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === accountToUnlink
            ? {
                ...account,
                status: "no-vinculado",
                linkedEmail: "",
              }
            : account
        )
      );

      setActionLoadingId(null);
      setAccountToUnlink(null);
      setSuccessMessage("La red social fue desvinculada correctamente.");
    }, 900);
  };

>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
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

<<<<<<< HEAD
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
=======
      {errorMessage && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-28 animate-pulse rounded-xl bg-stone-100" />
          <div className="h-28 animate-pulse rounded-xl bg-stone-100" />
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <SocialCard
              key={account.id}
              account={account}
              actionLoadingId={actionLoadingId}
              onLink={handleLink}
              onOpenUnlinkModal={openUnlinkModal}
            />
          ))}
        </div>
      )}

      {accountToUnlink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h4 className="text-lg font-semibold text-stone-800">
              Confirmar desvinculación
            </h4>
            <p className="mt-2 text-sm text-stone-500">
              ¿Seguro que deseas desvincular esta red social de tu cuenta?
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelUnlink}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmUnlink}
                className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white"
              >
                Desvincular
              </button>
            </div>
          </div>
        </div>
      )}
>>>>>>> 8536301fcf9e07d62083864936ac19772bd49b83
    </div>
  );
}
