// src/store/planesStore.ts
// Single source of truth for plans — consumed by both admin and public pages.
// Replace the fetch calls here with your real API_URL endpoints when ready.

import { create } from "zustand";

export type Plan = {
  id: number;
  name: string;
  price: number;
  description: string;
  comment: string;
  benefits: string[];
  subscribers: number;
  deleted: boolean;
};

type PlanesStore = {
  plans: Plan[];
  createPlan: (plan: Omit<Plan, "id" | "deleted" | "subscribers">) => void;
  updatePlan: (
    id: number,
    updates: Partial<Omit<Plan, "id" | "deleted">>,
  ) => void;
  deletePlan: (id: number) => void;
  restorePlan: (id: number) => void;
};

const initialPlans: Plan[] = [
  {
    id: 1,
    name: "Básico",
    price: 0,
    description: "Ideal para comenzar",
    comment:
      "Perfecto para empezar y explorar nuestras funciones esenciales sin complicaciones.",
    benefits: [
      "2 publicaciones activas",
      "Acceso limitado",
      "Soporte básico",
      "1 usuario",
    ],
    subscribers: 25,
    deleted: false,
  },
  {
    id: 2,
    name: "Estándar",
    price: 99,
    description: "Para usuarios intermedios",
    comment:
      "La opción más elegida para empresas pequeñas: balance perfecto entre funciones y precio.",
    benefits: [
      "10 publicaciones activas",
      "Acceso completo",
      "Soporte prioritario",
      "5 usuarios",
    ],
    subscribers: 60,
    deleted: false,
  },
  {
    id: 3,
    name: "Pro",
    price: 199,
    description: "Máximo rendimiento",
    comment:
      "Todo incluido, ideal para usuarios avanzados o empresas que buscan máximo rendimiento.",
    benefits: [
      "Publicaciones ilimitadas",
      "Todo incluido",
      "Soporte 24/7",
      "Usuarios ilimitados",
    ],
    subscribers: 10,
    deleted: false,
  },
];

let nextId = 4;

export const usePlanesStore = create<PlanesStore>((set) => ({
  plans: initialPlans,

  createPlan: (plan) =>
    set((state) => ({
      plans: [
        ...state.plans,
        { ...plan, id: nextId++, deleted: false, subscribers: 0 },
      ],
    })),

  updatePlan: (id, updates) =>
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  deletePlan: (id) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, deleted: true } : p,
      ),
    })),

  restorePlan: (id) =>
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, deleted: false } : p,
      ),
    })),
}));
