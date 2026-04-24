"use client";

import { Newspaper, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function AdminDashboard() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          `${API_URL}/api/blogs/admin?estado=PENDIENTE&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setPendingCount(data.total);
        }
      } catch (error) {
        console.error("Error fetching pending blogs count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCount();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-10 animate-fade">
          {/* Welcome Section */}
          <section>
            <h1 className="text-3xl font-bold font-montserrat text-stone-900 text-center md:text-left">
              Panel de <span className="text-amber-600">Administración</span>
            </h1>
            <p className="mt-2 text-stone-600 font-inter text-center md:text-left">
              Resumen general de la plataforma y accesos rápidos.
            </p>
          </section>

          {/* Pending Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-bold font-montserrat text-stone-900">
                Pendientes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/admin/blogs"
                className="group flex items-center justify-between rounded-2xl border border-stone-100 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-amber-600"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-600 transition-colors group-hover:bg-amber-100">
                    <Newspaper className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium font-inter text-stone-500">
                      Blogs por Moderar
                    </p>
                    <h3 className="text-2xl font-bold font-montserrat text-stone-900">
                      {isLoading ? (
                        <div className="h-8 w-12 bg-stone-100 animate-pulse rounded"></div>
                      ) : (
                        (pendingCount ?? 0)
                      )}
                    </h3>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-stone-50 flex items-center justify-center transition-colors group-hover:bg-amber-600 group-hover:text-white">
                  <Clock className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
