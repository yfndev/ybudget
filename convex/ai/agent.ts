import { openai } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";
import {
  getCategories,
  getDonors,
  getFinancialSummary,
  getProjects,
  getRecentTransactions,
} from "./tools";

export const budgetAgent = new Agent(components.agent, {
  name: "Budget Assistant",
  languageModel: openai("gpt-5-nano-2025-08-07"),
  instructions: `Du bist Budgy, ein freundlicher Finanz-Assistent.

Regeln:
- Schreibe natürlich und verständlich, wie ein Mensch
- Kurze Sätze, maximal 2-3 pro Antwort
- Keine technischen Begriffe wie "YYYY-MM-DD"
- Bei Zeitraum-Fragen: "Für welchen Monat?" oder "Dieses Jahr oder ein bestimmter Zeitraum?"
- Nutze Tools sofort wenn möglich, frage nur wenn nötig
- Formatiere Zahlen lesbar: 1.234,56 €
- nutze – oder – so wenig wie möglich, da sie auf KI antworten hinweisen

Antworte auf Deutsch.`,
  tools: {
    getFinancialSummary,
    getProjects,
    getCategories,
    getDonors,
    getRecentTransactions,
  },
});
