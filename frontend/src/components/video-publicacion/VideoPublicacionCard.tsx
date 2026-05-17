import { Play } from "lucide-react";

export default function VideoPublicacionCard() {
  return (
    <div className="mt-4 flex h-[240px] w-full items-center justify-between overflow-hidden rounded-xl bg-[#FFF1E6] px-8">
      <div>
        <h2 className="text-2xl font-bold leading-tight text-gray-900">
          ¿Cómo publicar
          <br />
          <span className="text-orange-500">tu propiedad?</span>
        </h2>
      </div>

      <button
        type="button"
        className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition hover:bg-orange-600"
      >
        <Play size={34} fill="white" />
      </button>

      <div className="hidden sm:block">
        <img
          src="/images/video-publicacion/casa-publicacion.png"
          alt="Casa para publicar propiedad"
          className="h-[185px] w-auto object-contain"
        />
      </div>
    </div>
  );
}
