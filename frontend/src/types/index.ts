export interface User {
  id: string;
  name: string;
  phone: string;
  upi_id: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  deleted_at?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  profile_picture?: string;
  created_by: string; // User ID
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

export type ExpenseCategory = 'Food' | 'Travel' | 'Rent' | 'Shopping' | 'Bills' | 'Other';

export interface Expense {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paid_by: string; // User ID
  group_id?: string; // Group ID (optional)
  split_type: 'equal' | 'percent' | 'custom';
  status: 'pending' | 'verification_pending' | 'paid' | 'partial';
  created_at: string;
  updated_at: string;
  settled_at?: string;
  deleted_at?: string;
}

export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  payment_status: 'pending' | 'verification_pending' | 'paid' | 'overdue';
  transaction_id?: string;
  payment_method?: string;
  paid_at?: string;
}

export interface Payment {
  id: string;
  expense_participant_id: string;
  payer_id: string;
  receiver_id: string;
  amount: number;
  status: 'pending' | 'verification_pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string; // e.g. 'UPI', 'Cash'
  transaction_id?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface Friendship {
  id: string;
  user1_id: string; // smaller UUID alphabetically/lexicographically
  user2_id: string; // larger UUID alphabetically/lexicographically
  status: 'pending' | 'active' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'request' | 'payment' | 'reminder' | 'group_invite' | 'expense_updated' | 'payment_verified';
  title: string;
  message: string;
  reference_id?: string; // ID of the referenced expense or group
  reference_type?: string; // e.g. 'Expense', 'Group', 'Payment'
  is_read: boolean;
  created_at: string;
  updated_at: string;
}
