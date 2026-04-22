"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USER_STORAGE_KEY = "propbol_user";

export default function CreatePostPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificamos si existe la sesión en el cliente
    const user = localStorage.getItem(USER_STORAGE_KEY);
    if (!user) {
      // Redirigimos a la página de blogs si no hay sesión
      router.push("/blogs");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return null; // O un spinner de carga
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-bold mb-8 text-stone-900">Crear Nuevo Post</h1>
      <div className="bg-white p-8 rounded-[32px] border border-stone-200 shadow-sm">
        {/* AQUÍ IRÁ TU FORMULARIO DE LA HU6 */}
        <p className="text-stone-500 italic">El formulario de la HU6 se renderizará aquí.</p>
      </div>
    </div>
  );
}
