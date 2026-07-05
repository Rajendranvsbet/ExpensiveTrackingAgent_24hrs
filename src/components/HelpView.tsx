import React from 'react';
import {
  HelpCircle,
  BookOpen,
  Keyboard,
  Shield,
  LifeBuoy,
  PlusCircle,
  CheckCircle,
  Brain,
  Sliders,
} from 'lucide-react';

export default function HelpView() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Information & FAQ Support</h2>
        <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Discover guides, tips, keyboard shortcuts, and FAQs</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Quick Help Guides card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-gray-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" /> Platform Operational Guides
          </h3>

          <div className="space-y-4">
            {/* Guide 1 */}
            <div className="flex gap-3 items-start">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/40 p-2 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                <PlusCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">1. Logging Your First Expense</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-450 leading-relaxed mt-1">
                  Navigate to the **Add Expense** page in the sidebar. Populate required parameters like Amount, Merchant, Date, Category, and Payment Method. Optional tags and receipt documents can be attached for complete detail. Save the form to add it to the ledger history immediately!
                </p>
              </div>
            </div>

            {/* Guide 2 */}
            <div className="flex gap-3 items-start">
              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 p-2 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                <Sliders className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">2. Tuning Category Budgets</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-450 leading-relaxed mt-1">
                  Open the **Budget** dashboard. Use the overall configuration form to scale your monthly global spending targets, then allocate exact spending margins to each category block below. Live bars will visually turn red and flash alert indicators if a category spend exceeds its threshold!
                </p>
              </div>
            </div>

            {/* Guide 3 */}
            <div className="flex gap-3 items-start">
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950/40 p-2 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">3. Requesting AI Advisor Audits</h4>
                <p className="text-[11px] text-gray-500 dark:text-slate-450 leading-relaxed mt-1">
                  Select the **Consult Agent** page. Click **"Request Financial Audit Plan"** to run our server-side Google Gemini-3.5-Flash analytics model over your transaction database, compiling an extensive spending report containing 3 personalized recommendations to trim overhead!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support, Shortcuts and Platform specs */}
        <div className="space-y-6">
          
          {/* Shortcuts block */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
              <Keyboard className="h-4 w-4 text-indigo-500" />
              Keyboard Shortcuts
            </h4>

            <div className="space-y-2 text-[10px] font-bold">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-gray-400 dark:text-slate-500 font-semibold">Log Expense Form</span>
                <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">Alt + N</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-gray-400 dark:text-slate-500 font-semibold">Open AI Desk</span>
                <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">Alt + A</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-gray-400 dark:text-slate-500 font-semibold">Print Reports / Invoice</span>
                <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">Ctrl + P</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-gray-400 dark:text-slate-500 font-semibold">Escape Modals</span>
                <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Privacy block */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              Self-Custody Policy
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed font-semibold">
              All invoice data attachments, user details, and configuration preferences are strictly serialized directly inside local storage sandbox keys. No databases are shared. Backup exports can be saved to your hard drive at any time.
            </p>
          </div>

          {/* Helpdesk support card */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 shadow-md text-white space-y-3 border-0">
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <LifeBuoy className="h-4 w-4" />
              Dedicated Tech Support
            </h4>
            <p className="text-[10px] text-blue-100 leading-relaxed font-semibold">
              If you experience synchronization issues or require system support, contact our operational helpdesk:
            </p>
            <span className="block text-xs font-black text-white hover:underline">
              support@expense-tracker-agent.io
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
