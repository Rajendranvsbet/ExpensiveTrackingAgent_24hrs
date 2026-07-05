import React, { useState, useMemo } from 'react';
import { Budget, Expense, CATEGORIES } from '../types';
import {
  DollarSign,
  Edit,
  Save,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

interface BudgetViewProps {
  budget: Budget;
  expenses: Expense[];
  onSaveBudget: (budget: Budget) => void;
  currencySymbol: string;
}

export default function BudgetView({
  budget,
  expenses,
  onSaveBudget,
  currencySymbol,
}: BudgetViewProps) {
  const currentMonthStr = '2026-07';

  // Overall Budget Editing state
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState(budget.monthlyBudget.toString());

  // Category Budget inputs state
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>(() => {
    const inputs: Record<string, string> = {};
    CATEGORIES.forEach((cat) => {
      inputs[cat] = (budget.categoryBudgets[cat] || 0).toString();
    });
    return inputs;
  });

  // Calculate spent per category for July 2026
  const spentPerCategory = useMemo(() => {
    const spent: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      spent[cat] = 0;
    });

    expenses
      .filter((e) => e.date.startsWith(currentMonthStr))
      .forEach((e) => {
        spent[e.category] = (spent[e.category] || 0) + e.amount;
      });

    return spent;
  }, [expenses, currentMonthStr]);

  // Overall calculations
  const totalSpentInJuly = useMemo(() => {
    return (Object.values(spentPerCategory) as number[]).reduce((sum, val) => sum + val, 0);
  }, [spentPerCategory]);

  const totalAllocatedCategoryBudgets = useMemo(() => {
    return (Object.values(budget.categoryBudgets) as number[]).reduce((sum, val) => sum + val, 0);
  }, [budget.categoryBudgets]);

  // Handle saving overall budget
  const handleSaveTotalBudget = () => {
    const num = parseFloat(totalBudgetInput);
    if (!isNaN(num) && num >= 0) {
      onSaveBudget({
        ...budget,
        monthlyBudget: num,
      });
      setIsEditingTotal(false);
    }
  };

  // Handle changing a category budget limit
  const handleCategoryBudgetChange = (cat: string, value: string) => {
    setCategoryInputs((prev) => ({
      ...prev,
      [cat]: value,
    }));
  };

  // Handle saving category budgets
  const [saveSuccess, setSaveSuccess] = useState(false);
  const handleSaveCategoryBudgets = (e: React.FormEvent) => {
    e.preventDefault();
    const newCategoryBudgets: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      const num = parseFloat(categoryInputs[cat] || '0');
      newCategoryBudgets[cat] = !isNaN(num) && num >= 0 ? num : 0;
    });

    onSaveBudget({
      ...budget,
      categoryBudgets: newCategoryBudgets,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Visual Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Guardrails</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Set monthly limit constraints, allocate cash per category, and audit overspending</p>
        </div>
        <span className="self-start sm:self-center inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4" /> Guardrails Engaged
        </span>
      </div>

      {/* Grid: Overall Budget Status + Allocation Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Column 1: Overall Budget Summary Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between h-full">
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider block">Global Monthly Limit</span>
            
            {isEditingTotal ? (
              <div className="space-y-2">
                <div className="relative rounded-xl shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-400 font-semibold text-sm">{currencySymbol}</span>
                  </div>
                  <input
                    type="number"
                    value={totalBudgetInput}
                    onChange={(e) => setTotalBudgetInput(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 pl-8 pr-3 text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveTotalBudget}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTotalBudgetInput(budget.monthlyBudget.toString());
                      setIsEditingTotal(false);
                    }}
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white">
                  {currencySymbol}{budget.monthlyBudget.toLocaleString()}
                </h3>
                <button
                  onClick={() => setIsEditingTotal(true)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Edit global budget"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Micro indicators */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400 dark:text-slate-500">Total Spent in July:</span>
                <span className="text-gray-800 dark:text-slate-200 font-bold">{currencySymbol}{totalSpentInJuly.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400 dark:text-slate-500">Allocated in Category Budgets:</span>
                <span className="text-gray-800 dark:text-slate-200 font-bold">
                  {currencySymbol}{totalAllocatedCategoryBudgets.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-400 dark:text-slate-500">Unallocated Funds:</span>
                <span className={`font-bold ${budget.monthlyBudget - totalAllocatedCategoryBudgets >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {currencySymbol}{(budget.monthlyBudget - totalAllocatedCategoryBudgets).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 p-4 border border-blue-50 dark:border-blue-900/40">
            <h4 className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Pro Saving Advisor
            </h4>
            <p className="text-[10px] text-blue-600 dark:text-blue-300 leading-relaxed mt-1">
              Your categories allocate {totalAllocatedCategoryBudgets > budget.monthlyBudget ? 'more than' : 'within'}{' '}
              your total monthly limit. Try to keep category allocations below your overall limit to ensure cash buffering.
            </p>
          </div>
        </div>

        {/* Column 2 & 3: Configure Category Budgets list */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-500" />
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Configure Category Allocation Limits</h3>
              <p className="text-xs text-gray-400 dark:text-slate-400">Assign individual spending guardrails to categories</p>
            </div>
          </div>

          <form onSubmit={handleSaveCategoryBudgets} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 py-1">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="space-y-1.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-800/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-slate-200 truncate block max-w-[130px]">{cat}</span>
                    <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 shrink-0">
                      Spent: {currencySymbol}{spentPerCategory[cat].toFixed(0)}
                    </span>
                  </div>
                  <div className="relative rounded-lg shadow-xs mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                      <span className="text-gray-400 dark:text-slate-500 text-xs font-bold">{currencySymbol}</span>
                    </div>
                    <input
                      type="number"
                      value={categoryInputs[cat] || ''}
                      placeholder="0"
                      onChange={(e) => handleCategoryBudgetChange(cat, e.target.value)}
                      className="block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-1.5 pl-6 pr-2.5 text-xs font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-end gap-3">
              {saveSuccess && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  ✓ Category budgets saved!
                </span>
              )}
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 transition cursor-pointer"
              >
                Save Category Allocations
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Visual Analytics: Current Category Spending Bars */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">July Category Spend Audits</h3>
        <p className="text-xs text-gray-400 dark:text-slate-400 mb-6">Real-time status of category consumption compared to your custom limit</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => {
            const limit = budget.categoryBudgets[cat] || 0;
            const spent = spentPerCategory[cat] || 0;
            const percent = limit === 0 ? 0 : Math.min(100, Math.round((spent / limit) * 100));
            const isOver = spent > limit && limit > 0;

            let progressColor = 'bg-emerald-500';
            if (percent >= 90) progressColor = 'bg-red-500';
            else if (percent >= 75) progressColor = 'bg-amber-500';

            return (
              <div key={`visual-${cat}`} className="space-y-2 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-800 dark:text-slate-200">{cat}</span>
                    {limit === 0 && (
                      <span className="ml-1.5 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-gray-400 dark:text-slate-500">
                        No Limit Set
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {currencySymbol}{spent.toFixed(2)}
                    </span>
                    <span className="text-gray-400 dark:text-slate-500"> / {currencySymbol}{limit}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${progressColor}`}
                    style={{ width: `${limit === 0 ? 0 : percent}%` }}
                  />
                </div>

                {/* Status Indicator text / alerts */}
                <div className="flex items-center justify-between text-[10px] font-semibold mt-1">
                  <span className="text-gray-500 dark:text-slate-400">{limit > 0 ? `${percent}% utilized` : '0%'}</span>
                  {isOver ? (
                    <span className="inline-flex items-center gap-0.5 text-red-500">
                      <AlertTriangle className="h-3 w-3" /> Exceeded by {currencySymbol}{(spent - limit).toFixed(0)}!
                    </span>
                  ) : limit > 0 && percent >= 75 ? (
                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                      <AlertTriangle className="h-3 w-3" /> Near Limit Warning
                    </span>
                  ) : limit > 0 ? (
                    <span className="inline-flex items-center gap-0.5 text-emerald-500">
                      <CheckCircle className="h-3 w-3" /> Healthy Margin
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-slate-500">No constraints configured</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
