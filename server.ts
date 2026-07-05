import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not defined in the environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const PORT = 3000;

  // API Check Endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasApiKey: !!apiKey });
  });

  // AI Agent Consultation Endpoint
  app.post('/api/agent/consult', async (req, res) => {
    const { expenses, budget, question, profile } = req.body;

    try {
      const ai = getAiClient();
      if (!apiKey) {
        return res.status(400).json({
          error: 'Gemini API key is missing. Please configure it in Settings > Secrets.',
        });
      }

      const expensesSummary = expenses && expenses.length > 0
        ? expenses.map((e: any) => `- ${e.date}: ${e.merchant} (${e.category}) - ₹${e.amount.toFixed(2)}: ${e.description || ''}`).join('\n')
        : 'No expenses logged yet.';

      const categoryBudgetsSummary = budget?.categoryBudgets
        ? Object.entries(budget.categoryBudgets)
            .map(([cat, val]) => `  - ${cat}: ₹${val}`)
            .join('\n')
        : 'No category budgets set.';

      const systemInstruction = `You are an elite, highly professional financial AI Advisor and Expense Tracking Agent.
Your tone is objective, encouraging, practical, and highly analytical.
You analyze user transactions, budgets, and habits, and provide elite-level, personalized wealth-building suggestions and budget optimization advice.
All data is in Indian Rupees (₹). You must always represent money in Indian Rupees (₹) / INR and format numbers using Indian formatting where appropriate (e.g., Lakhs and Crores or standard en-IN formatting). Never use dollars ($) or USD.
Always be concise, professional, and clear. Avoid verbose pleasantries. Speak like a premier wealth manager.
Format all responses in clean Markdown.`;

      let prompt = '';
      if (question) {
        prompt = `The user ${profile?.name ? profile.name : ''} has a question about their finances.
Here is their current financial context:
- Monthly Budget: ₹${budget?.monthlyBudget || 'Not set'}
- Category Budgets:
${categoryBudgetsSummary}

Recent Transactions (last few months):
${expensesSummary}

User's Question: "${question}"

Provide a detailed, highly personalized, and mathematically sound answer based on their actual numbers. If they ask about a specific category or transaction, reference it directly. Recommend concrete steps to take.`;
      } else {
        prompt = `Generate a comprehensive monthly financial health report and optimization plan for the user ${profile?.name ? profile.name : ''}.
Here is their current financial context:
- Monthly Budget: ₹${budget?.monthlyBudget || 'Not set'}
- Category Budgets:
${categoryBudgetsSummary}

Recent Transactions (last few months):
${expensesSummary}

Analyze their numbers carefully:
1. Calculate their actual total spending vs. budget.
2. Identify which categories are near or exceeding their budgets.
3. Identify potential patterns (e.g., frequent small purchases, huge utilities, expensive dining).
4. Provide exactly 3 high-impact, actionable wealth-building tips or budget cuts specific to their spending.
5. Create a professional, motivating summary of their financial health.

Return your response in structured Markdown with clean headings:
- **Financial Health Summary**
- **Category Overviews & Flagged Alerts**
- **3 Actionable Wealth-Building Recommendations**`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      res.json({ response: response.text });
    } catch (error: any) {
      console.error('Error in AI Agent consult:', error);
      res.status(500).json({ error: error.message || 'An error occurred during consultation.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Expense Tracking Agent Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
