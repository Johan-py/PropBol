interface Props {
  parametros: string[];
}

export default function ParametrosPersonalizados({ parametros }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-[#f7f7f7] p-6">
      <h3 className="mb-4 text-xl font-semibold text-[#0f172a]">
        Parámetros personalizados
      </h3>

      {parametros.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {parametros.map((parametro, index) => (
            <span
              key={`${parametro}-${index}`}
              className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-[#0f172a]"
            >
              {parametro}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-sm text-gray-400">
          Aquí se mostrarán los parámetros personalizados
        </div>
      )}
    </div>
  );
}
