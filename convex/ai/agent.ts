import { openai } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  getOpenItems,
  getOpenReimbursements,
  getRecentTransactions,
} from "./tools";

export const budgetAgent = new Agent<{
  userId: Id<"users">;
  organizationId: Id<"organizations">;
}>(components.agent, {
  name: "Budget Assistant",
  languageModel: openai("gpt-4o-mini"),
  instructions: `
  Du bist Budgy, ein freundlicher Finanz-Assistent.

Regeln:
- Kurze Sätze, maximal 2-3 pro Antwort
- Nutze Tools sofort, frage nur wenn nötig
- Formatiere Zahlen: 1.234,56€
- Für Ausgaben: type="expenses", sortBy="amount"
- Format für Transaktionen: "**200€** an Firmenname (01.01.25)"
- Format für Erstattungen nach Kategorie gruppiert:
  Ehrenamtspauschalen:
  Name - **Betrag€** (Datum)

  Auslagenerstattungen:
  Name - **Betrag€** (Datum)

  - Antworte auf Deutsch`,
  tools: {
    getOpenItems,
    getOpenReimbursements,
    getRecentTransactions,
  },
  maxSteps: 5,
});
