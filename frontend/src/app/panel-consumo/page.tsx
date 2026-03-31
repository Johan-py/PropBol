"use client";

import React, { useState } from 'react';

export default function Page() {
  const [usadas, setUsadas] = useState(2);
  const [total, setTotal] = useState(3);
  
  const porcentaje = (usadas / total) * 100;
  const disponibles = total - usadas;

  return (
    <div className="bg-stone-50 min-h-screen p-4 md:p-10 font-sans text-stone-800">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-stone-900 tracking-tighter">Panel de consumo</h1>
            <p className="text-xl md:text-2xl font-bold text-stone-500 mt-2">Monitorea tus publicaciones activas y el límite de tu plan</p>
          </div>
          <button className="bg-amber-600 hover:bg-amber-700 text-stone-100 px-8 py-3 rounded-2xl font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2 group whitespace-nowrap">
            Ver planes de ampliación 
            <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        <div className="bg-[#fef9e7] border border-[#f9e79f] p-5 rounded-2xl shadow-sm flex items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-xl shadow-sm flex-shrink-0">
              <span className="text-2xl">🔔</span>
            </div>
            <div>
              <h4 className="text-[#9a7d0a] font-extrabold text-base leading-tight">
                Tienes publicaciones restantes este mes
              </h4>
              <p className="text-[#b7950b] text-sm font-medium mt-0.5">
                Tu plan gratuito incluye {total} publicaciones. Has utilizado {usadas} y te queda <strong className="font-bold underline text-[#9a7d0a]">{disponibles} disponible</strong>. ¡Úsala antes de que venza el período mensual!
              </p>
            </div>
          </div>
          <div className="hidden sm:block flex-shrink-0 mr-4">
            <span className="text-6xl font-black text-[#f1c40f] opacity-60">{disponibles}</span>
          </div>
        </div>

        <div className="bg-stone-900 text-stone-100 p-8 md:p-12 rounded-[30px] shadow-2xl mb-10 border border-stone-800 relative overflow-hidden">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="text-center md:text-left flex-shrink-0">
                <p className="text-stone-500 uppercase text-[14px] tracking-[0.2em] mb-4 font-bold">Publicaciones usadas este mes</p>
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                  <span className="text-7xl md:text-8xl font-bold text-stone-100">{usadas}</span>
                  <span className="text-4xl md:text-5xl text-stone-600 font-medium">/ {total}</span>
                </div>
                <p className="text-stone-500 text-[20px] mt-2">Plan Gratuito • Límite mensual</p>
              </div>

              <div className="flex-1 w-full max-w-2xl self-center">
                <div className="flex justify-between items-end text-stone-500 mb-4 uppercase font-bold tracking-widest">
                  <span className="text-[15px]">0 usadas</span>
                  <span className="text-amber-500 text-base font-black tracking-tighter">{porcentaje.toFixed(0)}% utilizado</span>
                  <span className="text-[15px]">límite: {total}</span>
                </div>

                <div className="bg-stone-800 h-7 rounded-full overflow-hidden border border-stone-700/50 shadow-inner">
                  <div 
                    className="bg-amber-600 h-full shadow-[0_0_30px_rgba(217,119,6,0.6)] transition-all duration-700" 
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-600/30 p-4 rounded-xl flex items-center gap-3">
              <span className="text-amber-500 text-xl">⚠️</span>
              <div>
                <p className="text-amber-500 font-bold text-[20px]">Casi sin cupo disponible</p>
                <p className="text-stone-400 text-[15px]">Te queda <strong className="text-stone-200">{disponibles} publicación</strong> gratuita. Amplía tu plan para continuar sin interrupciones.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-stone-200 border-b-[6px] border-b-emerald-500 flex items-center gap-4 transform transition hover:translate-y-[-4px]">
            <div className="bg-emerald-50 p-3 rounded-xl text-2xl">📗</div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-emerald-500 leading-none">{disponibles}</span>
              </div>
              <p className="text-[15px] text-stone-400 font-bold uppercase tracking-wider mt-1">Publicaciones disponibles</p>
            </div>
          </div>
    
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-stone-200 border-b-[6px] border-b-amber-500 flex items-center gap-4 transform transition hover:translate-y-[-4px]">
            <div className="bg-amber-50 p-3 rounded-xl text-2xl">📙</div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-amber-500 leading-none">{usadas}</span>
              </div>
              <p className="text-[15px] text-stone-400 font-bold uppercase tracking-wider mt-1">Utilizadas</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-stone-200 border-b-[6px] border-b-blue-500 flex items-center gap-4 transform transition hover:translate-y-[-4px]">
            <div className="bg-blue-50 p-3 rounded-xl text-2xl">📘</div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-blue-500 leading-none">{total}</span>
              </div>
              <p className="text-[15px] text-stone-400 font-bold uppercase tracking-wider mt-1">Límite total del plan</p>
            </div>
          </div>
        </div>  

      </div>
    </div>
  );
}