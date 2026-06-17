import { create } from 'zustand'
import type { VerificationState, VerificationStatus, VerificationData } from '@/types'

const DEFAULT_DATA: VerificationData = {
  fullName: '',
  cpf: '',
  birthDate: '',
  email: '',
  phone: '',
  profession: '',
  fundsOrigin: '',
  monthlyRange: '',
}

export const useVerification = create<VerificationState>((set) => ({
  status: 'not_started',
  data: { ...DEFAULT_DATA },
  updateData: (partial) =>
    set((state) => ({ data: { ...state.data, ...partial } })),
  updateStatus: (status: VerificationStatus) => set({ status }),
  resetVerification: () => set({ status: 'not_started', data: { ...DEFAULT_DATA } }),
}))