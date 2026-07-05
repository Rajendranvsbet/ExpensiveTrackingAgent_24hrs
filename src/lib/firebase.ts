import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { Expense, Budget, Profile, BillReminder, UserSettings } from '../types';
import config from '../../firebase-applet-config.json';

const app = initializeApp(config);

// Connect to the specific custom database ID provisioned for this applet
export const db = config.firestoreDatabaseId 
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

// Initialize and export Firebase Auth
export const auth = getAuth(app);

/**
 * Loads all user-specific financial ledger data from Firestore.
 * This is parallelized using Promise.all and guarded with a timeout race to prevent hanging.
 */
export async function loadUserDataFromDb(userId: string) {
  const cleanId = userId.trim();
  
  const profileRef = doc(db, 'users', cleanId, 'profile', 'main');
  const budgetRef = doc(db, 'users', cleanId, 'budget', 'main');
  const settingsRef = doc(db, 'users', cleanId, 'settings', 'main');
  const expensesColRef = collection(db, 'users', cleanId, 'expenses');
  const remindersColRef = collection(db, 'users', cleanId, 'reminders');

  // Load all 5 distinct targets in parallel for high-speed synchronization
  const loadPromise = Promise.all([
    getDoc(profileRef),
    getDoc(budgetRef),
    getDoc(settingsRef),
    getDocs(expensesColRef),
    getDocs(remindersColRef)
  ]);

  // Establish a generous 15-second timeout race condition to support container cold-starts and latency
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore connection timed out')), 15000)
  );

  const [
    profileSnap,
    budgetSnap,
    settingsSnap,
    expensesSnap,
    remindersSnap
  ] = await Promise.race([loadPromise, timeoutPromise]);

  const profile = profileSnap.exists() ? (profileSnap.data() as Profile) : null;
  const budget = budgetSnap.exists() ? (budgetSnap.data() as Budget) : null;
  const settings = settingsSnap.exists() ? (settingsSnap.data() as UserSettings) : null;

  const expenses: Expense[] = [];
  expensesSnap.forEach((d: any) => {
    expenses.push(d.data() as Expense);
  });

  const reminders: BillReminder[] = [];
  remindersSnap.forEach((d: any) => {
    reminders.push(d.data() as BillReminder);
  });

  return {
    profile,
    budget,
    settings,
    expenses: expenses.length > 0 ? expenses : null,
    reminders: reminders.length > 0 ? reminders : null,
  };
}

/**
 * Deep cleans an object/array to remove any 'undefined' values before saving to Firestore.
 */
function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = cleanUndefined(val);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Saves or updates a single expense record in Firestore.
 */
export async function saveExpenseToDb(userId: string, expense: Expense) {
  const expenseRef = doc(db, 'users', userId.trim(), 'expenses', expense.id);
  await setDoc(expenseRef, cleanUndefined(expense));
}

/**
 * Deletes a single expense record from Firestore.
 */
export async function deleteExpenseFromDb(userId: string, expenseId: string) {
  const expenseRef = doc(db, 'users', userId.trim(), 'expenses', expenseId);
  await deleteDoc(expenseRef);
}

/**
 * Saves or updates a single reminder in Firestore.
 */
export async function saveReminderToDb(userId: string, reminder: BillReminder) {
  const reminderRef = doc(db, 'users', userId.trim(), 'reminders', reminder.id);
  await setDoc(reminderRef, cleanUndefined(reminder));
}

/**
 * Saves or updates the entire reminders list in Firestore.
 */
export async function saveAllRemindersToDb(userId: string, reminders: BillReminder[]) {
  const batch = writeBatch(db);
  const remindersColRef = collection(db, 'users', userId.trim(), 'reminders');
  
  // We write each reminder
  for (const reminder of reminders) {
    const reminderRef = doc(remindersColRef, reminder.id);
    batch.set(reminderRef, cleanUndefined(reminder));
  }
  await batch.commit();
}

/**
 * Saves the monthly budget configuration to Firestore.
 */
