import { ComboBox } from "../ui/ComboBox";

export default function ExploreSection() {
  return (
    <section className="bg-white py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* CAJA */}
        <div className="rounded-2xl bg-white p-6 shadow-xl border">
          <div className="h-24 flex items-center justify-center text-gray-400">
            <ComboBox 
            label="Tipos de Inmueble" 
            placeholder="Ej. Casa, 1, 2, 3" 
          />
          </div>
        </div>
      </div>
    </section>
  );
}
