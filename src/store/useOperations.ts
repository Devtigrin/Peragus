import { create } from 'zustand'
import type { Operation, OperationStatus } from '@/types'
import { MOCK_OPERATIONS } from '@/mock/data'

interface OperationsState {
  operations: Operation[]
  addOperation: (op: Operation) => void
  updateOperation: (id: string, updates: Partial<Operation>) => void
  updateOperationStatus: (id: string, status: OperationStatus) => void
}

export const useOperations = create<OperationsState>((set) => ({
  operations: MOCK_OPERATIONS,
  addOperation: (op) =>
    set((state) => ({ operations: [op, ...state.operations] })),
  updateOperation: (id, updates) =>
    set((state) => ({
      operations: state.operations.map((op) =>
        op.id === id ? { ...op, ...updates } : op
      ),
    })),
  updateOperationStatus: (id, status) =>
    set((state) => ({
      operations: state.operations.map((op) =>
        op.id === id ? { ...op, status } : op
      ),
    })),
}))
