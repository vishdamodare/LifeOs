import { Payment } from '../types';

const PAYMENTS_KEY = 'lifeos_payments_db';

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 'pay1',
    expense_participant_id: 'ep2', // Rahul Patel's participant record for Goa Hotel
    payer_id: 'rp',
    receiver_id: 'ak',
    amount: 2100,
    status: 'completed',
    payment_method: 'UPI',
    transaction_id: 'TXN987654321',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    paid_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
  },
  {
    id: 'pay2',
    expense_participant_id: 'ep6', // Rahul Patel's share for Sunday Dinner
    payer_id: 'rp',
    receiver_id: 'ak',
    amount: 1066.66,
    status: 'completed',
    payment_method: 'UPI',
    transaction_id: 'TXN876543210',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    paid_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'pay3',
    expense_participant_id: 'ep7', // Karan Mehta's share for Sunday Dinner
    payer_id: 'km',
    receiver_id: 'ak',
    amount: 1066.68,
    status: 'completed',
    payment_method: 'UPI',
    transaction_id: 'TXN765432109',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    paid_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'pay4',
    expense_participant_id: 'ep10', // Rahul Patel's share for Cab to Airport
    payer_id: 'rp',
    receiver_id: 'rj',
    amount: 300,
    status: 'completed',
    payment_method: 'UPI',
    transaction_id: 'TXN654321098',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    paid_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  }
];

export const paymentRepository = {
  getPayments: (): Payment[] => {
    const data = localStorage.getItem(PAYMENTS_KEY);
    if (!data) {
      localStorage.setItem(PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
      return DEFAULT_PAYMENTS;
    }
    return JSON.parse(data);
  },
  
  savePayments: (payments: Payment[]): void => {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  },
  
  addPayment: (payment: Payment): void => {
    const payments = paymentRepository.getPayments();
    payments.push(payment);
    paymentRepository.savePayments(payments);
  },
  
  updatePaymentStatus: (paymentId: string, status: Payment['status'], txId?: string): Payment => {
    const payments = paymentRepository.getPayments();
    const payment = payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error('Payment not found');
    
    payment.status = status;
    payment.updated_at = new Date().toISOString();
    if (txId) payment.transaction_id = txId;
    if (status === 'completed') payment.paid_at = new Date().toISOString();
    
    paymentRepository.savePayments(payments);
    return payment;
  }
};

export default paymentRepository;
