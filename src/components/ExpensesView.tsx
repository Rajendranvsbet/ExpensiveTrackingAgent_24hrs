import React, { useState, useMemo } from 'react';
import { Expense, CATEGORIES, PAYMENT_METHODS } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Eye,
  Calendar,
  CreditCard,
  Tag,
  X,
  FileText,
  Bookmark,
} from 'lucide-react';

interface ExpensesViewProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onClearAllExpenses?: () => void;
  currencySymbol: string;
}

export default function ExpensesView({
  expenses,
  onEdit,
  onDelete,
  onClearAllExpenses,
  currencySymbol,
}: ExpensesViewProps) {
  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected expense for detailed view modal
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Filtered and sorted expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];

    // 1. Text Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.merchant.toLowerCase().includes(term) ||
          e.description.toLowerCase().includes(term) ||
          (e.notes && e.notes.toLowerCase().includes(term))
      );
    }

    // 2. Category Filter
    if (categoryFilter !== 'All') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    // 3. Payment Method Filter
    if (paymentMethodFilter !== 'All') {
      result = result.filter((e) => e.paymentMethod === paymentMethodFilter);
    }

    // 4. Date range Filter
    if (startDate) {
      result = result.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      result = result.filter((e) => e.date <= endDate);
    }

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [expenses, searchTerm, categoryFilter, paymentMethodFilter, startDate, endDate, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = useMemo(() => {
    // Reset page if it exceeds total pages
    const verifiedPage = currentPage > totalPages ? 1 : currentPage;
    const startIndex = (verifiedPage - 1) * itemsPerPage;
    return filteredAndSortedExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedExpenses, currentPage, totalPages]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setPaymentMethodFilter('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Visual Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Expense History</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Review, search, and manage your historical financial ledger entries</p>
        </div>
        {expenses.length > 0 && onClearAllExpenses && (
          <button
            onClick={onClearAllExpenses}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition duration-200 text-xs font-bold shadow-sm cursor-pointer select-none self-start sm:self-auto"
            title="Permanently erase your entire expense history logs"
          >
            <Trash2 className="h-4 w-4" />
            Delete All History
          </button>
        )}
      </div>

      {/* Control Panel: Filters, Search & Sort */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        {/* Search & Reset */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search merchant, description or notes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 pl-10 pr-4 text-sm font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            onClick={handleResetFilters}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition cursor-pointer shrink-0"
          >
            Reset Filters
          </button>
        </div>

        {/* Detailed Dropdown Filters */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 text-left">
          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs font-semibold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            >
              <option value="All" className="dark:bg-slate-800">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Payment Method</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs font-semibold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            >
              <option value="All" className="dark:bg-slate-800">All Methods</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method} className="dark:bg-slate-800">
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 text-xs font-semibold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 text-xs font-semibold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Sort Control */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Sort By</label>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-xs font-semibold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800"
            >
              <option value="date-desc" className="dark:bg-slate-800">Date (Newest First)</option>
              <option value="date-asc" className="dark:bg-slate-800">Date (Oldest First)</option>
              <option value="amount-desc" className="dark:bg-slate-800">Amount (Highest First)</option>
              <option value="amount-asc" className="dark:bg-slate-800">Amount (Lowest First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-xs text-gray-400 dark:text-slate-500 uppercase font-semibold">
                <th className="px-6 py-4 font-semibold">Merchant / Details</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 text-right font-semibold">Amount</th>
                <th className="px-6 py-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-sm">
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{e.merchant}</div>
                      <div className="text-xs text-gray-400 dark:text-slate-400 truncate max-w-[200px] mt-0.5">
                        {e.description || 'No description added'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-gray-300 dark:text-slate-600" />
                        {e.date}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5 text-gray-300 dark:text-slate-600" />
                        {e.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white text-base">
                      {currencySymbol}{e.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setSelectedExpense(e)}
                          className="rounded-lg p-1.5 text-gray-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-300 transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(e)}
                          className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete this ${currencySymbol}${e.amount} expense to ${e.merchant}?`)) {
                              onDelete(e.id);
                            }
                          }}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500 text-xs font-semibold">
                    No transactions matching your active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
            <span className="text-xs text-gray-500 dark:text-slate-400 font-semibold">
              Showing page <span className="text-gray-900 dark:text-white">{currentPage}</span> of{' '}
              <span className="text-gray-900 dark:text-white">{totalPages}</span> ({filteredAndSortedExpenses.length} total entries)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Prev
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED TRANSACTION MODAL */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transaction Details</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{selectedExpense.merchant}</h3>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-4 text-left">
              
              {/* Main Amount Callout */}
              <div className="text-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block">TOTAL AMOUNT</span>
                <span className="text-3xl font-black text-blue-600 block mt-1">
                  {currencySymbol}{selectedExpense.amount.toFixed(2)}
                </span>
              </div>

              {/* Grid attributes */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px]">Date</span>
                  <span className="text-gray-800 font-bold mt-1 block">{selectedExpense.date}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px]">Category</span>
                  <span className="inline-block mt-1 font-semibold rounded bg-blue-50 text-blue-600 px-2 py-0.5">
                    {selectedExpense.category}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px]">Payment Method</span>
                  <span className="text-gray-800 font-semibold mt-1 block">{selectedExpense.paymentMethod}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px]">Transaction ID</span>
                  <span className="text-gray-500 font-mono mt-1 block select-all">{selectedExpense.id}</span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-50 pt-3">
                <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px] mb-1">Description</span>
                <p className="text-xs text-gray-800 font-medium leading-relaxed bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                  {selectedExpense.description || 'No description provided'}
                </p>
              </div>

              {/* Notes */}
              {selectedExpense.notes && (
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px] mb-1">Itemized Notes</span>
                  <div className="text-xs text-gray-700 bg-amber-50/25 border border-amber-100 p-3 rounded-lg flex gap-2">
                    <FileText className="h-4 w-4 shrink-0 text-amber-500" />
                    <p className="whitespace-pre-line leading-relaxed font-semibold">{selectedExpense.notes}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedExpense.tags && selectedExpense.tags.length > 0 && (
                <div>
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px] mb-1">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedExpense.tags.map((t, idx) => (
                      <span
                        key={`${t}-${idx}`}
                        className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Receipt File */}
              {selectedExpense.receipt && (
                <div className="border-t border-gray-50 pt-3">
                  <span className="font-bold text-gray-400 block uppercase tracking-wider text-[10px] mb-2">Attached Receipt</span>
                  <div className="rounded-xl border border-gray-100 p-2 bg-gray-50 overflow-hidden flex items-center justify-center">
                    <img
                      src={selectedExpense.receipt}
                      alt="Receipt attached document"
                      className="max-h-56 rounded-lg object-contain border border-gray-200 shadow-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 pt-4 flex gap-2 justify-end">
              <button
                onClick={() => {
                  onEdit(selectedExpense);
                  setSelectedExpense(null);
                }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Edit Entry
              </button>
              <button
                onClick={() => setSelectedExpense(null)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
