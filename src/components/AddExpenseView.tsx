import React, { useState, useEffect } from 'react';
import { Expense, CATEGORIES, PAYMENT_METHODS } from '../types';
import {
  DollarSign,
  Tag,
  Calendar,
  X,
  FileText,
  UploadCloud,
  Check,
  AlertCircle,
  Undo2,
} from 'lucide-react';

interface AddExpenseViewProps {
  onSave: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
  currencySymbol: string;
  prefilledExpense?: Partial<Expense> | null;
}

export default function AddExpenseView({
  onSave,
  onCancel,
  currencySymbol,
  prefilledExpense,
}: AddExpenseViewProps) {
  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState('2026-07-04');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [receiptBase64, setReceiptBase64] = useState<string | undefined>(undefined);
  const [receiptFileName, setReceiptFileName] = useState<string>('');

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate pre-filled details if they exist (e.g. paying a bill reminder)
  useEffect(() => {
    if (prefilledExpense) {
      if (prefilledExpense.amount) setAmount(prefilledExpense.amount.toString());
      if (prefilledExpense.category) setCategory(prefilledExpense.category);
      if (prefilledExpense.date) setDate(prefilledExpense.date);
      if (prefilledExpense.merchant) setMerchant(prefilledExpense.merchant);
      if (prefilledExpense.description) setDescription(prefilledExpense.description);
      if (prefilledExpense.tags) setTags(prefilledExpense.tags);
    }
  }, [prefilledExpense]);

  // Handle file import to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Tag interactions
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTag = tagInput.trim().toLowerCase().replace(/[^a-zA-Z0-9-]/g, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // Reset form
  const handleClear = () => {
    setAmount('');
    setCategory(CATEGORIES[0]);
    setDate('2026-07-04');
    setPaymentMethod(PAYMENT_METHODS[0]);
    setMerchant('');
    setDescription('');
    setNotes('');
    setTags([]);
    setTagInput('');
    setReceiptBase64(undefined);
    setReceiptFileName('');
    setErrors({});
  };

  // Submit and validate form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Please enter amount in Indian Rupees.';
    }
    if (!merchant.trim()) {
      newErrors.merchant = 'Merchant name is required.';
    }
    if (!date) {
      newErrors.date = 'Date is required.';
    }
    if (!category) {
      newErrors.category = 'Category is required.';
    }
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the top error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Save
    onSave({
      amount: parseFloat(amount),
      category,
      date,
      paymentMethod,
      merchant: merchant.trim(),
      description: description.trim(),
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      receipt: receiptBase64,
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 rounded-t-2xl">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Expense</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400">Log a transaction to secure your monthly financial logs</p>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Back
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Amount Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <span className="text-gray-400 dark:text-slate-500 font-semibold text-base">{currencySymbol}</span>
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Enter Amount (₹)"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
                }}
                className={`block w-full rounded-xl border py-3 pl-9 pr-4 text-base font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.amount ? 'border-red-300 focus:border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.amount && (
              <div className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.amount}
              </div>
            )}
          </div>

          {/* Merchant Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              Merchant Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Target, Uber, Amazon"
                value={merchant}
                onChange={(e) => {
                  setMerchant(e.target.value);
                  if (errors.merchant) setErrors((prev) => ({ ...prev, merchant: '' }));
                }}
                className={`block w-full rounded-xl border p-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.merchant ? 'border-red-300 focus:border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.merchant && (
              <div className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.merchant}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-slate-800">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: '' }));
                }}
                className={`block w-full rounded-xl border p-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.date ? 'border-red-300 focus:border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.date && (
              <div className="flex items-center gap-1 text-xs font-medium text-red-500 mt-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.date}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method} className="dark:bg-slate-800">
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
              Short Description
            </label>
            <input
              type="text"
              placeholder="e.g. Dinner with clients or annual hosting"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Detailed Notes (Full width) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
            Detailed Notes / Itemized List
          </label>
          <textarea
            rows={3}
            placeholder="Add detailed information, reminders, serial numbers, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Tags Field (With tag list) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
            Tags / Labels
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Type tag name and hit enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(e);
                  }
                }}
                className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              type="button"
              onClick={(e) => handleAddTag(e)}
              className="rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 px-4 py-3 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 cursor-pointer"
            >
              Add Tag
            </button>
          </div>

          {/* Render Active Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {tags.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 cursor-pointer"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Receipt Upload section */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider block">
            Receipt Attachment
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3 text-left">
              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3 text-blue-600 dark:text-blue-400">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">
                  {receiptFileName || 'Upload physical or digital invoice'}
                </h4>
                <p className="text-[10px] text-gray-400 dark:text-slate-400 mt-1">Supports PNG, JPEG up to 5MB. Converted securely.</p>
              </div>
            </div>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                type="button"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-slate-300 shadow-sm hover:bg-gray-50 pointer-events-none cursor-pointer"
              >
                Browse Files
              </button>
            </div>
          </div>

          {receiptBase64 && (
            <div className="mt-3 inline-flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 p-3 shadow-sm">
              <img
                src={receiptBase64}
                alt="Receipt preview"
                className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              />
              <div className="text-left">
                <span className="block text-xs font-bold text-gray-700 dark:text-slate-300 max-w-[150px] truncate">{receiptFileName}</span>
                <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold mt-1">
                  <Check className="h-3 w-3" /> Ready
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReceiptBase64(undefined);
                  setReceiptFileName('');
                }}
                className="ml-3 rounded-full p-1 text-gray-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
          >
            Clear Form
          </button>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 hover:scale-[1.01] active:scale-95 transition cursor-pointer"
          >
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
}
