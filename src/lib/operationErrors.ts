import type { Locale } from '@/i18n/routing'
import { appContent } from '@/content/app'

/**
 * Camada centralizada que traduz códigos internos do backend para mensagens
 * públicas seguras. Nunca retorna o código bruto.
 * Backend mantém INSUFFICIENT_TREASURY_BALANCE etc. nos logs/auditoria,
 * mas o frontend expõe apenas categorias públicas.
 */
export function mapOperationErrorToPublicMessage(
  raw: string | null | undefined,
  locale: Locale,
): string {
  const c = appContent[locale].operations
  const normalized = (raw ?? '').trim().toUpperCase()

  if (!normalized) return c.errorGeneric

  // Valor não permitido — INSUFFICIENT_TREASURY_BALANCE é o caso canônico
  if (normalized.includes('INSUFFICIENT_TREASURY_BALANCE')) {
    return c.errorInsufficientAmount
  }

  // Reconciliação requerida — operação travada em settling sem hash
  if (normalized.includes('SETTLEMENT_RECONCILIATION_REQUIRED')) {
    return c.errorReconciliation
  }

  // Serviço temporariamente indisponível — gas, RPC, persistência, config
  if (
    normalized.includes('INSUFFICIENT_TREASURY_GAS') ||
    normalized.includes('RPC_UNAVAILABLE') ||
    normalized.includes('TX_HASH_PERSISTENCE_FAILED') ||
    normalized.includes('SETTLEMENT_FAILED') ||
    normalized.includes('WRONG_NETWORK') ||
    normalized.includes('TREASURY_ADDRESS_MISMATCH') ||
    normalized.includes('INVALID_SETTLEMENT_CONFIG') ||
    normalized.includes('SETTLEMENT_PENDING') ||
    normalized.includes('INSUFFICIENT_TREASURY')
  ) {
    return c.errorServiceUnavailable
  }

  // Operação não encontrada
  if (
    normalized.includes('OPERATION NOT FOUND') ||
    normalized === 'NOT_FOUND' ||
    normalized.includes('P0002') ||
    normalized.includes('404')
  ) {
    return c.errorNotFound
  }

  // Não autorizado / permissão
  if (
    normalized.includes('UNAUTHORIZED') ||
    normalized.includes('NOT AUTHENTICATED') ||
    normalized.includes('PERMISSION DENIED') ||
    normalized.includes('42501') ||
    normalized.includes('PGRST') ||
    normalized.includes('401') ||
    normalized.includes('403')
  ) {
    return c.errorUnauthorized
  }

  // Input inválido mapeado como "valor não permitido" quando for amount
  if (
    normalized.includes('INVALID_SETTLEMENT_INPUT') ||
    normalized.includes('INVALID UUID') ||
    normalized.includes('VALIDATION ERROR') ||
    normalized.includes('AMOUNT') ||
    normalized.includes('WALLET')
  ) {
    // Para erros de validação genéricos vindos de create-operation, usamos fallback genérico
    // mas se a mensagem contiver amount sem contexto de treasury, ainda é genérico.
    // Mantemos genérico para não vazar detalhe de validação interna.
    return c.errorGeneric
  }

  // Qualquer código em UPPER_SNAKE_CASE (padrão interno) nunca deve ser exibido cru
  if (/^[A-Z_]{5,}$/.test(normalized) || normalized.includes('SERVICE_ROLE') || normalized.includes('DATABASE') || normalized.includes('RLS') || normalized.includes('ETHERS') || normalized.includes('NONCE') || normalized.includes('GAS ESTIMATION')) {
    return c.errorGeneric
  }

  // Fallback genérico — nunca ecoa raw interno
  return c.errorGeneric
}

/**
 * Totamente sanitizada: se o erro já for uma mensagem pública (contém espaços e minúsculas),
 * pode ser exibida? Não — sempre mapeamos para evitar vazamento de detalhes.
 * Esta função é usada para mapear payload.error / exception message.
 */
export function toPublicOperationError(
  err: unknown,
  locale: Locale,
): string {
  const c = appContent[locale].operations
  if (err instanceof Error) {
    const mapped = mapOperationErrorToPublicMessage(err.message, locale)
    // Se o mapper retornou genérico mas a mensagem original parecia já ser pública e curta,
    // preferimos genérico para segurança.
    // Ex.: "backend down" → genérico
    if (mapped === c.errorGeneric && err.message && err.message.length < 80 && !/[A-Z_]{5,}/.test(err.message)) {
      // Mensagens de rede curtas sem padrão interno podem ser genéricas mesmo
      return c.errorGeneric
    }
    return mapped
  }
  if (typeof err === 'string') {
    return mapOperationErrorToPublicMessage(err, locale)
  }
  return c.errorGeneric
}
