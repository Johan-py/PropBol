# Spike: API de Binance P2P (USDT/BOB)

## 1. Objetivo
Validar el endpoint público de Binance P2P para obtener el tipo de cambio referencial (USDT/BOB) sin autenticación para la HU-02.

## 2. Endpoint Validado
- **URL Base:** `https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search`
- **Método:** `POST`

## 3. Ejemplo de cURL (Request)
```bash
curl -X POST "[https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search](https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search)" \
     -H "Content-Type: application/json" \
     -d '{"fiat": "BOB", "asset": "USDT", "tradeType": "SELL", "page": 1, "rows": 1, "payTypes": [], "publisherType": null}'
4. Decisión Técnica
Extracción: El precio viene en response.data[0].adv.price.

Caché: Se usará el caché nativo de Next.js (revalidate: 1800) en la Tarea 3 para evitar bloqueos por IP.

Base de Datos: No será necesario usar Supabase para guardar este dato gracias al caché de Next.js.
