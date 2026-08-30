import { HttpError } from './http.ts'
import { assertValidTransition } from './state-machine.ts'

export interface PixOperation {
  id: string
  status: string
  requestJson: Record<string, unknown>
  amount: string
  receiverWallet: string
}

export interface PixConfirmationStore {
  find(userId: string, operationId: string): Promise<PixOperation | null>
  claim(
    userId: string,
    operationId: string,
    expectedStatus: 'created' | 'pix_pending',
    requestJson: Record<string, unknown>,
  ): Promise<PixOperation | null>
}

export interface PixConfirmationResult {
  operation: PixOperation
  previousStatus: string
  shouldDispatch: boolean
}

export async function confirmPixOnce(
  store: PixConfirmationStore,
  userId: string,
  operationId: string,
  paidAt: string,
): Promise<PixConfirmationResult> {
  const op = await store.find(userId, operationId)
  if (!op) throw new HttpError(404, 'Operation not found')

  const current = op.status

  if (current === 'pix_confirmed' || current === 'settling' || current === 'confirmed') {
    return { operation: op, previousStatus: current, shouldDispatch: false }
  }

  if (current === 'created' || current === 'pix_pending') {
    const requestJson: Record<string, unknown> = {
      ...op.requestJson,
      paid_at: paidAt,
      pix_provider: 'sandbox-simulated',
    }

    const claimed = await store.claim(userId, operationId, current, requestJson)

    if (claimed) {
      return { operation: claimed, previousStatus: current, shouldDispatch: true }
    }

    // lost claim - reload and check advanced state
    const reloaded = await store.find(userId, operationId)
    if (!reloaded) throw new HttpError(404, 'Operation not found')

    if (
      reloaded.status === 'pix_confirmed' ||
      reloaded.status === 'settling' ||
      reloaded.status === 'confirmed'
    ) {
      return { operation: reloaded, previousStatus: current, shouldDispatch: false }
    }

    // For failed or unknown, delegate to state machine to throw consistent error
    assertValidTransition(reloaded.status, 'pix_confirmed')
    // If reloaded is still creatable but was raced, treat as no dispatch (should not happen)
    return { operation: reloaded, previousStatus: current, shouldDispatch: false }
  }

  // failed and unknown states use assertValidTransition and remain errors
  assertValidTransition(current, 'pix_confirmed')
  throw new HttpError(409, `Cannot transition from ${current} to pix_confirmed`)
}
