export const CATEGORY_GROUPS = [
  {
    group: "Einnahmen",
    type: "income" as const,
    items: [
      {
        value: "monetary-donations",
        label: "Geldspenden",
        description: "Finanzielle Zuwendungen ohne Gegenleistung",
        taxsphere: "non-profit" as const,
      },
      {
        value: "sponsorship-cash",
        label: "Sponsoring (Geldleistung)",
        description: "Finanzielle Unterstützung durch Sponsoren",
        taxsphere: "commercial-operations" as const,
      },
      {
        value: "membership-fees",
        label: "Mitgliedsbeiträge",
        description: "Regelmäßige Beiträge der Vereinsmitglieder",
        taxsphere: "non-profit" as const,
      },

      {
        value: "ticket-sales",
        label: "Ticketverkäufe/Eintrittsgelder",
        description: "Einnahmen aus Ticketverkauf für Events",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "workshop-income",
        label: "Workshop-Einnahmen",
        description: "Erlöse aus kostenpflichtigen Workshops",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "catering-sales",
        label: "Catering-Verkäufe",
        description: "Verkauf von Speisen und Getränken bei Events",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "merchandising",
        label: "Merchandising",
        description: "Verkauf von Fanartikeln und Merchandise",
        taxsphere: "commercial-operations" as const,
      },
    ],
  },
  {
    group: "Verpflegung",
    type: "expense" as const,
    items: [
      {
        value: "food-catering",
        label: "Essen/Catering",
        description: "Kosten für Speisen und Catering-Service",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "beverages-nonalcoholic",
        label: "Getränke (alkoholfrei)",
        description: "Wasser, Säfte, Softdrinks",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "beverages-alcoholic",
        label: "Getränke (alkoholisch)",
        description: "Bier, Wein, Spirituosen",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "helper-catering",
        label: "Helfer-Verpflegung",
        description: "Verpflegung für ehrenamtliche Helfer",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "speaker-catering",
        label: "Speaker-Catering",
        description: "Spezielle Verpflegung für Referenten",
        taxsphere: "purpose-operations" as const,
      },
    ],
  },
  {
    group: "Location & Infrastruktur",
    type: "expense" as const,
    items: [
      {
        value: "room-rental",
        label: "Raummiete",
        description: "Miete für Veranstaltungsräume",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "additional-costs",
        label: "Nebenkosten (Reinigung, Energie)",
        description: "Zusätzliche Kosten für Reinigung und Energie",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "deposit",
        label: "Kaution",
        description: "Sicherheitskaution für Location",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "technical-equipment",
        label: "Technik (Beamer, Mikrofone, Leinwand, Licht, etc.)",
        description: "Grundlegende und professionelle Veranstaltungstechnik",
        taxsphere: "purpose-operations" as const,
      },

      {
        value: "wlan-it-infrastructure",
        label: "WLAN/IT-Infrastruktur",
        description: "Internet und IT-Infrastruktur",
        taxsphere: "purpose-operations" as const,
      },

      {
        value: "decoration",
        label: "Dekoration",
        description: "Dekorationsmaterial",
        taxsphere: "purpose-operations" as const,
      },
    ],
  },
  {
    group: "Honorare & Personal",
    type: "expense" as const,
    items: [
      {
        value: "speaker-fees",
        label: "Speaker-Honorare",
        description: "Honorare für Referenten und Vortragende",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "volunteer-allowance",
        label: "Ehrenamtspauschale",
        description: "Pauschale für ehrenamtliche Tätigkeiten (840€/Jahr)",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "course-instructor-allowance",
        label: "Übungsleiterpauschale",
        description: "Steuerfreie Übungsleiterpauschale (3.000€/Jahr)",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "minijobs",
        label: "Minijobs",
        description: "Kosten für geringfügige Beschäftigungen",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "student-assistant",
        label: "Studentische Hilfskraft/Werkstudent",
        description: "Vergütung für studentische Mitarbeiter",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "ksk-contributions",
        label: "KSK-Abgaben",
        description: "Künstlersozialkasse-Abgaben",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "gema-fees",
        label: "GEMA-Gebühren",
        description: "Gebühren für Musikrechte",
        taxsphere: "purpose-operations" as const,
      },
    ],
  },
  {
    group: "Reisekosten",
    type: "expense" as const,
    items: [
      {
        value: "train-tickets",
        label: "Bahntickets",
        description: "Zugfahrkarten für Anreise",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "flights",
        label: "Flüge",
        description: "Flugkosten für Anreise",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "hotel",
        label: "Hotel-Übernachtungen",
        description: "Übernachtungskosten",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "taxi-transfers",
        label: "Taxi/Transfers",
        description: "Lokale Transportkosten",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "mileage-allowance",
        label: "Kilometerpauschale",
        description: "Pauschale für PKW-Nutzung",
        taxsphere: "purpose-operations" as const,
      },
    ],
  },
  {
    group: "Verwaltung & IT",
    type: "expense" as const,
    items: [
      {
        value: "office-supplies",
        label: "Büromaterial",
        description: "Schreibwaren und Bürobedarf",
        taxsphere: "non-profit" as const,
      },
      {
        value: "postage-shipping",
        label: "Porto & Versand",
        description: "Versandkosten und Porto",
        taxsphere: "non-profit" as const,
      },
      {
        value: "bank-fees",
        label: "Bankgebühren",
        description: "Kontoführungs- und Transaktionsgebühren",
        taxsphere: "non-profit" as const,
      },
      {
        value: "tax-consulting",
        label: "Steuerberatung",
        description: "Honorare für Steuerberater",
        taxsphere: "non-profit" as const,
      },
      {
        value: "legal-advice",
        label: "Rechtsberatung",
        description: "Honorare für Rechtsberatung",
        taxsphere: "non-profit" as const,
      },
      {
        value: "insurance",
        label: "Versicherungen",
        description: "Verschiedene Versicherungen",
        taxsphere: "non-profit" as const,
      },
      {
        value: "domain-hosting",
        label: "Domain & Hosting",
        description: "Domain-Registrierung und Webhosting",
        taxsphere: "purpose-operations" as const,
      },
      {
        value: "equipment-inventory",
        label: "Ausstattung & Inventar",
        description: "Anschaffungen von Geräten und Material",
        taxsphere: "asset-management" as const,
      },
    ],
  },
];
