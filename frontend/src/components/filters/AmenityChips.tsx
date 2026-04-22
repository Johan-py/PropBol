"use client";
import { useState } from "react";

type Amenidad =
    | "Piscina"
    | "Terraza"
    | "Jardín"
    | "Cochera"
    | "Gimnasio"
    | "Ascensor"
    | "Aire"
    | "Amueblado";

const AMENIDADES_BASE: Amenidad[] = [
    "Piscina",
    "Terraza",
    "Jardín",
    "Cochera",
];

const AMENIDADES_EXTRA: Amenidad[] = [
    "Gimnasio",
    "Ascensor",
    "Aire",
    "Amueblado",
];

interface Props {
    onChange?: (values: Amenidad[]) => void;
}

export default function AmenityChips({ onChange }: Props) {
    const [selected, setSelected] = useState<Amenidad[]>([]);
    const [showMore, setShowMore] = useState(false);

    const toggle = (item: Amenidad) => {
        const newSelected = selected.includes(item)
            ? selected.filter((i) => i !== item)
            : [...selected, item];

        setSelected(newSelected);
        onChange?.(newSelected);
    };

    const renderChip = (item: Amenidad) => {
        const active = selected.includes(item);

        return (
            <button
                key={item}
                onClick={() => toggle(item)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
          ${active
                        ? "bg-[#c47b2a] text-white border-[#c47b2a]"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    }`}
            >
                {active && "✓ "}
                {item}
            </button>
        );
    };

    return (
        <div className="mt-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Amenidades
            </h3>

            <div className="flex flex-wrap gap-2">
                {AMENIDADES_BASE.map(renderChip)}

                {showMore && AMENIDADES_EXTRA.map(renderChip)}

                <button
                    onClick={() => setShowMore(!showMore)}
                    className="px-4 py-2 rounded-full text-sm border bg-gray-100 hover:bg-gray-200"
                >
                    {showMore ? "Ver menos" : "+ Más"}
                </button>
            </div>
        </div>
    );
}