const BOB_PER_USDT = 6.91 // BOB está pegado al USD aprox 6.91 BOB = 1 USD ≈ 1 USDT

export const convertirBobAUsdt = (bob: number): number =>
  Number((bob / BOB_PER_USDT).toFixed(4))

export const getExchangeRate = () => ({ bob_per_usdt: BOB_PER_USDT })

/**
 * Verifica una transacción TRC20 en Shasta testnet vía HTTP.
 * Retorna el estado y detalles si existe.
 */
export const verificarTransaccionShasta = async (txHash: string): Promise<{
  encontrada: boolean
  confirmada: boolean
  hash: string
  detalles?: Record<string, unknown>
}> => {
  const baseUrl = process.env.TRON_GRID_URL ?? 'https://api.shasta.trongrid.io'

  try {
    const res = await fetch(`${baseUrl}/v1/transactions/${txHash}`, {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      return { encontrada: false, confirmada: false, hash: txHash }
    }

    const data = (await res.json()) as {
      data?: Array<{ ret?: Array<{ contractRet: string }>; blockNumber?: number }>
      success?: boolean
    }

    const tx = data?.data?.[0]
    if (!tx) {
      return { encontrada: false, confirmada: false, hash: txHash }
    }

    const contractRet = tx.ret?.[0]?.contractRet
    const confirmada = contractRet === 'SUCCESS' && (tx.blockNumber ?? 0) > 0

    return {
      encontrada: true,
      confirmada,
      hash: txHash,
      detalles: { blockNumber: tx.blockNumber, contractRet },
    }
  } catch {
    return { encontrada: false, confirmada: false, hash: txHash }
  }
}