export async function saveBudgetToDb(userId: string, budget: Budget) {
  const budgetRef = doc(db, 'users', userId.trim(), 'budget', 'main');
  await setDoc(budgetRef, cleanUndefined(budget));
}

/**
 * Saves the user profile configuration to Firestore.
 */
export async function saveProfileToDb(userId: string, profile: Profile) {
  const profileRef = doc(db, 'users', userId.trim(), 'profile', 'main');
  await setDoc(profileRef, cleanUndefined(profile));
}

/**
 * Saves the user settings configuration to Firestore.
 */
export async function saveSettingsToDb(userId: string, settings: UserSettings) {
  const settingsRef = doc(db, 'users', userId.trim(), 'settings', 'main');
  await setDoc(settingsRef, cleanUndefined(settings));
}

/**
 * Adds a new expense record in Firestore.
 */
export async function addExpenseToDb(userId: string, expense: Expense) {
  await saveExpenseToDb(userId, expense);
}

/**
 * Updates an existing expense record in Firestore.
 */
export async function updateExpenseInDb(userId: string, expense: Expense) {
  await saveExpenseToDb(userId, expense);
}

/**
 * Retrieves all expense documents for a specific user.
 */
export async function getExpensesFromDb(userId: string): Promise<Expense[]> {
  const cleanId = userId.trim();
  const expensesColRef = collection(db, 'users', cleanId, 'expenses');
  const snap = await getDocs(expensesColRef);
  const list: Expense[] = [];
  snap.forEach((d) => {
    list.push(d.data() as Expense);
  });
  return list;
}

/**
 * Gets expenses filtered by a specific month and year.
 */
export async function getMonthlyExpensesFromDb(userId: string, month: number, year: number): Promise<Expense[]> {
  const expenses = await getExpensesFromDb(userId);
  return expenses.filter(exp => {
    if (!exp.date) return false;
    const dateObj = new Date(exp.date);
    return dateObj.getMonth() + 1 === month && dateObj.getFullYear() === year;
  });
}

/**
 * Adds a new income record in Firestore under users/{uid}/income
 */
export async function addIncomeToDb(userId: string, income: any) {
  const cleanId = userId.trim();
  const incomeId = income.id || `inc-${Date.now()}`;
  const incomeRef = doc(db, 'users', cleanId, 'income', incomeId);
  await setDoc(incomeRef, cleanUndefined({ ...income, id: incomeId }));
}

/**
 * Updates the budget configuration in Firestore under users/{uid}/budget/main
 */
export async function updateBudgetInDb(userId: string, budget: Budget) {
  await saveBudgetToDb(userId, budget);
}

/**
 * Compiles and returns structured aggregate dashboard metrics from Firestore subcollections.
 */
export async function getDashboardDataFromDb(userId: string) {
  const cleanId = userId.trim();
  const expenses = await getExpensesFromDb(cleanId);
  
  // Get budget
  const budgetRef = doc(db, 'users', cleanId, 'budget', 'main');
  const budgetSnap = await getDoc(budgetRef);
  const budget = budgetSnap.exists() ? (budgetSnap.data() as Budget) : null;

  // Get income list
  const incomeColRef = collection(db, 'users', cleanId, 'income');
  const incomeSnap = await getDocs(incomeColRef);
  const incomeList: any[] = [];
  incomeSnap.forEach((d) => {
    incomeList.push(d.data());
  });

  const totalIncome = incomeList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const currentBalance = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    currentBalance,
    monthlyBudget: budget?.monthlyBudget || 0,
    expenses,
    incomeList,
  };
}

/**
 * Deletes all expense documents from Firestore for the specified user.
 */
export async function clearAllExpensesFromDb(userId: string) {
  const cleanId = userId.trim();
  const expensesColRef = collection(db, 'users', cleanId, 'expenses');
  const snap = await getDocs(expensesColRef);
  
  const batch = writeBatch(db);
  snap.forEach((d) => {
    batch.delete(d.ref);
  });
  await batch.commit();
}

/**
 * Triggers Firebase Auth anonymous sign-in.
 */
export function loginAnonymously() {
  return signInAnonymously(auth);
}

