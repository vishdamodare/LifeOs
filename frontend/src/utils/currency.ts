/**
 * Formats a number into Indian Rupees (INR) format.
 * Example: 5000 -> ₹5,000
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(amount);
};
