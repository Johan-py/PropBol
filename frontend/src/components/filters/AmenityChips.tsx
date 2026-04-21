"use client";
import { useState } from "react";

type Amenidad =
    | "Piscina"
    | "Terraza"
    | "Jardín"
    | "Cochera";

const AMENIDADES: Amenidad[] = [
    "Piscina",
    "Terraza",
    "Jardín",
    "Cochera",
];

export default function AmenityChips() {
    const [selected, setSelected] = useState<Amenidad[]>([]);

    const toggle = (item: Amenidad) => {
        setSelected((prev) =>
            prev.includes(item)
                ? prev.filter((i) => i !== item)
                : [...prev, item]
        );
    };

    return (
        <div className="mb-4">
            <h3>Comodidades</h3>

            <div className="flex gap-2">
                {AMENIDADES.map((item) => {
                    const active = selected.includes(item);

                    return (
                        <button
                            key={item}
                            onClick={() => toggle(item)}
                            className={`px-3 py-1 rounded-full border ${active ? "bg-blue-500 text-white" : "bg-gray-200"
                                }`}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}