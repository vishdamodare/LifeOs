export interface UpiPaymentParams {
  payeeAddress: string;  // VPA (e.g. 'vish@okaxis')
  payeeName: string;     // Name (e.g. 'Vishwadip')
  amount: number;        // Transaction amount
  transactionNote?: string; // Optional description
  currency?: string;     // Currency (default 'INR')
}

/**
 * Builds a standard UPI payment URL for launching UPI-capable apps on mobile devices.
 * Format: upi://pay?pa=address&pn=name&am=amount&cu=currency&tn=note
 */
export const buildUpiUrl = ({
  payeeAddress,
  payeeName,
  amount,
  transactionNote = 'LifeOS Split',
  currency = 'INR'
}: UpiPaymentParams): string => {
  const pa = encodeURIComponent(payeeAddress);
  const pn = encodeURIComponent(payeeName);
  const am = amount.toFixed(2);
  const cu = encodeURIComponent(currency);
  const tn = encodeURIComponent(transactionNote);
  
  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}`;
};

/**
 * Validates whether a string has a valid UPI address format (e.g., username@bank).
 */
export const isValidUpiId = (upiId: string): boolean => {
  const regex = /^[\w.\-_]{2,256}@[\w.\-_]{2,256}$/;
  return regex.test(upiId);
};
