/**
 * Generates an image source URL pointing to a QR code representing the payload.
 * Relies on the standard public QR Server API to generate QR images.
 */
export const getQrCodeUrl = (payload: string, size = 200): string => {
  const encodedPayload = encodeURIComponent(payload);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedPayload}`;
};
