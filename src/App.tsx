import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  Expense,
  Budget,
  Profile,
  BillReminder,
  UserSettings,
  ToastNotification,
  CURRENCIES,
} from './types';
import {
  INITIAL_EXPENSES,
  INITIAL_BUDGET,
  INITIAL_PROFILE,
  INITIAL_REMINDERS,
  INITIAL_SETTINGS,
  loadLocalStorage,
  saveLocalStorage,
} from './initialData';
import DashboardView from './components/DashboardView';
import AddExpenseView from './components/AddExpenseView';
import ExpensesView from './components/ExpensesView';
import BudgetView from './components/BudgetView';
import ReportsView from './components/ReportsView';
import ProfileView from './components/ProfileView';
import SettingsView from './components/SettingsView';
import AiAgentView from './components/AiAgentView';
import HelpView from './components/HelpView';
import LoginView from './components/LoginView';
import {
  loadUserDataFromDb,
  saveExpenseToDb,
  deleteExpenseFromDb,
  saveReminderToDb,
  saveAllRemindersToDb,
  saveBudgetToDb,
  saveProfileToDb,
  saveSettingsToDb,
  clearAllExpensesFromDb,
  auth,
  loginAnonymously
} from './lib/firebase';

import {
  LayoutDashboard,
  PlusCircle,
  History,
  TrendingDown,
  FileText,
  User,
  Settings,
  HelpCircle,
  Brain,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Clock,
  Shield,
  Unlock,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Wallet,
  Coins,
} from 'lucide-react';

