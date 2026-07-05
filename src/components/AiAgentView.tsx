import React, { useState, useRef, useEffect } from 'react';
import { Expense, Budget, Profile } from '../types';
import {
  Brain,
  Send,
  Sparkles,
  HelpCircle,
  MessageSquare,
  TrendingDown,
  ChevronRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';

interface AiAgentViewProps {
  expenses: Expense[];
  budget: Budget;
  profile: Profile;
  currencySymbol: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

// Custom Markdown formatter to render bold, headings, and bullet lists beautifully without extra libraries
function formatMarkdown(text: string, currencySymbol: string) {
  if (!text) return '';
  
  // Custom parsing lines
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let cleanLine = line.trim();
    
    // Check headings
    if (cleanLine.startsWith('###')) {
      return (
        <h5 key={idx} className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1 uppercase tracking-wider">
          {cleanLine.replace('###', '').trim()}
        </h5>
      );
    }
    if (cleanLine.startsWith('##')) {
      return (
        <h4 key={idx} className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-4 mb-2">
          {cleanLine.replace('##', '').trim()}
        </h4>
      );
    }
    if (cleanLine.startsWith('#')) {
      return (
        <h3 key={idx} className="text-lg font-black text-gray-950 dark:text-white mt-5 mb-3 border-b border-slate-150 dark:border-slate-800 pb-1.5">
          {cleanLine.replace('#', '').trim()}
        </h3>
      );
    }

    // Check list items
    if (cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
      const content = cleanLine.substring(1).trim();
      return (
        <li key={idx} className="ml-4 list-disc text-xs text-gray-750 dark:text-slate-300 leading-relaxed mb-1 font-semibold">
          {parseInlineFormatting(content)}
        </li>
      );
    }

    // Regular paragraph
    if (cleanLine === '') {
      return <div key={idx} className="h-2" />;
    }

    return (
      <p key={idx} className="text-xs text-gray-750 dark:text-slate-300 leading-relaxed mb-2 font-medium">
        {parseInlineFormatting(cleanLine)}
      </p>
    );
  });
}

function parseInlineFormatting(text: string) {
  // Simple regex for bold **text**
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return text;
  
  return parts.map((part, index) => {
    // Every odd element is the match inside the ** **
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-gray-900 dark:text-white">{part}</strong>;
    }
    return part;
  });
}

export default function AiAgentView({
  expenses,
  budget,
  profile,
  currencySymbol,
}: AiAgentViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'agent',
      text: `Hello ${profile.name}! I am your AI Wealth Optimization Agent, powered by Google Gemini.
      
I have completed a morning sync with your primary database of ${expenses.length} transactions.
      
You can click **"Request Financial Audit Plan"** below to compile an institutional financial health report immediately, or ask me any question about your spending habits.`,
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt list
  const promptSuggestions = [
    'Audit July spending',
    'Suggest a 50/30/20 budget allocate',
    'Identify category budget overruns',
    'Suggest ways to save on utilities',
  ];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle consultation call
  const handleConsult = async (customQuestion?: string) => {
    const question = customQuestion || input;
    if (!question.trim() && !customQuestion) return;

    // Add user message if custom text question
    const userMsgId = 'msg-' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenses,
          budget,
          question,
          profile,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error calling AI Agent');
      }

      const data = await response.json();

      const newAgentMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'agent',
        text: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newAgentMessage]);
    } catch (error: any) {
      console.error('Error in consulting agent:', error);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'agent',
        text: `⚠️ **Advisory Interruption:** ${error.message || 'An error occurred during consultation. Make sure your server-side API key is set.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Immediate comprehensive monthly review audit
  const handleAuditRequest = async () => {
    setIsLoading(true);
    const userMsgId = 'msg-' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: 'Analyze my accounts and compile a Financial Audit and Optimization Plan.',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    try {
      const response = await fetch('/api/agent/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expenses,
          budget,
          profile,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server error calling AI Agent');
      }

      const data = await response.json();

      const newAgentMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'agent',
        text: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newAgentMessage]);
    } catch (error: any) {
      console.error('Error generating audit:', error);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        sender: 'agent',
        text: `⚠️ **Audit Failure:** ${error.message || 'An error occurred. Verify the server-side API key is active.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 max-w-6xl mx-auto h-[80vh]">
      
      {/* Left Column: Actions, Prompts Suggestion & Parameters */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-5 lg:col-span-1 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500 shrink-0" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">AI Intelligence Desk</h3>
          </div>

          <p className="text-[10px] text-gray-400 dark:text-slate-400 leading-relaxed text-left">
            Our agent analyzes your monthly transactions, evaluates alerts, and optimizes budgets using Google Gemini Pro algorithms.
          </p>

          <button
            onClick={handleAuditRequest}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            Request Financial Audit Plan
          </button>

          {/* Quick Prompts Suggestions */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-left">
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider block">Prompt Suggestions</span>
            <div className="space-y-1.5">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleConsult(prompt)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-750 p-2.5 rounded-xl transition disabled:opacity-40 text-left cursor-pointer"
                >
                  <span className="truncate mr-1">{prompt}</span>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Indicators */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-[9px] text-gray-400 dark:text-slate-450 leading-relaxed font-semibold flex gap-2 items-start text-left">
          <ShieldAlert className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>Institutional Sandbox active. Your accounts are held locally and compiled client-side securely.</span>
        </div>
      </div>

      {/* Right Column: Chat Dialog Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm lg:col-span-3 flex flex-col h-full overflow-hidden">
        
        {/* Chat window Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-white">AI Advisor Consultation Desk</h4>
              <p className="text-[10px] text-gray-400 dark:text-slate-450 mt-0.5">Active Agent: Gemini-3.5-Flash</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>

        {/* Messaging Logs */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id}
                className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs text-left ${
                    isAgent
                      ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-tl-none'
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}
                >
                  {isAgent ? (
                    <div className="prose max-w-none">
                      {formatMarkdown(msg.text, currencySymbol)}
                    </div>
                  ) : (
                    <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}
                  <span
                    className={`block text-[9px] mt-1.5 font-bold ${
                      isAgent ? 'text-gray-400 dark:text-slate-500 text-right' : 'text-blue-100 text-right'
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 rounded-tl-none flex items-center gap-2 text-xs">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                <span className="font-semibold animate-pulse">Consulting wealth intelligence...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input box form */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConsult();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question (e.g. Is transport high? What are 3 savings recommendations?)..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs font-semibold text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 bg-white dark:bg-slate-800"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-indigo-600 text-white p-3.5 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
