export type WalletType = 'metamask' | 'trust' | 'rabby' | 'coinbase' | 'walletconnect' | 'manual'

export type NetworkType = 'ethereum' | 'polygon' | 'bnb'

export type OperationStatus = 'pending_payment' | 'payment_confirmed' | 'processing' | 'sent' | 'completed' | 'failed' | 'analysis'

export interface Operation {
  id: string
  createdAt: string
  brlAmount: number
  usdtAmount: number
  exchangeRate: number
  network: NetworkType
  walletAddress: string
  status: OperationStatus
  transactionHash?: string
  pixCode?: string
  estimatedFee: number
  totalPaid: number
  complianceData?: ComplianceData
}

export interface ComplianceData {
  fullName: string
  cpf: string
  email: string
  fundsOrigin: string
}

export interface NetworkInfo {
  id: NetworkType
  name: string
  shortName: string
  icon: string
  fee: number
  confirmationTime: string
  explorerUrl: string
}

export interface QuoteData {
  usdtBid: number
  usdtAsk: number
  estimatedTime: string
  network: string
}

export interface User {
  email: string
  name?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  register: (email: string, password: string, name: string) => void
  logout: () => void
}

export type VerificationStatus = 'not_started' | 'in_progress' | 'under_review' | 'approved' | 'rejected'

export interface VerificationData {
  fullName: string
  cpf: string
  birthDate: string
  email: string
  phone: string
  profession: string
  fundsOrigin: string
  monthlyRange: string
}

export interface VerificationState {
  status: VerificationStatus
  data: VerificationData
  updateData: (data: Partial<VerificationData>) => void
  updateStatus: (status: VerificationStatus) => void
  resetVerification: () => void
}

export interface OperationsState {
  operations: Operation[]
  addOperation: (op: Operation) => void
  updateOperation: (id: string, updates: Partial<Operation>) => void
  updateOperationStatus: (id: string, status: OperationStatus) => void
}
