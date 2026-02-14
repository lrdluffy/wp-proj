import { format as dateFormat, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return dateFormat(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  return dateFormat(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatCaseNumber = (number: string): string => {
  return number.toUpperCase();
};

export const formatPhoneNumber = (phone: string): string => {
  // Simple phone number formatting
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};