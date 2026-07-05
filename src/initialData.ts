import { Expense, Budget, Profile, BillReminder, UserSettings } from './types';

export const INITIAL_EXPENSES: Expense[] = [
  // Current Month (July 2026) Expenses to match the donut chart totals
  {
    id: 'exp-1',
    amount: 530.81,
    category: 'Food & Dining',
    date: '2026-07-04',
    paymentMethod: 'Debit Card',
    merchant: 'Swiggy',
    description: 'Food delivery online order',
    notes: 'Dinner order on Swiggy',
    tags: ['food', 'delivery'],
  },
  {
    id: 'exp-2',
    amount: 3730,
    category: 'Food & Dining',
    date: '2026-07-02',
    paymentMethod: 'Credit Card',
    merchant: 'The Golden Pavilion',
    description: 'Fine dining team dinner',
    notes: 'Premium dining experience',
    tags: ['dining-out', 'team'],
  },
  {
    id: 'exp-3',
    amount: 350,
    category: 'Transportation',
    date: '2026-07-04',
    paymentMethod: 'Mobile Wallet',
    merchant: 'Uber',
    description: 'Uber ride to office',
    tags: ['commute', 'work'],
  },
  {
    id: 'exp-4',
    amount: 1800,
    category: 'Transportation',
    date: '2026-07-03',
    paymentMethod: 'Credit Card',
    merchant: 'IndiGo Flight Deposit',
    description: 'Weekend travel flight ticket',
    tags: ['travel', 'commute'],
  },
  {
    id: 'exp-5',
    amount: 1200,
    category: 'Bills & Utilities',
    date: '2026-07-03',
    paymentMethod: 'Bank Transfer',
    merchant: 'Electricity Bill',
    description: 'Monthly electricity bill payment',
    tags: ['utilities', 'bill'],
  },
  {
    id: 'exp-6',
    amount: 1780,
    category: 'Bills & Utilities',
    date: '2026-07-01',
    paymentMethod: 'Bank Transfer',
    merchant: 'Bandra Water Board',
    description: 'Quarterly water supply bill',
    tags: ['utilities', 'water'],
  },
  {
    id: 'exp-7',
    amount: 1850,
    category: 'Shopping',
    date: '2026-07-03',
    paymentMethod: 'Credit Card',
    merchant: 'Amazon',
    description: 'Office accessories order',
    tags: ['shopping', 'amazon'],
  },
  {
    id: 'exp-8',
    amount: 1270,
    category: 'Shopping',
    date: '2026-07-01',
    paymentMethod: 'Credit Card',
    merchant: 'Apple Online Store',
    description: 'Lightning charging adapter',
    tags: ['tech', 'accessories'],
  },
  {
    id: 'exp-9',
    amount: 1250,
    category: 'Entertainment',
    date: '2026-07-02',
    paymentMethod: 'Credit Card',
    merchant: 'Netflix & Cinema',
    description: 'Monthly OTT subscription and weekend movie tickets',
    tags: ['subscription', 'movies'],
  },
  {
    id: 'exp-10',
    amount: 890,
    category: 'Health & Wellness',
    date: '2026-07-02',
    paymentMethod: 'Debit Card',
    merchant: 'Apex Fitness Supplement',
    description: 'Monthly health supplements and proteins',
    tags: ['gym', 'health'],
  },
  {
    id: 'exp-11',
    amount: 1338.38,
    category: 'Others',
    date: '2026-07-03',
    paymentMethod: 'Cash',
    merchant: 'Local Miscellaneous Spares',
    description: 'Hardware items and stationeries',
    tags: ['spares', 'misc'],
  },
  // Income Transaction (Salary) which shows up in green as +₹26,479.00
  {
    id: 'exp-income-1',
    amount: 26479,
    category: 'Income',
    date: '2026-07-01',
    paymentMethod: 'Bank Transfer',
    merchant: 'Salary',
    description: 'Monthly Professional Remuneration Credit',
    notes: 'Regular salary credit',
    tags: ['salary', 'income'],
  },
];

export const INITIAL_BUDGET: Budget = {
  monthlyBudget: 25000,
  categoryBudgets: {
    'Food & Dining': 8000,
    'Shopping': 6000,
    'Transportation': 4000,
    'Bills & Utilities': 5000,
    'Entertainment': 2000,
    'Health & Wellness': 2000,
    'Travel': 4000,
    'Education': 2000,
    'Others': 2000,
  },
};

export const INITIAL_PROFILE: Profile = {
  name: 'Hindta',
  email: 'hindta@fintech.in',
  phone: '+91 98765 43210',
  address: '742 Evergreen Heights, Bandra West, Mumbai, MH 400050',
  photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
};

export const INITIAL_REMINDERS: BillReminder[] = [
  {
    id: 'rem-1',
    title: 'Internet Bill',
    amount: 799,
    dueDate: '2026-07-10',
    category: 'Bills & Utilities',
    paid: false,
  },
  {
    id: 'rem-2',
    title: 'Mobile Recharge',
    amount: 349,
    dueDate: '2026-07-12',
    category: 'Bills & Utilities',
    paid: false,
  },
  {
    id: 'rem-3',
    title: 'Credit Card Payment',
    amount: 2500,
    dueDate: '2026-07-15',
    category: 'Bills & Utilities',
    paid: false,
  },
];

export const INITIAL_SETTINGS: UserSettings = {
  currency: 'INR',
  language: 'en',
  darkMode: false,
  notificationsEnabled: true,
};

// Simple load/save helper
export const loadLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
  }
  return defaultValue;
};

export const saveLocalStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};
