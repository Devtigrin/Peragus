import type { OperationStatus } from '@/types/operation'

export interface AppContent {
  shell: {
    navOperations: string
    navApiKeys: string
    navSettings: string
    signOut: string
    userLabel: string
  }
  statuses: Record<OperationStatus, string>
  operations: {
    title: string
    description: string
    newOperation: string
    amountLabel: string
    receiverWalletLabel: string
    requestIdHint: string
    requestIdLabel: string
    submit: string
    creating: string
    cancel: string
    createError: string
    createErrorInvalidAmount: string
    createErrorInvalidWallet: string
    empty: string
    emptyCta: string
    loading: string
    loadError: string
    loadErrorCta: string
    confirmPix: string
    pixCode: string
    txHash: string
    explorerLink: string
    senderWallet: string
    receiverWallet: string
    errorDetail: string
    pollingNote: string
    copy: string
    copied: string
    tableHeadAmount: string
    tableHeadStatus: string
    tableHeadCreated: string
    tableHeadToken: string
  }
  apiKeys: {
    title: string
    description: string
    nameLabel: string
    create: string
    submitCreate: string
    cancel: string
    empty: string
    revealWarning: string
    revoke: string
    revokeConfirm: string
    revokedChip: string
    activeChip: string
    headName: string
    headPrefix: string
    headCreated: string
    headLastUsed: string
    headActions: string
    docsLink: string
  }
  settings: {
    title: string
    emailLabel: string
    passwordTitle: string
    newPasswordLabel: string
    confirmPasswordLabel: string
    savePassword: string
    successNotice: string
    mismatchError: string
    genericError: string
    signOut: string
  }
}
