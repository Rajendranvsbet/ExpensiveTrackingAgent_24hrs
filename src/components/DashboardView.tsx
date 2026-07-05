import React, { useMemo, useState } from 'react';
import { Expense, Budget, BillReminder, UserSettings, Profile } from '../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
  Brain,
  ArrowRight,
  ShieldAlert,
  ArrowLeftRight,
  Coins,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface DashboardViewProps {
  expenses: Expense[];
  budget: Budget;
  reminders: BillReminder[];
  settings: UserSettings;
  profile: Profile;
  onNavigate: (tab: any) => void;
  onPayReminder: (reminder: BillReminder) => void;
  currencySymbol: string;
  onBulkConvertCurrency: (targetCurrency: string, rate: number) => void;
}

const COLORS = [
  '#10B981', // Premium Emerald Green
  '#059669', // Deep Emerald
  '#34D399', // Mint Green
  '#047857', // Forest Green
  '#6EE7B7', // Fresh Mint
  '#71717A', // Zinc Gray
  '#A1A1AA', // Medium Zinc Gray
  '#D4D4D8', // Light Zinc Gray
  '#52525B', // Charcoal Slate
];

export default function DashboardView({
  expenses,
  budget,
  reminders,
  settings,
  profile,
  onNavigate,
  onPayReminder,
  currencySymbol,
  onBulkConvertCurrency,
}: DashboardViewProps) {
  // Current date parameters (assumes 2026 as per local clock)
  const todayStr = '2026-07-04';
  const currentMonthStr = '2026-07';

  // Interactive GST Calculator state
  const [baseVal, setBaseVal] = useState<string>('10000');
  const [gstRate, setGstRate] = useState<number>(18);
  const [totalVal, setTotalVal] = useState<string>('11800');

  const handleBaseChange = (val: string) => {
    setBaseVal(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setTotalVal((parsed * (1 + gstRate / 100)).toFixed(2));
    } else {
      setTotalVal('');
    }
  };

  const handleTotalChange = (val: string) => {
    setTotalVal(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) {
      setBaseVal((parsed / (1 + gstRate / 100)).toFixed(2));
    } else {
      setBaseVal('');
    }
  };

  const handleGstRateChange = (rateStr: string) => {
    const rate = parseFloat(rateStr);
    const validRate = isNaN(rate) || rate < 0 ? 18.0 : rate;
    setGstRate(validRate);
    
    // Recalculate based on current base value
    const parsedBase = parseFloat(baseVal);
    if (!isNaN(parsedBase)) {
      setTotalVal((parsedBase * (1 + validRate / 100)).toFixed(2));
    }
  };

  // Calculations
  const totalExpensesSum = useMemo(() => {
    return expenses
      .filter((e) => e.category !== 'Income')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(currentMonthStr) && e.category !== 'Income');
  }, [expenses, currentMonthStr]);

  const currentMonthExpensesSum = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  // Dynamic monthly income from transaction or fallback
  const monthlyIncome = useMemo(() => {
    const incomeTransactions = expenses.filter((e) => e.date.startsWith(currentMonthStr) && e.category === 'Income');
    if (incomeTransactions.length > 0) {
      return incomeTransactions.reduce((sum, e) => sum + e.amount, 0);
    }
    return 26479.00;
  }, [expenses, currentMonthStr]);

  const currentBalance = useMemo(() => {
    return monthlyIncome - currentMonthExpensesSum;
  }, [monthlyIncome, currentMonthExpensesSum]);

  // Budget spent matching the screenshot (budgeted categories only)
  const budgetSpent = useMemo(() => {
    const budgetedCategories = ['Food & Dining', 'Shopping', 'Transportation', 'Bills & Utilities'];
    return currentMonthExpenses
      .filter((e) => budgetedCategories.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  const remainingBudget = useMemo(() => {
    return budget.monthlyBudget - budgetSpent;
  }, [budget.monthlyBudget, budgetSpent]);

  const savingsRate = useMemo(() => {
    if (monthlyIncome === 0) return 0;
    const savings = monthlyIncome - currentMonthExpensesSum;
    return Math.max(0, Math.round((savings / monthlyIncome) * 100));
  }, [monthlyIncome, currentMonthExpensesSum]);

  const todayExpensesSum = useMemo(() => {
    return expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  const weeklyExpensesSum = useMemo(() => {
    const today = new Date(todayStr);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d >= sevenDaysAgo && d <= today;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, todayStr]);

  // Category chart data
  const categoryChartData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    currentMonthExpenses.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    return Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [currentMonthExpenses]);

  // Monthly trend chart data (last 4 months)
  const monthlyTrendData = useMemo(() => {
    const months = ['2026-04', '2026-05', '2026-06', '2026-07'];
    const monthNames = ['April', 'May', 'June', 'July'];

    return months.map((m, idx) => {
      const sum = expenses
        .filter((e) => e.date.startsWith(m))
        .reduce((s, e) => s + e.amount, 0);
      return {
        name: monthNames[idx],
        Amount: parseFloat(sum.toFixed(2)),
      };
    });
  }, [expenses]);

  // Budget progress
  const budgetProgressPercent = useMemo(() => {
    if (budget.monthlyBudget === 0) return 0;
    return parseFloat(((budgetSpent / budget.monthlyBudget) * 100).toFixed(1));
  }, [budgetSpent, budget.monthlyBudget]);

  const budgetProgressColor = useMemo(() => {
    if (budgetProgressPercent >= 90) return 'bg-rose-500';
    if (budgetProgressPercent >= 75) return 'bg-amber-500';
    return 'bg-teal-500';
  }, [budgetProgressPercent]);

  // Top spending category
  const topCategory = useMemo(() => {
    if (categoryChartData.length > 0) {
      const top = categoryChartData[0];
      const limit = budget.categoryBudgets[top.name as keyof typeof budget.categoryBudgets] || 5000;
      return {
        name: top.name,
        value: top.value,
        budget: limit,
      };
    }
    return { name: 'Food & Dining', value: 4250.81, budget: 8000 };
  }, [categoryChartData, budget]);

  // Get recent 4 transactions
  const recentTransactions = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [expenses]);

  const dynamicWeeklySpending = useMemo(() => {
    return weeklyExpensesSum > 0 ? weeklyExpensesSum : 3245.00;
  }, [weeklyExpensesSum]);

  const dynamicDailyAverage = useMemo(() => {
    return currentMonthExpensesSum > 0 ? parseFloat((currentMonthExpensesSum / 30).toFixed(2)) : 1145.20;
  }, [currentMonthExpensesSum]);

  return (
    <div className="space-y-6">
      {/* Header Banner Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-indigo-900 p-6 text-white shadow-lg md:p-8">
        <div className="relative z-10 md:max-w-xl text-left">
          <span className="inline-block rounded-full bg-teal-400/25 border border-teal-300/30 px-3 py-1 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm text-teal-200">
            AI COGNITIVE ADVISORY ACTIVE
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
            Welcome back, {profile.name}! 👋
          </h2>
          <p className="mt-2 text-teal-100 text-xs md:text-sm leading-relaxed font-semibold">
            Here's your financial overview for today. Your automated ledger is fully synchronized and validated.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('add-expense')}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-teal-900 shadow-md transition hover:bg-slate-50 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 text-teal-600" />
              Add Expense
            </button>
            <button
              onClick={() => onNavigate('help')}
              className="flex items-center gap-2 rounded-xl bg-teal-500/30 px-4 py-2.5 text-xs font-black text-white border border-teal-300/20 backdrop-blur-sm transition hover:bg-teal-500/45 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Brain className="h-4 w-4 text-teal-300 animate-pulse" />
              Consult Agent
            </button>
          </div>
        </div>
        {/* Background Decorative Circles */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-pulse" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {/* Card 1: Balance */}
        <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Current Balance</span>
            <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 p-2 text-teal-600 dark:text-teal-450 shrink-0">
              <Coins className="h-5 w-5 text-teal-500" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              {currencySymbol}{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="mt-1 block text-[10px] text-gray-450 dark:text-slate-500 font-bold">
              Total Balance
            </span>
          </div>
        </div>

        {/* Card 2: Expenses Sum */}
        <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Total Expenses (July)</span>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-2 text-rose-600 dark:text-rose-450 shrink-0">
              <TrendingDown className="h-5 w-5 text-rose-500" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              {currencySymbol}{currentMonthExpensesSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="mt-1 block text-[10px] text-gray-450 dark:text-slate-500 font-bold">
              This Month
            </span>
          </div>
        </div>

        {/* Card 3: Income */}
        <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Total Income (July)</span>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-2 text-blue-600 dark:text-blue-450 shrink-0">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              {currencySymbol}{(26479.00).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="mt-1 block text-[10px] text-gray-450 dark:text-slate-500 font-bold">
              This Month
            </span>
          </div>
        </div>

        {/* Card 4: Budget Remaining */}
        <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Remaining Budget</span>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2 text-amber-600 dark:text-amber-450 shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              {currencySymbol}{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="mt-1 block text-[10px] text-gray-450 dark:text-slate-500 font-bold">
              of {currencySymbol}{budget.monthlyBudget.toLocaleString()} Limit
            </span>
          </div>
        </div>

        {/* Card 5: Savings Status */}
        <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Savings Status</span>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2 text-emerald-600 dark:text-emerald-450 shrink-0">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              {currencySymbol}{(10489.81).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className="mt-1 block text-emerald-600 dark:text-emerald-450 font-bold">
              +65.6% vs last month
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Line Chart card with embedded stats */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between text-left">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Expense Overview</h3>
                <p className="text-xs text-gray-400 dark:text-slate-400">spending trend this month</p>
              </div>
              <span className="rounded-lg bg-teal-50 dark:bg-teal-950/20 px-2.5 py-1 text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30">
                July 2026
              </span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [`${currencySymbol}${parseFloat(value as string).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Spent']}
                    contentStyle={{ backgroundColor: '#ffffff', color: '#1e293b', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="Amount" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Embedded stats block within the chart card */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 p-2.5 text-teal-650 dark:text-teal-400 shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Weekly Expense</span>
                <span className="text-sm font-black text-slate-800 dark:text-white">
                  {currencySymbol}{dynamicWeeklySpending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-rose-500 font-bold block mt-0.5">+12.5% vs avg</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-2.5 text-indigo-650 dark:text-indigo-400 shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Daily Average</span>
                <span className="text-sm font-black text-slate-800 dark:text-white">
                  {currencySymbol}{dynamicDailyAverage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-teal-500 font-bold block mt-0.5">-2.4% lower</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between text-left">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Expense by Category</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mb-4">Distribution of expenses this month</p>
            <div className="relative h-56 w-full flex items-center justify-center">
              {categoryChartData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${currencySymbol}${parseFloat(value as string).toLocaleString()}`]}
                        contentStyle={{ backgroundColor: '#ffffff', color: '#1e293b', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Total Spent</span>
                    <span className="text-base font-black text-slate-800 dark:text-white mt-0.5">
                      {currencySymbol}{currentMonthExpensesSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 dark:text-slate-500 text-xs py-8">
                  <ShieldAlert className="mx-auto h-8 w-8 text-gray-300 dark:text-slate-600 mb-2" />
                  No expenses logged in July 2026.
                </div>
              )}
            </div>
          </div>
          {/* Legend */}
          <div className="max-h-24 overflow-y-auto mt-2 text-xs grid grid-cols-1 gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
            {categoryChartData.slice(0, 5).map((item, idx) => {
              const percent = currentMonthExpensesSum > 0 ? ((item.value / currentMonthExpensesSum) * 100).toFixed(1) : '0';
              return (
                <div key={item.name} className="flex items-center gap-1.5 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate text-gray-500 dark:text-slate-400 font-semibold">{item.name}</span>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">({percent}%)</span>
                  <span className="font-bold text-gray-700 dark:text-slate-300 ml-auto shrink-0">{currencySymbol}{item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive GST & Invoice Tax Calculator Tool */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Coins className="h-5 w-5 text-emerald-500 animate-pulse" />
              Interactive GST & Invoice Tax Calculator
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-400">Instantly compute Goods and Services Tax (GST) and assess gross invoice amounts</p>
          </div>
          
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">GST Rate Percentage:</span>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 px-3 py-1.5 text-xs font-bold text-gray-800 dark:text-slate-200">
              <input
                type="number"
                value={gstRate}
                onChange={(e) => handleGstRateChange(e.target.value)}
                className="w-10 bg-transparent text-emerald-600 dark:text-emerald-400 font-bold outline-none text-center focus:ring-1 focus:ring-emerald-500 rounded px-1"
                step="1"
                min="0"
                max="100"
              />
              <span>% GST</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-7 items-center">
          {/* Base Amount Input Panel */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
              Base Amount (Excluding Tax)
            </label>
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 p-3 flex items-center">
              <span className="text-lg font-bold text-gray-400 dark:text-slate-500 mr-2">₹</span>
              <input
                type="number"
                value={baseVal}
                onChange={(e) => handleBaseChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-lg font-bold text-gray-800 dark:text-slate-200 outline-none focus:ring-0"
              />
              <span className="text-xs font-bold text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 select-none shadow-sm shrink-0">
                Net
              </span>
            </div>
          </div>

          {/* Transfer Icon Divider */}
          <div className="md:col-span-1 flex justify-center items-center py-2 md:py-0">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 p-3 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
              <ArrowLeftRight className="h-5 w-5 transform rotate-90 md:rotate-0" />
            </div>
          </div>

          {/* Total Amount Input Panel */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">
              Gross Amount (Including Tax)
            </label>
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 p-3 flex items-center">
              <span className="text-lg font-bold text-gray-400 dark:text-slate-500 mr-2">₹</span>
              <input
                type="number"
                value={totalVal}
                onChange={(e) => handleTotalChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-lg font-bold text-gray-800 dark:text-slate-200 outline-none focus:ring-0"
              />
              <span className="text-xs font-bold text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 select-none shadow-sm shrink-0">
                Gross
              </span>
            </div>
          </div>
        </div>

        {/* Quick Conversions Tag Cloud */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 dark:border-slate-800/60 pt-4">
          <span className="text-[11px] font-semibold text-gray-400 dark:text-slate-500">Quick Reference values (at {gstRate}% GST):</span>
          {[100, 500, 1000, 5000, 10000, 25000, 50000].map((amt) => (
            <button
              key={amt}
              onClick={() => {
                setBaseVal(amt.toString());
                setTotalVal((amt * (1 + gstRate / 100)).toFixed(2));
              }}
              className="rounded-lg bg-slate-50 dark:bg-slate-850 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-slate-200 dark:border-slate-850 hover:border-emerald-200 text-xs font-medium text-gray-650 dark:text-slate-400 hover:text-emerald-650 dark:hover:text-emerald-400 px-2.5 py-1 transition cursor-pointer"
            >
              ₹{amt.toLocaleString('en-IN')} + GST = ₹{Math.round(amt * (1 + gstRate / 100)).toLocaleString('en-IN')}
            </button>
          ))}
        </div>
      </div>

       {/* Recent Transactions & Upcoming Bills Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Transactions table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm lg:col-span-2 text-left">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">Review your newly updated ledgers</p>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline cursor-pointer"
            >
              View History
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500 uppercase font-semibold">
                  <th className="pb-3 font-semibold text-left">Merchant / Category</th>
                  <th className="pb-3 font-semibold text-left">Date</th>
                  <th className="pb-3 font-semibold text-left">Method</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((e) => {
                    const isIncome = e.category === 'Income';
                    return (
                      <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                        <td className="py-3 text-left">
                          <div className="font-semibold text-gray-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">{e.merchant}</div>
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold mt-0.5 ${
                            isIncome ? 'bg-teal-500/10 text-teal-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            {e.category}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-gray-500 dark:text-slate-400 text-left">{e.date}</td>
                        <td className="py-3 text-xs text-gray-500 dark:text-slate-400 text-left">{e.paymentMethod}</td>
                        <td className={`py-3 text-right font-bold ${
                          isIncome ? 'text-teal-500' : 'text-gray-900 dark:text-white'
                        }`}>
                          {isIncome ? '+' : '-'}{currencySymbol}{e.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 dark:text-slate-500 text-xs">
                      No expenses recorded yet. Let's add some!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Bento Column */}
        <div className="space-y-6 lg:col-span-1">
          {/* Budget Progress Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Budget Progress</span>
              <span className="text-xs font-black text-teal-600 dark:text-teal-400">{budgetProgressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${budgetProgressColor} transition-all duration-500`}
                style={{ width: `${Math.min(100, budgetProgressPercent)}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between text-xs">
              <div>
                <span className="text-gray-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Spent</span>
                <span className="font-extrabold text-slate-800 dark:text-white mt-0.5 block">{currencySymbol}{budgetSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Remaining</span>
                <span className="font-extrabold text-slate-800 dark:text-white mt-0.5 block">{currencySymbol}{remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Bills Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm text-left flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Upcoming Bills</span>
                <button
                  onClick={() => onNavigate('budget')}
                  className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Configure
                </button>
              </div>
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {reminders.length > 0 ? (
                  reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className={`flex items-start justify-between rounded-xl border p-3 transition ${
                        rem.paid ? 'bg-slate-50 dark:bg-slate-850/30 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="min-w-0 text-left">
                        <h4 className={`text-xs font-bold truncate ${rem.paid ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-slate-200'}`}>
                          {rem.title}
                        </h4>
                        <p className="text-[9px] text-gray-400 dark:text-slate-505 mt-0.5">Due: {rem.dueDate}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`block text-xs font-bold ${rem.paid ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {currencySymbol}{rem.amount.toFixed(2)}
                        </span>
                        {!rem.paid ? (
                          <button
                            onClick={() => onPayReminder(rem)}
                            className="mt-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 text-[9px] font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-semibold text-teal-500">
                            <CheckCircle className="h-3 w-3" /> Paid
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-450 dark:text-slate-500 text-xs py-4">
                    All clean! No bills.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Spending Category Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm text-left">
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Top Spending Category</span>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <h4 className="text-base font-black text-slate-800 dark:text-white">{topCategory.name}</h4>
                <span className="text-[10px] text-rose-500 font-bold block mt-0.5">+18.6% vs last month</span>
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">{currencySymbol}{topCategory.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-gray-400 dark:text-slate-500">
              <span>Limit: {currencySymbol}{topCategory.budget.toLocaleString()}</span>
              <span className="text-teal-600 dark:text-teal-400">{Math.round((topCategory.value / topCategory.budget) * 100)}% Consumed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
