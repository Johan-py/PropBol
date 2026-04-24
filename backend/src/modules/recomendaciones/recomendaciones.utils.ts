import {
  InmuebleConScore,
  PreferenciasUsuario,
} from "./recomendaciones.types.js";

export class ScoreCalculator {
  calcularScore(
    inmueble: any,
    preferencias: PreferenciasUsuario,
    esFavoritoSimilar: boolean = false,
  ): { score: number; razones: string[] } {
    let scoreTotal = 0;
    const razones: string[] = [];

    const zonaInmueble = inmueble.ubicacion?.zona || "";
    const pesoZona = preferencias.zonasPreferidas.get(zonaInmueble) || 0;
    if (pesoZona > 0) {
      const puntosZona = pesoZona * 40;
      scoreTotal += puntosZona;
      razones.push(`Zona "${zonaInmueble}" +${puntosZona.toFixed(1)}pts`);
    }

    const categoriaInmueble = inmueble.categoria || "";
    const pesoCategoria =
      preferencias.categoriasPreferidas.get(categoriaInmueble) || 0;
    if (pesoCategoria > 0) {
      const puntosCategoria = pesoCategoria * 25;
      scoreTotal += puntosCategoria;
      razones.push(
        `Categoría "${categoriaInmueble}" +${puntosCategoria.toFixed(1)}pts`,
      );
    }

    if (preferencias.rangoPrecio) {
      const precio = Number(inmueble.precio);
      const { min, max } = preferencias.rangoPrecio;

      if (precio >= min && precio <= max) {
        const cercania =
          1 -
          Math.min(Math.abs(precio - (min + max) / 2) / ((max - min) / 2), 1);
        const puntosPrecio = 20 * cercania;
        scoreTotal += puntosPrecio;
        razones.push(
          `Precio $${precio} dentro del rango +${puntosPrecio.toFixed(1)}pts`,
        );
      } else if (Math.abs(precio - min) / min < 0.3) {
        scoreTotal += 10;
        razones.push(`Precio $${precio} cerca del rango +10pts`);
      }
    }

    if (preferencias.rangoSuperficie && inmueble.superficieM2) {
      const superficie = Number(inmueble.superficieM2);
      const { min, max } = preferencias.rangoSuperficie;

      if (superficie >= min && superficie <= max) {
        scoreTotal += 10;
        razones.push(`Superficie ${superficie}m² dentro del rango +10pts`);
      }
    }

    if (esFavoritoSimilar) {
      scoreTotal += 15;
      razones.push(`Similar a favoritos +15pts`);
    }

    return { score: scoreTotal, razones };
  }

  extraerPreferencias(
    historialVistas: any[],
    ultimasBusquedas: any[],
    favoritos: any[],
  ): PreferenciasUsuario {
    const zonasPreferidas = new Map<string, number>();
    const categoriasPreferidas = new Map<string, number>();
    let totalPeso = 0;
    const precios: number[] = [];
    const superficies: number[] = [];

    for (const vista of historialVistas) {
      const inmueble = vista.inmueble;
      const peso = vista.peso;
      totalPeso += peso;

      const zona = inmueble.ubicacion?.zona;
      if (zona) {
        zonasPreferidas.set(zona, (zonasPreferidas.get(zona) || 0) + peso);
      }

      const categoria = inmueble.categoria;
      if (categoria) {
        categoriasPreferidas.set(
          categoria,
          (categoriasPreferidas.get(categoria) || 0) + peso,
        );
      }

      if (inmueble.precio) precios.push(Number(inmueble.precio));
      if (inmueble.superficieM2)
        superficies.push(Number(inmueble.superficieM2));
    }

    for (const favorito of favoritos) {
      const zona = favorito.ubicacion?.zona;
      if (zona) {
        zonasPreferidas.set(zona, (zonasPreferidas.get(zona) || 0) + 5);
      }

      const categoria = favorito.categoria;
      if (categoria) {
        categoriasPreferidas.set(
          categoria,
          (categoriasPreferidas.get(categoria) || 0) + 5,
        );
      }
    }

    if (totalPeso > 0) {
      for (const [zona, peso] of zonasPreferidas) {
        zonasPreferidas.set(zona, peso / totalPeso);
      }
      for (const [categoria, peso] of categoriasPreferidas) {
        categoriasPreferidas.set(categoria, peso / totalPeso);
      }
    }

    let rangoPrecio = null;
    if (precios.length > 0) {
      const media = precios.reduce((a, b) => a + b, 0) / precios.length;
      rangoPrecio = { min: media * 0.7, max: media * 1.3 };
    }

    let rangoSuperficie = null;
    if (superficies.length > 0) {
      const media = superficies.reduce((a, b) => a + b, 0) / superficies.length;
      rangoSuperficie = { min: media * 0.7, max: media * 1.3 };
    }

    return {
      zonasPreferidas,
      categoriasPreferidas,
      rangoPrecio,
      rangoSuperficie,
      ultimasBusquedas: ultimasBusquedas
        .map((b: any) => b.query || b.termino)
        .filter(Boolean),
      totalClics: historialVistas.length,
    };
  }
}
