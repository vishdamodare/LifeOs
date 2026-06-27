import { create } from 'zustand';
import { Expense, ExpenseParticipant, User, ExpenseCategory } from '../types';
import expenseService from '../services/expenseService';

interface ParticipantSplitInput {
  userId: string;
  value?: number;
}

interface ExpenseState {
  expenses: Expense[];
  activeExpenseParticipants: (ExpenseParticipant & { user: User })[];
  isLoading: boolean;
  error: string | null;
  fetchExpenses: (userId: string) => Promise<void>;
  fetchExpenseParticipants: (expenseId: string) => Promise<void>;
  createExpense: (
    title: string,
    description: string,
    amount: number,
    category: ExpenseCategory,
    paidByUserId: string,
    groupId: string | undefined,
    splitType: 'equal' | 'percent' | 'custom',
    splitInputs: ParticipantSplitInput[]
  ) => Promise<boolean>;
  deleteExpense: (expenseId: string, userId: string) => Promise<boolean>;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: [],
  activeExpenseParticipants: [],
  isLoading: false,
  error: null,
  
  fetchExpenses: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const expenses = await expenseService.getExpenses(userId);
      set({ expenses, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch expenses', isLoading: false });
    }
  },
  
  fetchExpenseParticipants: async (expenseId) => {
    set({ isLoading: true, error: null });
    try {
      const activeExpenseParticipants = await expenseService.getExpenseParticipants(expenseId);
      set({ activeExpenseParticipants, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch expense participants', isLoading: false });
    }
  },
  
  createExpense: async (title, description, amount, category, paidByUserId, groupId, splitType, splitInputs) => {
    set({ isLoading: true, error: null });
    try {
      await expenseService.createExpense(
        title,
        description,
        amount,
        category,
        paidByUserId,
        groupId,
        splitType,
        splitInputs
      );
      // Refresh list
      const expenses = await expenseService.getExpenses(paidByUserId);
      set({ expenses, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create expense', isLoading: false });
      return false;
    }
  },
  
  deleteExpense: async (expenseId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await expenseService.softDeleteExpense(expenseId);
      const expenses = await expenseService.getExpenses(userId);
      set({ expenses, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete expense', isLoading: false });
      return false;
    }
  }
}));
export default useExpenseStore;
