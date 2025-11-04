export const tourSteps = [
  {
    tour: "main-tour",
    steps: [
      // 1. WELCOME
      {
        icon: "👋",
        title: "Willkommen bei YBudget!",
        content: (
          <>
            <p className="mb-2">
              Schön, dass du hier bist! Diese kurze Tour zeigt dir die
              wichtigsten Funktionen.
            </p>
            <p className="text-sm text-muted-foreground">
              Du kannst die Tour jederzeit über den <strong>?</strong> Button
              unten in der Sidebar neu starten.
            </p>
          </>
        ),
        selector: "#tour-budget-cards",
        side: "bottom" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },

      // 2. CHART
      {
        icon: "📈",
        title: "Cashflow-Diagramm",
        content: (
          <>
            <p className="mb-2">
              Das Diagramm zeigt deine Einnahmen und Ausgaben im Zeitverlauf.
            </p>
            <p className="text-sm text-muted-foreground">
              Nutze den Datumsfilter oben rechts, um den Zeitraum anzupassen.
            </p>
          </>
        ),
        selector: "#tour-chart",
        side: "top" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },

      // 3. ACTIONS DROPDOWN
      {
        icon: "➕",
        title: "Neue Transaktionen anlegen",
        content: (
          <>
            <p className="mb-2">
              Über das <strong>+</strong> Menü legst du neue Ausgaben und
              Einnahmen an:
            </p>
            <ul className="space-y-1 text-sm">
              <li>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘E</kbd>{" "}
                Ausgabe planen
              </li>
              <li>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘I</kbd>{" "}
                Einnahme planen
              </li>
              <li>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⇧⌘P</kbd>{" "}
                Projekt erstellen
              </li>
              <li>
                <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⇧⌘F</kbd>{" "}
                Förderer hinzufügen
              </li>
            </ul>
          </>
        ),
        selector: "#tour-add-dropdown",
        side: "left" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },

      // 4. MAIN PAGES
      {
        icon: "🧭",
        title: "Hauptseiten",
        content: (
          <>
            <p className="mb-2">
              Navigiere zwischen den wichtigsten Bereichen:
            </p>
            <ul className="space-y-1 text-sm">
              <li>
                <strong>Dashboard</strong> – Budget-Übersicht
              </li>
              <li>
                <strong>Transaktionen</strong> – Alle Zahlungen
              </li>
              <li>
                <strong>Import</strong> – Aus CSV importiere Transaktionen
                zuordnen
              </li>
              <li>
                <strong>Förderer</strong> – Förderer verwalten
              </li>
            </ul>
          </>
        ),
        selector: "#tour-main-nav",
        side: "right" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
        nextRoute: "/transactions",
      },

      // 6. TRANSACTIONS
      {
        icon: "📋",
        title: "Transaktionen",
        content: (
          <>
            <p className="mb-2">
              Hier findest du alle Zahlungen in einer bearbeitbaren Tabelle.
            </p>
            <p className="text-sm">
              Klicke auf ein Feld, um es direkt zu bearbeiten – Änderungen
              werden automatisch gespeichert!
            </p>
          </>
        ),
        selector: "#tour-transactions-table",
        side: "top" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
      },

      {
        icon: "🎉",
        title: "Du bist startklar!",
        content: (
          <>
            <p className="mb-2">
              Glückwunsch! Du kennst jetzt die wichtigsten Funktionen von
              YBudget.
            </p>
            <p className="mb-3 text-sm">
              Du kannst diese Tour jederzeit über den <strong>?</strong> Button
              unten in der Sidebar neu starten.
            </p>
            <p className="text-sm font-medium">
              Viel Erfolg bei der Verwaltung deines Budgets! 💪
            </p>
          </>
        ),
        selector: "#tour-budget-cards",
        side: "bottom" as const,
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 10,
        nextRoute: "/dashboard",
      },
    ],
  },
];
