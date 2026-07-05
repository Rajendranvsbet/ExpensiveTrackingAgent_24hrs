import React, { useMemo } from 'react';
import { Expense, CATEGORIES } from '../types';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  DollarSign,
  PieChart as PieIcon,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface ReportsViewProps {
  expenses: Expense[];
  currencySymbol: string;
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

export default function ReportsView({ expenses, currencySymbol }: ReportsViewProps) {
  const currentMonthStr = '2026-07';

  // Expenses calculations
  const totalAmountSpentAllTime = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(currentMonthStr));
  }, [expenses]);

  const currentMonthSum = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  // Spending per category this month
  const categorySpendingData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      categoryTotals[cat] = 0;
    });

    currentMonthExpenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
      }))
      .filter((item) => item.value > 0); // show only categories with spend
  }, [currentMonthExpenses]);

  // Highest & Lowest category
  const highestCategory = useMemo(() => {
    if (categorySpendingData.length === 0) return null;
    return [...categorySpendingData].sort((a, b) => b.value - a.value)[0];
  }, [categorySpendingData]);

  const lowestCategory = useMemo(() => {
    if (categorySpendingData.length === 0) return null;
    return [...categorySpendingData].sort((a, b) => a.value - b.value)[0];
  }, [categorySpendingData]);

  // Payment method usage
  const paymentMethodData = useMemo(() => {
    const methods: Record<string, number> = {};
    currentMonthExpenses.forEach((e) => {
      methods[e.paymentMethod] = (methods[e.paymentMethod] || 0) + e.amount;
    });

    return Object.entries(methods).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }));
  }, [currentMonthExpenses]);

  // Trend for monthly charts (April - July 2026)
  const monthlyBreakdownData = useMemo(() => {
    const months = ['2026-04', '2026-05', '2026-06', '2026-07'];
    const monthNames = ['April', 'May', 'June', 'July'];

    return months.map((m, idx) => {
      const filtered = expenses.filter((e) => e.date.startsWith(m));
      const total = filtered.reduce((sum, e) => sum + e.amount, 0);
      const transactionCount = filtered.length;
      return {
        name: monthNames[idx],
        Amount: parseFloat(total.toFixed(2)),
        Count: transactionCount,
      };
    });
  }, [expenses]);

  const averageTransactionAmount = useMemo(() => {
    if (currentMonthExpenses.length === 0) return 0;
    return currentMonthSum / currentMonthExpenses.length;
  }, [currentMonthExpenses, currentMonthSum]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Audit, export, and examine quarterly spending indexes and payments</p>
        </div>
        <button
          onClick={handlePrint}
          className="self-start sm:self-center flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition active:scale-95 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export Report / Print
        </button>
      </div>

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm text-left">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">July Spending Index</span>
          <h3 className="text-2xl font-bold text-gray-950 dark:text-white mt-2">
            {currencySymbol}{currentMonthSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">across {currentMonthExpenses.length} transactions</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm text-left">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Average Ticket Size</span>
          <h3 className="text-2xl font-bold text-gray-955 dark:text-white mt-2">
            {currencySymbol}{averageTransactionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">per individual invoice</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Peak Cost Department</span>
          {highestCategory ? (
            <>
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mt-2 truncate">
                {highestCategory.name}
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-slate-450 mt-1">
                Spent: {currencySymbol}{highestCategory.value}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-400 dark:text-slate-550 mt-3">No expenses logged yet</p>
          )}
          <div className="absolute right-3 bottom-3 text-red-100/30 dark:text-red-950/20">
            <TrendingUp className="h-10 w-10 stroke-[1.5]" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm text-left relative overflow-hidden">
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Lowest Cost Department</span>
          {lowestCategory ? (
            <>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 truncate">
                {lowestCategory.name}
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-slate-450 mt-1">
                Spent: {currencySymbol}{lowestCategory.value}
              </p>
            </>
          ) : (
            <p className="text-xs text-gray-400 dark:text-slate-550 mt-3">No expenses logged yet</p>
          )}
          <div className="absolute right-3 bottom-3 text-emerald-100/30 dark:text-emerald-950/20">
            <TrendingDown className="h-10 w-10 stroke-[1.5]" />
          </div>
        </div>
      </div>

      {/* Main Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category breakdown bar chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">July Category Expenditures</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">Total volume logged in each spending department</p>
            </div>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="h-64 w-full">
            {categorySpendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySpendingData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={10} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [`${currencySymbol}${value}`]}
                    contentStyle={{ backgroundColor: '#ffffff', color: '#2C3830', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]}>
                    {categorySpendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 dark:text-slate-500 text-xs py-12">No data logged this month.</div>
            )}
          </div>
        </div>

        {/* Monthly progression line chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Quarterly Progression Index</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">Review total monthly volume over time (2026)</p>
            </div>
            <Calendar className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyBreakdownData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProgression" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={11} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <YAxis fontSize={11} stroke="#9CA3AF" tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [`${currencySymbol}${value}`]}
                  contentStyle={{ backgroundColor: '#ffffff', color: '#2C3830', borderRadius: '8px', border: '1px solid #D4D4D8', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Amount" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProgression)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Doughnut chart */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Payment Methods Ratios</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">Review payment methods used for purchases</p>
            </div>
            <PieIcon className="h-5 w-5 text-amber-500" />
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${currencySymbol}${value}`]}
                    contentStyle={{ backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" fontSize={10} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 dark:text-slate-500 text-xs py-12">No data logged this month.</div>
            )}
          </div>
        </div>

        {/* Ledger overview card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Ledger Index Insights</h3>
            <p className="text-xs text-gray-400 dark:text-slate-400 mb-4 font-semibold">Consolidated audit data for active accounts</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 font-medium">
                <span className="text-gray-400 dark:text-slate-450">Total Transactions Logged</span>
                <span className="text-gray-900 dark:text-slate-100 font-bold">{expenses.length} records</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 font-medium">
                <span className="text-gray-400 dark:text-slate-450">Cumulative Expenses Value</span>
                <span className="text-gray-900 dark:text-slate-100 font-bold">{currencySymbol}{totalAmountSpentAllTime.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 font-medium">
                <span className="text-gray-400 dark:text-slate-450">Active Month (July) Log Ratio</span>
                <span className="text-gray-900 dark:text-slate-100 font-bold">
                  {expenses.length > 0 ? Math.round((currentMonthExpenses.length / expenses.length) * 100) : 0}% of database
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 font-medium">
                <span className="text-gray-400 dark:text-slate-450">Estimated Annualized Expenses</span>
                <span className="text-gray-900 dark:text-slate-100 font-bold">{currencySymbol}{(currentMonthSum * 12).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3.5 text-center text-xs font-semibold text-gray-500 dark:text-slate-400">
            Audit Complete • System UTC: 2026-07-04
          </div>
        </div>
      </div>
    </div>
  );
}
