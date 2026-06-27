import apiClient from '../api/client';
import expenseRepository from '../repositories/expenseRepository';
import authRepository from '../repositories/authRepository';
import notificationRepository from '../repositories/notificationRepository';
import { Expense, ExpenseParticipant, ExpenseCategory, User } from '../types';

interface ParticipantSplitInput {
  userId: string;
  value?: number; // Representing percent or custom amount
}

export const expenseService = {
  getExpenses: async (userId: string): Promise<Expense[]> => {
    // Return all expenses where user is a participant or creator
    const allExpenses = expenseRepository.getExpenses();
    const participants = expenseRepository.getParticipants();
    
    // Find expense IDs where user is involved
    const userExpenseIds = participants
      .filter((p) => p.user_id === userId)
      .map((p) => p.expense_id);
      
    const filtered = allExpenses.filter(
      (e) => (e.paid_by === userId || userExpenseIds.includes(e.id)) && !e.deleted_at
    );
    
    return apiClient.get(`/expenses?userId=${userId}`, filtered);
  },
  
  getExpenseById: async (id: string): Promise<Expense | null> => {
    const expense = expenseRepository.getExpenseById(id);
    return apiClient.get(`/expenses/${id}`, expense);
  },
  
  getExpenseParticipants: async (expenseId: string): Promise<(ExpenseParticipant & { user: User })[]> => {
    const participants = expenseRepository.getExpenseParticipants(expenseId);
    const users = authRepository.getUsers();
    
    const enriched = participants.map((p) => ({
      ...p,
      user: users[p.user_id]
    }));
    
    return apiClient.get(`/expenses/${expenseId}/participants`, enriched);
  },
  
  createExpense: async (
    title: string,
    description: string,
    amount: number,
    category: ExpenseCategory,
    paidByUserId: string,
    groupId: string | undefined,
    splitType: 'equal' | 'percent' | 'custom',
    splitInputs: ParticipantSplitInput[],
    currency = 'INR'
  ): Promise<Expense> => {
    // 1. Basic Validations
    if (!title.trim()) throw new Error('Expense title cannot be empty.');
    if (amount <= 0) throw new Error('Expense amount must be greater than 0.');
    if (splitInputs.length === 0) throw new Error('Select at least one participant.');
    
    // Check for duplicate participants
    const uniqueUserIds = new Set(splitInputs.map((p) => p.userId));
    if (uniqueUserIds.size !== splitInputs.length) {
      throw new Error('Duplicate participants detected.');
    }
    
    const participants: ExpenseParticipant[] = [];
    const expenseId = Math.random().toString(36).substring(2, 9);
    
    // 2. Split Calculations
    if (splitType === 'equal') {
      const count = splitInputs.length;
      const baseShare = Math.floor((amount / count) * 100) / 100; // Round down to cents
      let allocatedSum = baseShare * count;
      const remainder = Math.round((amount - allocatedSum) * 100) / 100;
      
      splitInputs.forEach((input, index) => {
        // Last participant absorbs the fractional remainder
        const share = index === count - 1 ? baseShare + remainder : baseShare;
        participants.push({
          id: Math.random().toString(36).substring(2, 9),
          expense_id: expenseId,
          user_id: input.userId,
          amount: parseFloat(share.toFixed(2)),
          payment_status: input.userId === paidByUserId ? 'paid' : 'pending',
          paid_at: input.userId === paidByUserId ? new Date().toISOString() : undefined
        });
      });
    } else if (splitType === 'percent') {
      const totalPercent = splitInputs.reduce((sum, input) => sum + (input.value || 0), 0);
      if (totalPercent !== 100) {
        throw new Error(`Percentages must sum up to exactly 100%. Current sum: ${totalPercent}%`);
      }
      
      let allocatedSum = 0;
      splitInputs.forEach((input) => {
        const pct = input.value || 0;
        const share = Math.floor(amount * (pct / 100) * 100) / 100;
        allocatedSum += share;
        
        participants.push({
          id: Math.random().toString(36).substring(2, 9),
          expense_id: expenseId,
          user_id: input.userId,
          amount: parseFloat(share.toFixed(2)),
          payment_status: input.userId === paidByUserId ? 'paid' : 'pending',
          paid_at: input.userId === paidByUserId ? new Date().toISOString() : undefined
        });
      });
      
      // Adjust remainder on the last participant
      const remainder = Math.round((amount - allocatedSum) * 100) / 100;
      if (remainder !== 0 && participants.length > 0) {
        const lastParticipant = participants[participants.length - 1];
        lastParticipant.amount = parseFloat((lastParticipant.amount + remainder).toFixed(2));
      }
    } else {
      // Custom splits
      const totalCustom = splitInputs.reduce((sum, input) => sum + (input.value || 0), 0);
      if (Math.abs(totalCustom - amount) > 0.01) {
        throw new Error(`Sum of split shares (₹${totalCustom.toLocaleString('en-IN')}) does not match total amount (₹${amount.toLocaleString('en-IN')}).`);
      }
      
      splitInputs.forEach((input) => {
        const share = input.value || 0;
        if (share <= 0) throw new Error('Individual split amount must be greater than 0.');
        
        participants.push({
          id: Math.random().toString(36).substring(2, 9),
          expense_id: expenseId,
          user_id: input.userId,
          amount: parseFloat(share.toFixed(2)),
          payment_status: input.userId === paidByUserId ? 'paid' : 'pending',
          paid_at: input.userId === paidByUserId ? new Date().toISOString() : undefined
        });
      });
    }
    
    // 3. Create expense record
    const newExpense: Expense = {
      id: expenseId,
      title,
      description,
      amount,
      currency,
      category,
      paid_by: paidByUserId,
      group_id: groupId,
      split_type: splitType,
      status: paidByUserId === paidByUserId && participants.every((p) => p.payment_status === 'paid') ? 'paid' : 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    expenseRepository.saveExpense(newExpense, participants);
    
    // 4. Trigger notifications for participants (excluding creator/payer)
    const payerName = authRepository.findUserById(paidByUserId)?.name || 'Someone';
    participants.forEach((p) => {
      if (p.user_id !== paidByUserId) {
        notificationRepository.addNotification({
          user_id: p.user_id,
          type: 'request',
          title: 'New Expense Request',
          message: `${payerName} paid for '${title}'. Your share: ${currency} ${p.amount.toLocaleString('en-IN')}.`,
          reference_id: expenseId,
          reference_type: 'Expense',
          is_read: false
        });
      }
    });
    
    return apiClient.post(`/expenses`, { newExpense, participants }, newExpense);
  },
  
  softDeleteExpense: async (expenseId: string): Promise<boolean> => {
    const expenses = expenseRepository.getExpenses();
    const expense = expenses.find((e) => e.id === expenseId);
    if (!expense) throw new Error('Expense not found');
    
    expense.deleted_at = new Date().toISOString();
    expenseRepository.saveExpenses(expenses);
    return apiClient.delete(`/expenses/${expenseId}`, true);
  }
};

export default expenseService;
