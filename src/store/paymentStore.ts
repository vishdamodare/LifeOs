import { create } from 'zustand';
import { Payment } from '../types';
import paymentService from '../services/paymentService';

interface PaymentState {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  fetchPayments: (userId: string) => Promise<void>;
  submitPayment: (
    expenseParticipantId: string,
    payerId: string,
    receiverId: string,
    amount: number,
    paymentMethod?: string,
    transactionId?: string
  ) => Promise<boolean>;
  verifyPayment: (paymentId: string, transactionId?: string) => Promise<boolean>;
  cancelPayment: (paymentId: string) => Promise<boolean>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  isLoading: false,
  error: null,
  
  fetchPayments: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const payments = await paymentService.getPayments(userId);
      set({ payments, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch payments', isLoading: false });
    }
  },
  
  submitPayment: async (expenseParticipantId, payerId, receiverId, amount, paymentMethod, transactionId) => {
    set({ isLoading: true, error: null });
    try {
      await paymentService.submitPaymentNotification(
        expenseParticipantId,
        payerId,
        receiverId,
        amount,
        paymentMethod,
        transactionId
      );
      // Refresh payments list
      const payments = await paymentService.getPayments(payerId);
      set({ payments, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to submit payment', isLoading: false });
      return false;
    }
  },
  
  verifyPayment: async (paymentId, transactionId) => {
    set({ isLoading: true, error: null });
    try {
      await paymentService.verifyPayment(paymentId, transactionId);
      // Refresh list
      const payments = get().payments.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'completed' as const,
            paid_at: new Date().toISOString(),
            transaction_id: transactionId || p.transaction_id
          };
        }
        return p;
      });
      set({ payments, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to verify payment', isLoading: false });
      return false;
    }
  },
  
  cancelPayment: async (paymentId) => {
    set({ isLoading: true, error: null });
    try {
      await paymentService.cancelPayment(paymentId);
      const payments = get().payments.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'cancelled' as const
          };
        }
        return p;
      });
      set({ payments, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to cancel payment', isLoading: false });
      return false;
    }
  }
}));
export default usePaymentStore;