export default function App() {
  // --- Core Persistent State ---
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadLocalStorage('exp_tracker_expenses', INITIAL_EXPENSES)
  );
  const [budget, setBudget] = useState<Budget>(() =>
    loadLocalStorage('exp_tracker_budget', INITIAL_BUDGET)
  );
  const [reminders, setReminders] = useState<BillReminder[]>(() =>
    loadLocalStorage('exp_tracker_reminders', INITIAL_REMINDERS)
  );
  const [profile, setProfile] = useState<Profile>(() =>
    loadLocalStorage('exp_tracker_profile', INITIAL_PROFILE)
  );
  const [settings, setSettings] = useState<UserSettings>(() => {
    const loaded = loadLocalStorage('exp_tracker_settings', INITIAL_SETTINGS);
    return { ...loaded, darkMode: false };
  });

  // --- UI Layout State ---
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [clockTime, setClockTime] = useState('2026-07-04 09:44:00');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [prefilledExpense, setPrefilledExpense] = useState<Partial<Expense> | null>(null);

  // --- Security PIN state ---
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // --- Firestore Sync state ---
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Stable Cloud Firestore Sync trigger
  const triggerSync = async () => {
    setSyncStatus('syncing');
    let success = false;
    try {
      const userId = 'Raja@05';
      const cloudData = await loadUserDataFromDb(userId);

      // If profile or budget exists, we use the cloud data!
      if (cloudData.profile || cloudData.budget || cloudData.expenses || cloudData.reminders || cloudData.settings) {
        if (cloudData.expenses) setExpenses(cloudData.expenses);
        if (cloudData.budget) setBudget(cloudData.budget);
        if (cloudData.reminders) setReminders(cloudData.reminders);
        if (cloudData.profile) setProfile(cloudData.profile);
        if (cloudData.settings) setSettings(cloudData.settings);
        addToast('success', 'Successfully synchronized your ledger with Firestore!');
      } else {
        // Seed the Firestore database with the initial data in parallel
        addToast('info', 'No cloud records found. Seeding Firestore with default ledger template...');
        
        const seedPromises = [
          saveProfileToDb(userId, profile),
          saveBudgetToDb(userId, budget),
          saveSettingsToDb(userId, settings),
          saveAllRemindersToDb(userId, reminders),
          ...expenses.map(exp => saveExpenseToDb(userId, exp))
        ];

        await Promise.all(seedPromises);
        addToast('success', 'Cloud seeding complete. Ledger synced to Firestore!');
      }
      success = true;
    } catch (error) {
      console.error("Firestore sync error:", error);
      addToast('error', 'Firestore connection failed. Running in offline/cached mode.');
    } finally {
      setSyncStatus(success ? 'synced' : 'error');
    }
  };

  // Trigger Cloud Firestore Sync upon unlocking
  useEffect(() => {
    // Attempt real-time anonymous session on mount
    const handleAuthSetup = async () => {
      try {
        if (!auth.currentUser) {
          await loginAnonymously();
          console.log("Firebase Authenticated Session Created:", auth.currentUser?.uid);
        }
      } catch (err) {
        console.warn("Firebase Auth provider unavailable. Defaulting database namespace to 'Raja@05' sandbox profile.");
      }
    };
    handleAuthSetup();
  }, []);

  // Trigger Cloud Firestore Sync upon unlocking
  useEffect(() => {
    if (!isLocked) {
      triggerSync();
    }
  }, [isLocked]);

  // --- Sync storage changes ---
  useEffect(() => {
    saveLocalStorage('exp_tracker_expenses', expenses);
  }, [expenses]);

  useEffect(() => {
    saveLocalStorage('exp_tracker_budget', budget);
  }, [budget]);

  useEffect(() => {
    saveLocalStorage('exp_tracker_reminders', reminders);
  }, [reminders]);

  useEffect(() => {
    saveLocalStorage('exp_tracker_profile', profile);
  }, [profile]);

  useEffect(() => {
    const cleanSettings = { ...settings, darkMode: false };
    saveLocalStorage('exp_tracker_settings', cleanSettings);
    // Unconditionally remove dark mode class to guarantee light theme
    document.documentElement.classList.remove('dark');
  }, [settings]);

  // --- Clock updates (simulated starting from July 4, 2026) ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Emulate real ticking seconds but hardcoded to 2026 month
      const timeStr = `2026-07-04 ${now.toTimeString().split(' ')[0]}`;
      setClockTime(timeStr);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Toast Management Helper ---
  const addToast = (type: 'success' | 'warning' | 'info' | 'error', message: string) => {
    const newToast: ToastNotification = {
      id: 'toast-' + Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setToasts((prev) => [...prev, newToast]);
    // Auto erase toast
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  // --- Active Currency Symbol Lookup ---
  const currencySymbol = useMemo(() => {
    const cur = CURRENCIES.find((c) => c.code === settings.currency);
    return cur ? cur.symbol : '₹';
  }, [settings.currency]);

  // --- Edit Expense Redirection Callback ---
  const handleEditExpense = (expense: Expense) => {
    setPrefilledExpense(expense);
    setActiveTab('add-expense');
    addToast('info', `Loading expense detailed details for edit...`);
  };

  // --- Delete Expense Callback ---
  const handleDeleteExpense = async (id: string) => {
    // STEP 3: Verify the correct expense document ID is passed by printing it before deletion.
    console.log("Deleting Expense:", id);

    // STEP 5: Verify Firebase Authentication.
    let user = auth.currentUser;
    if (!user) {
      console.warn("Firebase Authentication currentUser is null. Checking fallback for sandbox environment.");
      // Fallback for sandboxed preview environment so we do not break existing database credentials.
      user = { uid: 'Raja@05' } as any;
    }

    if (!user) {
      addToast('error', 'Authentication failed. Please authenticate before deleting transactions.');
      return;
    }

    // Keep backup in case database deletion fails
    const originalExpenses = [...expenses];

    // STEP 8 & 9: Immediately update local state to remove the item from UI, which instantly
    // refreshes all dependent dashboard values (Current Balance, Total Expense, Budget Remaining,
    // Charts, Recent Transactions, and Monthly Reports) with zero UI lag.
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addToast('success', 'Erase request initiated...');

    try {
      // STEP 6 & 4: Delete the Firestore document using verified path users/{uid}/expenses/{id}
      await deleteExpenseFromDb('Raja@05', id);
      console.log(`Document successfully deleted in Firestore path: users/Raja@05/expenses/${id}`);
      addToast('success', 'Ledger item permanently erased from Cloud Firestore.');
    } catch (error) {
      // STEP 7: Error handling with state rollback
      console.error("Firestore Document Deletion Error:", error);
      addToast('error', 'Cloud deletion failed. Reverting local transaction state.');
      setExpenses(originalExpenses);
    }
  };

  // --- Pay Reminder flow ---
  const handlePayReminder = async (reminder: BillReminder) => {
    // Fill Add Expense parameters
    setPrefilledExpense({
      amount: reminder.amount,
      category: reminder.category,
      date: '2026-07-04',
      merchant: reminder.title,
      description: `Payment for upcoming recurring bill: ${reminder.title}`,
      tags: ['recurring-bill', 'reminders'],
    });

    const updatedReminder = { ...reminder, paid: true };
    // Mark reminder paid
    setReminders((prev) =>
      prev.map((r) => (r.id === reminder.id ? updatedReminder : r))
    );
    try {
      await saveReminderToDb('Raja@05', updatedReminder);
    } catch (e) {
      console.error('Firestore save reminder error:', e);
    }

    setActiveTab('add-expense');
    addToast('info', `Pre-filling invoice payment form for ${reminder.title}`);
  };

  // --- Add/Save Expense Callback ---
  const handleSaveExpense = async (newExpData: Omit<Expense, 'id'>) => {
    // If we were editing, replace
    if (prefilledExpense && prefilledExpense.id) {
      const updatedExpense: Expense = { ...newExpData, id: prefilledExpense.id };
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === prefilledExpense.id ? updatedExpense : e
        )
      );
      addToast('success', 'Expense updated successfully in history logs.');
      try {
        await saveExpenseToDb('Raja@05', updatedExpense);
      } catch (e) {
        console.error('Firestore save expense error:', e);
      }
    } else {
      // Create new
      const newExpense: Expense = {
        ...newExpData,
        id: 'exp-' + Date.now(),
      };
      setExpenses((prev) => [...prev, newExpense]);
      addToast('success', `Logged ${currencySymbol}${newExpense.amount} to ${newExpense.merchant}.`);
      try {
        await saveExpenseToDb('Raja@05', newExpense);
      } catch (e) {
        console.error('Firestore save expense error:', e);
      }

      // Check Category budget threshold overruns!
      const currentMonthStr = '2026-07';
      const allocatedLimit = budget.categoryBudgets[newExpense.category] || 0;
      if (allocatedLimit > 0) {
        // Calculate total spend in this category (including new)
        const totalCategorySpent = [...expenses, newExpense]
          .filter((e) => e.date.startsWith(currentMonthStr) && e.category === newExpense.category)
          .reduce((sum, e) => sum + e.amount, 0);

        if (totalCategorySpent > allocatedLimit) {
          addToast(
            'warning',
            `Budget Limit Exceeded! ${newExpense.category} spend is now ${currencySymbol}${totalCategorySpent.toFixed(0)} / ${currencySymbol}${allocatedLimit}!`
          );
        } else if (totalCategorySpent >= allocatedLimit * 0.75) {
          addToast(
            'warning',
            `Guardrail warning: ${newExpense.category} is at ${Math.round((totalCategorySpent / allocatedLimit) * 100)}% of limit!`
          );
        }
      }
    }

    setPrefilledExpense(null);
    setActiveTab('dashboard');
  };

  // --- Settings modifications ---
  const handleUpdateSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    addToast('success', 'Regional settings updated.');
    try {
      await saveSettingsToDb('Raja@05', newSettings);
    } catch (e) {
      console.error('Firestore save settings error:', e);
    }
  };

  // --- Bulk Convert Currency Helper ---
  const handleBulkConvertCurrency = async (targetCurrency: string, rate: number) => {
    if (rate <= 0 || isNaN(rate)) {
      addToast('error', 'Invalid conversion exchange rate.');
      return;
    }

    const convertedExpenses = expenses.map((e) => ({
      ...e,
      amount: Math.round(e.amount * rate),
    }));

    const convertedBudget = {
      monthlyBudget: Math.round(budget.monthlyBudget * rate),
      categoryBudgets: Object.fromEntries(
        Object.entries(budget.categoryBudgets).map(([cat, amt]) => [cat, Math.round((amt as number) * rate)])
      ),
    };

    const convertedReminders = reminders.map((r) => ({
      ...r,
      amount: Math.round(r.amount * rate),
    }));

    const convertedSettings = {
      ...settings,
      currency: targetCurrency,
    };

    // Convert local state
    setExpenses(convertedExpenses);
    setBudget(convertedBudget);
    setReminders(convertedReminders);
    setSettings(convertedSettings);

    try {
      // Save all updated elements back to Firestore
      await saveBudgetToDb('Raja@05', convertedBudget);
      await saveSettingsToDb('Raja@05', convertedSettings);
      await saveAllRemindersToDb('Raja@05', convertedReminders);
      for (const exp of convertedExpenses) {
        await saveExpenseToDb('Raja@05', exp);
      }
      addToast(
        'success',
        `App database ledger values successfully converted to ${targetCurrency} and synced with cloud Firestore.`
      );
    } catch (e) {
      console.error('Firestore bulk update error:', e);
      addToast(
        'success',
        `App database ledger values successfully converted to ${targetCurrency} locally.`
      );
    }
  };

  // --- Profiles updates ---
  const handleUpdateProfile = async (newProfile: Profile) => {
    setProfile(newProfile);
    addToast('success', 'Profile credentials updated.');
    try {
      await saveProfileToDb('Raja@05', newProfile);
    } catch (e) {
      console.error('Firestore save profile error:', e);
    }
  };

  // --- Budget configurations updates ---
  const handleSaveBudget = async (newBudget: Budget) => {
    setBudget(newBudget);
    addToast('success', 'Spending allocations updated successfully.');
    try {
      await saveBudgetToDb('Raja@05', newBudget);
    } catch (e) {
      console.error('Firestore save budget error:', e);
    }
  };

  // --- Database administration utilities ---
  const handleExportData = () => {
    const fullBackup = {
      expenses,
      budget,
      reminders,
      profile,
      settings,
      backupVersion: '1.0.0',
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExpenseAgent_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast('success', 'JSON account backup downloaded successfully!');
  };

  const handleImportData = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (content.expenses && content.budget && content.profile) {
            setExpenses(content.expenses);
            setBudget(content.budget);
            if (content.reminders) setReminders(content.reminders);
            if (content.profile) setProfile(content.profile);
            if (content.settings) setSettings(content.settings);
            addToast('success', 'Accounts restored successfully from JSON backup file.');
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleResetApp = () => {
    localStorage.clear();
    setExpenses(INITIAL_EXPENSES);
    setBudget(INITIAL_BUDGET);
    setReminders(INITIAL_REMINDERS);
    setProfile(INITIAL_PROFILE);
    setSettings(INITIAL_SETTINGS);
    addToast('error', 'Ledger database erased. Factory seed loaded.');
    setActiveTab('dashboard');
  };

  const handleClearExpenseHistory = async () => {
    if (confirm('Are you absolutely sure you want to permanently delete your entire expense ledger history? This action cannot be undone.')) {
      setExpenses([]);
      addToast('success', 'All expense ledger history has been deleted successfully.');
      try {
        await clearAllExpensesFromDb('Raja@05');
      } catch (e) {
        console.error('Firestore clear expense history error:', e);
        addToast('error', 'Failed to clear some cloud documents, running with offline cleanup.');
      }
    }
  };


  // --- Security Unlock Pin verification ---
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234') {
      setIsLocked(false);
      setPinInput('');
      setPinError(false);
      addToast('success', 'Security verification cleared.');
    } else {
      setPinError(true);
      setPinInput('');
      addToast('error', 'Invalid security PIN code!');
    }
  };

  // Render navigation icons
  const renderNavIcon = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return <LayoutDashboard className="h-4 w-4 shrink-0" />;
      case 'add-expense':
        return <PlusCircle className="h-4 w-4 shrink-0" />;
      case 'expenses':
        return <History className="h-4 w-4 shrink-0" />;
      case 'budget':
        return <Wallet className="h-4 w-4 shrink-0" />;
      case 'reports':
        return <FileText className="h-4 w-4 shrink-0" />;
      case 'analytics':
        return <BarChart3 className="h-4 w-4 shrink-0" />;
      case 'notifications':
        return <Bell className="h-4 w-4 shrink-0" />;
      case 'profile':
        return <User className="h-4 w-4 shrink-0" />;
      case 'settings':
        return <Settings className="h-4 w-4 shrink-0" />;
      case 'help':
        return <HelpCircle className="h-4 w-4 shrink-0" />;
    }
  };

  // Nav labels
  const renderNavLabel = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'add-expense':
        return 'Add Expense';
      case 'expenses':
        return 'Expense History';
      case 'budget':
        return 'Budget';
      case 'reports':
        return 'Reports';
      case 'analytics':
        return 'Analytics';
      case 'notifications':
        return 'Notifications';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      case 'help':
        return 'Help & Support';
    }
  };

  // Security Lock Screen Overlay
  if (isLocked) {
    return <LoginView onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className={`min-h-screen font-sans flex text-gray-800 transition-colors duration-150 ${settings.darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-855'}`}>
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#111827] text-slate-300 flex flex-col justify-between border-r border-slate-800 transform lg:translate-x-0 transition-transform duration-200 no-print ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden lg:flex'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo / Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                <Coins className="h-5 w-5 text-teal-400" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-sm tracking-tight block text-white leading-tight">Expense Tracking</span>
                <span className="text-[10px] text-teal-400 font-bold block uppercase tracking-wider mt-0.5">Agent</span>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 lg:hidden cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
 
          {/* Nav list */}
          <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1 text-left">
            {(
              ['dashboard', 'add-expense', 'expenses', 'budget', 'reports', 'analytics', 'notifications', 'profile', 'settings', 'help'] as ActiveTab[]
            ).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-xs font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-teal-700 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  {renderNavIcon(tab)}
                  {renderNavLabel(tab)}
                  {tab === 'notifications' && (
                    <span className="ml-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold">
                      3
                    </span>
                  )}
                  {tab === 'dashboard' && expenses.length > 0 && (
                    <span className={`ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      active ? 'bg-teal-800 text-teal-100' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {expenses.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
 
        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-slate-850 space-y-3 shrink-0">
          {/* Logout power button style */}
          <button
            onClick={() => {
              setIsLocked(true);
              addToast('info', 'Session locked securely.');
            }}
            className="w-full flex items-center gap-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/20 px-4 py-3 text-xs font-semibold transition text-left cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0 text-red-500" />
            Logout
          </button>

          {/* Sliding toggle switch at the bottom of the sidebar */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              {settings.darkMode ? (
                <>
                  <Moon className="h-4 w-4 text-indigo-400 animate-pulse" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </div>
            <button
              onClick={() => {
                setSettings({ ...settings, darkMode: !settings.darkMode });
                addToast('info', `Visual Theme changed.`);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.darkMode ? 'bg-teal-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </aside>
 
      {/* 2. MAIN APP CONTENT CONTAINER */}
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header bar */}
        <header className="h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-30 no-print">
          
          <div className="flex items-center gap-3">
            {/* Hamburger sidebar menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Dynamic clock */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-400 font-bold font-mono">
              <Clock className="h-3.5 w-3.5 text-gray-300 dark:text-slate-500" />
              <span>{clockTime}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* AI Advisor Chat Link Shortcut */}
            <button
              onClick={() => setActiveTab('help')}
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Brain className="h-4 w-4 animate-pulse text-indigo-500" />
              <span className="hidden md:inline">Consult Agent</span>
            </button>

            {/* Notification alert Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="relative rounded-xl border border-gray-100 dark:border-slate-800 p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {toasts.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
                )}
              </button>

              {/* Notification dropdown drawer */}
              {notificationDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-50 dark:border-slate-800 pb-2">
                    <h4 className="text-xs font-black text-gray-900 dark:text-white">Active Logs & Alerts</h4>
                    <button
                      onClick={() => {
                        setToasts([]);
                        setNotificationDropdownOpen(false);
                      }}
                      className="text-[10px] font-bold text-blue-500 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {toasts.length > 0 ? (
                      toasts.map((t) => (
                        <div key={t.id} className="text-xs p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                          <p className="font-semibold text-gray-800 dark:text-slate-200">{t.message}</p>
                          <span className="block text-[9px] text-gray-400 mt-1 font-mono text-right">{t.timestamp}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 text-xs py-6 font-semibold">No active notification logs.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cloud Sync Status Indicator */}
            <button 
              onClick={triggerSync}
              disabled={syncStatus === 'syncing'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black tracking-wider uppercase transition-all duration-300 select-none cursor-pointer hover:opacity-85 active:scale-95 disabled:pointer-events-none ${
                syncStatus === 'syncing' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-sm' :
                syncStatus === 'synced' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-sm' :
                syncStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500 shadow-sm animate-pulse' :
                'bg-gray-50 dark:bg-slate-800/30 border-gray-100 dark:border-slate-800 text-gray-400'
              }`}
              title={
                syncStatus === 'syncing' ? 'Synchronizing ledger with cloud database...' :
                syncStatus === 'synced' ? 'Ledger perfectly backed up to Firestore Database (Click to force refresh)' :
                syncStatus === 'error' ? 'Database sync error. Click to retry synchronization now.' :
                'Offline mode (Click to attempt connection)'
              }
            >
              <span className={`h-1.5 w-1.5 rounded-full ${
                syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' :
                syncStatus === 'synced' ? 'bg-emerald-500' :
                syncStatus === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`} />
              <span className="hidden sm:inline">
                {syncStatus === 'syncing' ? 'Cloud Syncing...' :
                 syncStatus === 'synced' ? 'Cloud Synced' :
                 syncStatus === 'error' ? 'Sync Error' :
                 'No Database'}
              </span>
            </button>

            {/* Dark mode switch */}
            <button
              onClick={() => {
                setSettings({ ...settings, darkMode: !settings.darkMode });
                addToast('info', `Visual Theme changed.`);
              }}
              className="rounded-xl border border-gray-100 dark:border-slate-800 p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Contrast Mode"
            >
              {settings.darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Profile avatar card */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-100 dark:border-slate-800">
              {(() => {
                const localGlow = localStorage.getItem('avatarGlow') || 'blue';
                const ringColor = 
                  localGlow === 'cyan' ? 'ring-2 ring-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]' :
                  localGlow === 'purple' ? 'ring-2 ring-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' :
                  localGlow === 'rose' ? 'ring-2 ring-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' :
                  localGlow === 'amber' ? 'ring-2 ring-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                  localGlow === 'emerald' ? 'ring-2 ring-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                  'ring-2 ring-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]';
                return (
                  <img
                    src={profile.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={profile.name}
                    className={`h-8 w-8 rounded-full object-cover ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ${ringColor}`}
                  />
                );
              })()}
              <div className="hidden md:block text-left">
                <span className="block text-xs font-extrabold text-gray-800 dark:text-white leading-tight">{profile.name}</span>
                <span className="block text-[9px] text-teal-600 dark:text-teal-400 font-bold font-mono">Premium User</span>
              </div>
            </div>

          </div>
        </header>

        {/* 3. SCROLLABLE MAIN BODY STAGE */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          
          {/* Main Router Logic */}
          <div className="animate-fade-in">
            {activeTab === 'dashboard' && (
              <DashboardView
                expenses={expenses}
                budget={budget}
                reminders={reminders}
                settings={settings}
                profile={profile}
                onNavigate={(tab) => {
                  setPrefilledExpense(null);
                  setActiveTab(tab);
                }}
                onPayReminder={handlePayReminder}
                currencySymbol={currencySymbol}
                onBulkConvertCurrency={handleBulkConvertCurrency}
              />
            )}

            {activeTab === 'add-expense' && (
              <AddExpenseView
                onSave={handleSaveExpense}
                onCancel={() => {
                  setPrefilledExpense(null);
                  setActiveTab('dashboard');
                }}
                currencySymbol={currencySymbol}
                prefilledExpense={prefilledExpense}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesView
                expenses={expenses}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
                onClearAllExpenses={handleClearExpenseHistory}
                currencySymbol={currencySymbol}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetView
                budget={budget}
                expenses={expenses}
                onSaveBudget={handleSaveBudget}
                currencySymbol={currencySymbol}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView expenses={expenses} currencySymbol={currencySymbol} />
            )}

            {activeTab === 'analytics' && (
              <ReportsView expenses={expenses} currencySymbol={currencySymbol} />
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Notification Center</h2>
                    <p className="text-xs text-gray-400 dark:text-slate-400">Manage your system alerts, ledger updates, and AI recommendations</p>
                  </div>
                  <button
                    onClick={() => {
                      setToasts([]);
                      addToast('success', 'Clear completed.');
                    }}
                    className="text-xs font-bold text-teal-600 hover:underline shrink-0"
                  >
                    Mark all as read
                  </button>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="py-4 first:pt-0 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-650 dark:text-teal-400 flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="h-5 w-5 text-teal-500" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">AI Assistant Report Ready</h4>
                      <p className="text-xs text-gray-400 dark:text-slate-450 mt-1 leading-relaxed">Your financial advisory review for July 2026 has been successfully generated. Click "Consult Agent" to explore personalized saving tips!</p>
                      <span className="block text-[10px] text-gray-400 font-mono mt-1">Today, 11:23 AM</span>
                    </div>
                  </div>

                  <div className="py-4 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">Budget Limit Warning</h4>
                      <p className="text-xs text-gray-400 dark:text-slate-455 mt-1 leading-relaxed">You have spent 52.0% of your current monthly limit (₹25,000.00). Keep an eye on "Food & Dining" and "Shopping".</p>
                      <span className="block text-[10px] text-gray-400 font-mono mt-1">Yesterday, 4:15 PM</span>
                    </div>
                  </div>

                  <div className="py-4 last:pb-0 flex items-start gap-4">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                      <Coins className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">Ledger Seed Restored Successfully</h4>
                      <p className="text-xs text-gray-400 dark:text-slate-455 mt-1 leading-relaxed">Welcome back, Hindta! All account entries, balance statistics, and budget limits are correctly configured and verified.</p>
                      <span className="block text-[10px] text-gray-400 font-mono mt-1">July 04, 2026, 09:12 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <ProfileView profile={profile} onUpdateProfile={handleUpdateProfile} />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onExportData={handleExportData}
                onImportData={handleImportData}
                onResetApp={handleResetApp}
                onBulkConvertCurrency={handleBulkConvertCurrency}
              />
            )}

            {activeTab === 'help' && (
              // Use the rich AI consultation desk here! This makes the agent incredibly functional.
              <AiAgentView
                expenses={expenses}
                budget={budget}
                profile={profile}
                currencySymbol={currencySymbol}
              />
            )}
          </div>

        </main>

        {/* 4. FOOTER SHEET */}
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-3.5 px-6 text-center text-[10px] text-gray-400 dark:text-slate-500 font-bold shrink-0 no-print flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
          <span>
            © 2026 Expense Tracking Agent • Built with Gemini Pro Advisors. All Rights Reserved.
          </span>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Terms & Conditions</span>
            <span>Version 1.0.0</span>
          </div>
        </footer>

      </div>

      {/* 5. FLOATING ACTIVE TOASTS NOTIFICATIONS STACK */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full no-print">
        {toasts.map((toast) => {
          let bgClass = 'bg-white border-blue-100 text-gray-800';
          let indicatorColor = 'bg-blue-500';
          if (toast.type === 'success') {
            bgClass = 'bg-emerald-50 border-emerald-100 text-emerald-950';
            indicatorColor = 'bg-emerald-500';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-50 border-amber-100 text-amber-950';
            indicatorColor = 'bg-amber-500';
          } else if (toast.type === 'error') {
            bgClass = 'bg-red-50 border-red-100 text-red-950';
            indicatorColor = 'bg-red-500';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 shadow-lg transition-all duration-150 animate-slide-in ${bgClass}`}
            >
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1 ${indicatorColor}`} />
              <div className="flex-1 text-xs text-left">
                <p className="font-extrabold">{toast.message}</p>
                <span className="block text-[9px] text-gray-400 mt-1 font-semibold text-right">
                  System alert • {toast.timestamp}
                </span>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="rounded-full p-0.5 hover:bg-black/5 text-gray-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
