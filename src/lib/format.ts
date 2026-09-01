/**
 * Formata valores de token para exibição pt-BR.
 * Apenas apresentação: não altera valor armazenado nem precisão blockchain.
 * Usa `Intl.NumberFormat('pt-BR')` como base e preserva valor original.
 */
export function formatTokenAmount(value: string | number | null | undefined): string {
  if (value == null) return ''
  const raw = String(value).trim()
  if (raw === '') return ''
  // Aceita apenas dígitos com ponto decimal opcional (sem separador de milhar)
  if (!/^-?\d+(\.\d+)?$/.test(raw)) return raw

  const hasDecimal = raw.includes('.')
  if (!hasDecimal) {
    const num = Number(raw)
    // Para inteiros muito grandes fora do safe integer, formata manualmente
    if (!Number.isSafeInteger(num)) {
      const isNeg = raw.startsWith('-')
      const abs = isNeg ? raw.slice(1) : raw
      return `${isNeg ? '-' : ''}${abs.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`
    }
    return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(num)
  }

  // Com parte decimal — preservar original, mas garantir no mínimo 2 casas
  const [intPartStr, decPartRaw] = raw.split('.')
  let decPart = decPartRaw ?? ''
  if (decPart.length === 1) decPart = decPart.padEnd(2, '0')

  // Se tem mais de 2 casas decimais, preserva sem arredondar (manual)
  if (decPart.length > 2) {
    const isNeg = intPartStr.startsWith('-')
    const absInt = isNeg ? intPartStr.slice(1) : intPartStr
    const formattedInt = absInt.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${isNeg ? '-' : ''}${formattedInt},${decPart}`
  }

  const num = Number(`${intPartStr}.${decPart}`)
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Helper específico para operações: combina valor formatado + símbolo.
 * Mantém valor original internamente, apenas exibição formatada.
 */
export function formatOperationAmount(
  usdtAmountText: string | null | undefined,
  tokenSymbol?: string | null,
): string {
  const formatted = formatTokenAmount(usdtAmountText)
  const symbol = tokenSymbol ?? 'MockUSDT'
  return formatted ? `${formatted} ${symbol}`.trim() : symbol
}
