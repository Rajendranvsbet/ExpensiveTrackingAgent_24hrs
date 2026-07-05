import React, { useState } from 'react';
import { UserSettings, CURRENCIES, LANGUAGES } from '../types';
import {
  Settings,
  Globe,
  DollarSign,
  Bell,
  Download,
  Upload,
  RefreshCw,
  Info,
  Shield,
  EyeOff,
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onExportData: () => void;
  onImportData: (file: File) => Promise<boolean>;
  onResetApp: () => void;
  onBulkConvertCurrency: (targetCurrency: string, rate: number) => void;
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetApp,
  onBulkConvertCurrency,
}: SettingsViewProps) {
  const [currency, setCurrency] = useState(settings.currency);
  const [language, setLanguage] = useState(settings.language);
  const [notifications, setNotifications] = useState(settings.notificationsEnabled);
  const [darkMode, setDarkMode] = useState(settings.darkMode);

  const [message, setMessage] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      currency,
      language,
      darkMode: false,
      notificationsEnabled: notifications,
    });
    setMessage('Application configurations updated successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportStatus('Verifying backup file integrity...');
      const success = await onImportData(file);
      if (success) {
        setImportStatus('Backup restored successfully! Refreshing details.');
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus('Import failed. Invalid file encoding or corrupted schema.');
        setTimeout(() => setImportStatus(null), 4000);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-left">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Application Settings</h2>
        <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Configure base currencies, customize localized triggers, and manage accounts backup</p>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-fade-in">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Column 1 & 2: Local Configurations form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <h3 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-500" /> Regional Configurations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Currency Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                  Primary Base Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code} className="dark:bg-slate-800">
                      {c.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-relaxed mt-1">
                  Updates monetary symbols everywhere immediately (e.g. ₹, €, £).
                </p>
              </div>

              {/* Language Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                  Application Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm font-semibold text-gray-800 dark:text-slate-200 bg-white dark:bg-slate-800"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="dark:bg-slate-800">
                      {l.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 leading-relaxed mt-1">
                  Primary layout localization language.
                </p>
              </div>
            </div>

            {/* Notification settings */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-indigo-500" />
                Toast Notifications & Guardrails
              </h4>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800"
                  />
                  <div>
                    <span className="block text-xs font-bold text-gray-800 dark:text-slate-200">Enable Guardrail Push Alerts</span>
                    <span className="block text-[10px] text-gray-400 dark:text-slate-400 mt-0.5">
                      Triggers instant warnings when you are logged past 75% or 100% of category limits.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
              >
                Save Configurations
              </button>
            </div>
          </form>
        </div>

        {/* Column 3: Backup & Restore, Privacy */}
        <div className="space-y-6">
          {/* Backup card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Database Maintenance
            </h3>

            {importStatus && (
              <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 p-2.5 text-[10px] text-indigo-600 dark:text-indigo-400 font-bold leading-relaxed">
                {importStatus}
              </div>
            )}

            <p className="text-[10px] text-gray-400 dark:text-slate-400 leading-relaxed">
              Maintain total self-ownership of your data. Backup, download, or restore your entire encrypted ledger anytime.
            </p>

            <div className="space-y-2">
              {/* Backup button */}
              <button
                type="button"
                onClick={onExportData}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-650 transition cursor-pointer"
              >
                <Download className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                Export JSON Backup
              </button>

              {/* Restore button */}
              <div className="relative w-full">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-650 transition pointer-events-none cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                  Restore JSON Backup
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Information */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              Privacy Assurance
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-relaxed">
              All financial analytics, tags, notes, and attachment base64 streams are written directly to your local browser storage engine (`localStorage`). We never transmit your private accounts to external servers, except when consulting the secure AI Agent.
            </p>
          </div>

          {/* Reset App */}
          <div className="rounded-2xl border border-red-100 dark:border-red-950/40 bg-red-50/20 dark:bg-red-950/10 p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5">
              Danger Zone
            </h4>
            <p className="text-[10px] text-red-600 dark:text-red-400 leading-relaxed">
              Resetting will completely wipe your local browser ledger database and budgets. This is irreversible.
            </p>
            <button
              onClick={() => {
                if (confirm('CRITICAL: Are you absolutely sure you want to completely erase your ledger database, profile, and all configurations? This cannot be undone.')) {
                  onResetApp();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 px-4 py-2.5 text-xs font-bold transition border border-red-100 dark:border-red-900/40 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Erase Database (Factory Reset)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
