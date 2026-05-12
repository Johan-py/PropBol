// src/app/admin/planes/page.tsx
"use client";

import { ReactNode, useState } from "react";           // ✅ Fix 1: ReactNode directo, sin React.*
import { usePlanesStore, Plan } from "@/hooks/planesStore";
import {
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  Users,
  TrendingUp,
  DollarSign,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit";

type FormState = {
  name: string;
  price: string;
  description: string;
  comment: string;
  benefits: string[];
};

// ✅ Fix 3: tipo que excluye "benefits" (string[]) para que setField solo acepte campos string
type StringField = Exclude<keyof FormState, "benefits">;

const emptyForm = (): FormState => ({
  name: "",
  price: "",
  description: "",
  comment: "",
  benefits: [""],
});

// ─── Modal ───────────────────────────────────────────────────────────────────

function PlanModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: ModalMode;
  initial?: Plan;
  onClose: () => void;
  onSave: (form: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          price: String(initial.price),
          description: initial.description,
          comment: initial.comment,
          benefits: [...initial.benefits],
        }
      : emptyForm()
  );

  // ✅ Fix 3: key restringido a StringField, evita conflicto de tipo con benefits: string[]
  const setField = (key: StringField, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const setBenefit = (i: number, val: string) =>
    setForm((f) => {
      const b = [...f.benefits];
      b[i] = val;
      return { ...f, benefits: b };
    });

  const addBenefit = () =>
    setForm((f) => ({ ...f, benefits: [...f.benefits, ""] }));

  const removeBenefit = (i: number) =>
    setForm((f) => ({
      ...f,
      benefits: f.benefits.filter((_, idx) => idx !== i),
    }));

  // ✅ Fix 2: Boolean() convierte a boolean puro para que disabled={!valid} no falle
  const valid = Boolean(
    form.name.trim() &&
      form.description.trim() &&
      form.price !== "" &&
      !isNaN(Number(form.price)) &&
      Number(form.price) >= 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 to-stone-800 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">
              {mode === "create" ? "Crear nuevo plan" : `Editar — ${initial?.name}`}
            </h2>
            <p className="text-stone-400 text-xs mt-0.5">
              {mode === "create"
                ? "Completa los campos para añadir un plan"
                : "Modifica los campos del plan"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl text-stone-400 hover:bg-stone-700 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
                Nombre
              </label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Ej: Pro"
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
                Precio (Bs.) / mes
              </label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="0"
                className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
              Descripción corta
            </label>
            <input
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Ej: Ideal para comenzar"
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
              Comentario de venta
            </label>
            <textarea
              value={form.comment}
              onChange={(e) => setField("comment", e.target.value)}
              rows={3}
              placeholder="Texto persuasivo mostrado en la tarjeta del plan…"
              className="w-full border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition resize-none"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 mb-2 uppercase tracking-wide">
              Beneficios
            </label>
            <div className="space-y-2">
              {form.benefits.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={b}
                    onChange={(e) => setBenefit(i, e.target.value)}
                    placeholder={`Beneficio ${i + 1}`}
                    className="flex-1 border border-stone-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                  {form.benefits.length > 1 && (
                    <button
                      onClick={() => removeBenefit(i)}
                      aria-label={`Eliminar beneficio ${i + 1}`}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addBenefit}
              className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition"
            >
              <Plus size={13} /> Añadir beneficio
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            disabled={!valid}
            onClick={() => onSave(form)}
            className="px-5 py-2.5 text-sm font-semibold bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white rounded-xl transition flex items-center gap-2"
          >
            <Check size={15} />
            {mode === "create" ? "Crear plan" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: ReactNode; // ✅ Fix 1: ReactNode importado directamente desde react
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 flex items-start gap-4 shadow-sm">
      <div className={`p-3 rounded-xl ${accent}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
        <p className="text-2xl font-bold text-stone-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Plan Row ─────────────────────────────────────────────────────────────────

function ActivePlanRow({
  plan,
  isPopular,
  onEdit,
  onDelete,
}: {
  plan: Plan;
  isPopular: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="group border-b border-stone-100 hover:bg-amber-50/40 transition-colors">
        <td className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
              <span className="text-xs font-bold text-stone-500">#{plan.id}</span>
            </div>
            <div>
              <p className="font-semibold text-stone-900 text-sm">{plan.name}</p>
              <p className="text-xs text-stone-400">{plan.description}</p>
            </div>
            {isPopular && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Popular
              </span>
            )}
          </div>
        </td>

        <td className="py-4 px-5 text-sm font-bold text-amber-600">
          {plan.price === 0 ? "Gratis" : `Bs. ${plan.price}`}
        </td>

        <td className="py-4 px-5">
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-amber-400 rounded-full transition-all duration-500 ${
                  plan.subscribers >= 100 ? "w-full"
                  : plan.subscribers >= 75  ? "w-3/4"
                  : plan.subscribers >= 50  ? "w-1/2"
                  : plan.subscribers >= 25  ? "w-1/4"
                  : "w-1/12"
                }`}
              />
            </div>
            <span className="text-xs text-stone-500 font-medium">{plan.subscribers}</span>
          </div>
        </td>

        <td className="py-4 px-5">
          <div className="flex gap-1 flex-wrap">
            {plan.benefits.slice(0, 2).map((b, i) => (
              <span
                key={i}
                className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
              >
                {b}
              </span>
            ))}
            {plan.benefits.length > 2 && (
              <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                +{plan.benefits.length - 2}
              </span>
            )}
          </div>
        </td>

        <td className="py-4 px-5">
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition"
              title="Ver detalles"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
              title="Editar"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
              title="Eliminar"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>

      {/* Fila expandida con detalles */}
      {expanded && (
        <tr className="bg-amber-50/30 border-b border-stone-100">
          <td colSpan={5} className="px-5 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
                  Comentario
                </p>
                <p className="text-stone-700">{plan.comment}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
                  Todos los beneficios
                </p>
                <ul className="space-y-1">
                  {plan.benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-stone-700">
                      <Check size={12} className="text-green-500 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PaginaAdminPlanes() {
  const { plans, createPlan, updatePlan, deletePlan, restorePlan } =
    usePlanesStore();

  const [modal, setModal] = useState<{ mode: ModalMode; plan?: Plan } | null>(null);

  const activePlans = plans.filter((p) => !p.deleted);
  const deletedPlans = plans.filter((p) => p.deleted);
  const totalSubscribers = activePlans.reduce((s, p) => s + p.subscribers, 0);
  const totalRevenue = activePlans.reduce((s, p) => s + p.price * p.subscribers, 0);
  const maxSubs = Math.max(...activePlans.map((p) => p.subscribers), 1);
  const popularPlan = activePlans.find((p) => p.subscribers === maxSubs);

  const handleSave = (form: FormState) => {
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      description: form.description.trim(),
      comment: form.comment.trim(),
      benefits: form.benefits.filter((b) => b.trim()),
    };

    if (modal?.mode === "create") {
      createPlan(payload);
    } else if (modal?.plan) {
      updatePlan(modal.plan.id, payload);
    }
    setModal(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Modal */}
      {modal && (
        <PlanModal
          mode={modal.mode}
          initial={modal.plan}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
              Administración de Planes
            </h1>
            <p className="text-stone-400 mt-1 text-sm">
              Los cambios aquí se reflejan en tiempo real en la página de suscripciones.
            </p>
          </div>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-700 text-white font-semibold px-5 py-3 rounded-xl transition shadow-sm active:scale-95"
          >
            <Plus size={16} />
            Crear Plan
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<LayoutGrid size={18} className="text-amber-600" />}
            label="Planes activos"
            value={activePlans.length}
            accent="bg-amber-50"
          />
          <StatCard
            icon={<Users size={18} className="text-blue-600" />}
            label="Suscriptores"
            value={totalSubscribers}
            sub="total activos"
            accent="bg-blue-50"
          />
          <StatCard
            icon={<DollarSign size={18} className="text-green-600" />}
            label="Ingreso mensual"
            value={`Bs. ${totalRevenue.toLocaleString()}`}
            sub="estimado"
            accent="bg-green-50"
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-purple-600" />}
            label="Plan más popular"
            value={popularPlan?.name ?? "—"}
            sub={`${popularPlan?.subscribers ?? 0} suscriptores`}
            accent="bg-purple-50"
          />
        </div>

        {/* ── Tabla Planes Activos ── */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-900 text-base">Planes Activos</h2>
              <p className="text-stone-400 text-xs mt-0.5">
                {activePlans.length} planes publicados
              </p>
            </div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
              Activos
            </span>
          </div>

          {activePlans.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <LayoutGrid className="mx-auto mb-3 opacity-30" size={32} />
              <p className="text-sm">No hay planes activos. Crea uno arriba.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {(["Plan", "Precio", "Suscriptores", "Beneficios", "Acciones"] as const).map(
                      (h) => (
                        <th
                          key={h}
                          className="py-3 px-5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider"
                        >
                          {h === "Acciones" ? "" : h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {activePlans.map((plan) => (
                    <ActivePlanRow
                      key={plan.id}
                      plan={plan}
                      isPopular={plan.id === popularPlan?.id}
                      onEdit={() => setModal({ mode: "edit", plan })}
                      onDelete={() => deletePlan(plan.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Tabla Planes Eliminados ── */}
        {deletedPlans.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-stone-900 text-base">Planes Eliminados</h2>
                <p className="text-stone-400 text-xs mt-0.5">
                  {deletedPlans.length} planes en papelera
                </p>
              </div>
              <span className="text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full">
                Eliminados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    {(["Plan", "Precio", "Beneficios", "Restaurar"] as const).map((h) => (
                      <th
                        key={h}
                        className="py-3 px-5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider"
                      >
                        {h === "Restaurar" ? "" : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deletedPlans.map((plan) => (
                    <tr key={plan.id} className="border-b border-stone-100 opacity-60">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <span className="text-xs font-bold text-red-300">#{plan.id}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-stone-600 text-sm line-through">
                              {plan.name}
                            </p>
                            <p className="text-xs text-stone-400">{plan.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-sm text-stone-500 line-through">
                        {plan.price === 0 ? "Gratis" : `Bs. ${plan.price}`}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex gap-1 flex-wrap">
                          {plan.benefits.slice(0, 2).map((b, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => restorePlan(plan.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-xl transition"
                        >
                          <RotateCcw size={13} /> Restaurar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
