export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  merchant: string;
  description: string;
  notes?: string;
  tags?: string[];
  receipt?: string; // base64 or file name
}

export interface Budget {
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  address: string;
  photo?: string;
}

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  paid: boolean;
}

export interface UserSettings {
  currency: string;
  language: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
  timestamp: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'add-expense'
  | 'expenses'
  | 'budget'
  | 'reports'
  | 'analytics'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'help';

export const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Health & Wellness',
  'Travel',
  'Education',
  'Others',
];

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Mobile Wallet',
];

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
];
