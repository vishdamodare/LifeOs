import { Expense, ExpenseParticipant } from '../types';

const EXPENSES_KEY = 'lifeos_expenses_db';
const PARTICIPANTS_KEY = 'lifeos_expense_participants_db';

const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'e1',
    title: 'Goa Hotel',
    description: 'Booking Goa beach resort',
    amount: 8400,
    currency: 'INR',
    category: 'Travel',
    paid_by: 'ak', // Arjun Kumar (You)
    group_id: 'g1', // Goa Trip
    split_type: 'equal',
    status: 'partial',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'e2',
    title: 'Sunday Dinner',
    description: 'Dinner at Royal Barbeque',
    amount: 3200,
    currency: 'INR',
    category: 'Food',
    paid_by: 'ak', // Arjun Kumar (You)
    group_id: 'g2', // Friends Group
    split_type: 'equal',
    status: 'paid',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // yesterday
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    settled_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'e3',
    title: 'Cab to Airport',
    description: 'Shared taxi from flat to airport',
    amount: 900,
    currency: 'INR',
    category: 'Travel',
    paid_by: 'rj', // Riya Joshi
    split_type: 'equal',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  }
];

const DEFAULT_PARTICIPANTS: ExpenseParticipant[] = [
  // Goa Hotel (split 4 ways equally: ak, rp, km, ps)
  { id: 'ep1', expense_id: 'e1', user_id: 'ak', amount: 2100, payment_status: 'paid', paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
  { id: 'ep2', expense_id: 'e1', user_id: 'rp', amount: 2100, payment_status: 'paid', paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
  { id: 'ep3', expense_id: 'e1', user_id: 'km', amount: 2100, payment_status: 'pending' },
  { id: 'ep4', expense_id: 'e1', user_id: 'ps', amount: 2100, payment_status: 'pending' },
  
  // Sunday Dinner (split 3 ways: ak, rp, km - fully settled)
  { id: 'ep5', expense_id: 'e2', user_id: 'ak', amount: 1066.66, payment_status: 'paid', paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() },
  { id: 'ep6', expense_id: 'e2', user_id: 'rp', amount: 1066.66, payment_status: 'paid', paid_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: 'ep7', expense_id: 'e2', user_id: 'km', amount: 1066.68, payment_status: 'paid', paid_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  
  // Cab to Airport (split 3 ways: rj, ak, rp)
  { id: 'ep8', expense_id: 'e3', user_id: 'rj', amount: 300, payment_status: 'paid', paid_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
  { id: 'ep9', expense_id: 'e3', user_id: 'ak', amount: 300, payment_status: 'pending' },
  { id: 'ep10', expense_id: 'e3', user_id: 'rp', amount: 300, payment_status: 'paid', paid_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() }
];

export const expenseRepository = {
  getExpenses: (): Expense[] => {
    const data = localStorage.getItem(EXPENSES_KEY);
    if (!data) {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(DEFAULT_EXPENSES));
      return DEFAULT_EXPENSES;
    }
    return JSON.parse(data);
  },
  
  saveExpenses: (expenses: Expense[]): void => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },
  
  getParticipants: (): ExpenseParticipant[] => {
    const data = localStorage.getItem(PARTICIPANTS_KEY);
    if (!data) {
      localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(DEFAULT_PARTICIPANTS));
      return DEFAULT_PARTICIPANTS;
    }
    return JSON.parse(data);
  },
  
  saveParticipants: (participants: ExpenseParticipant[]): void => {
    localStorage.setItem(PARTICIPANTS_KEY, JSON.stringify(participants));
  },
  
  getExpenseParticipants: (expenseId: string): ExpenseParticipant[] => {
    const participants = expenseRepository.getParticipants();
    return participants.filter((p) => p.expense_id === expenseId);
  },
  
  saveExpense: (expense: Expense, participants: ExpenseParticipant[]): void => {
    const expenses = expenseRepository.getExpenses();
    const existingIndex = expenses.findIndex((e) => e.id === expense.id);
    if (existingIndex > -1) {
      expenses[existingIndex] = expense;
    } else {
      expenses.push(expense);
    }
    expenseRepository.saveExpenses(expenses);
    
    // Save participants
    const allParticipants = expenseRepository.getParticipants();
    const otherParticipants = allParticipants.filter((p) => p.expense_id !== expense.id);
    const updatedParticipants = [...otherParticipants, ...participants];
    expenseRepository.saveParticipants(updatedParticipants);
  },
  
  getExpenseById: (id: string): Expense | null => {
    const expenses = expenseRepository.getExpenses();
    return expenses.find((e) => e.id === id && !e.deleted_at) || null;
  }
};

export default expenseRepository;
