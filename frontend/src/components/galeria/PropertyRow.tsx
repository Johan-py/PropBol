import ContactButton from "./ContactButton";
import Image from "next/image";
import { useState } from "react";  // ← IMPORTAR useState

export default function PropertyRow({
  title,
  price,
  size,
  contactType,
  image,
}: {
  title: string;
  price: string;
  size: string;
  contactType: string;
  image: string;
}) {
  const [isHovered, setIsHovered] = useState(false);  // ← AGREGAR ESTADO

  return (
    <div 
      className="grid grid-cols-[40px_70px_minmax(0,1fr)_50px] gap-2 px-3 py-2 items-center transition-all duration-200 hover:bg-gray-50 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}   // ← AGREGAR
      onMouseLeave={() => setIsHovered(false)}  // ← AGREGAR
    >
      {/* FOTO */}
      <div className="w-[40px] h-[40px] rounded-md overflow-hidden bg-gray-200">
        <Image
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          width={40}
          height={40}
        />
      </div>

      {/* PRECIO - Con tamaño dinámico al hover */}
      <span 
        className={`font-semibold text-gray-700 transition-all duration-300 ease-in-out ${
          isHovered ? "text-sm" : "text-[11px]"
        }`}
      >
        {price}
      </span>

      {/* DETALLE */}
      <div className="flex flex-col overflow-hidden min-w-0">
        <span className="text-[11px] font-medium text-gray-800 truncate">
          {title}
        </span>
        <span className="text-[10px] text-gray-500">{size}</span>
      </div>

      {/* CONTACTO */}
      <div className="flex justify-center">
        <ContactButton type={contactType} variant="table" />
      </div>
    </div>
  );
}