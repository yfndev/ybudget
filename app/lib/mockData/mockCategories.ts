export const CATEGORY_GROUPS = [
  {
    group: "Einnahmen",
    type: "income",
    items: [
      { value: "donations", label: "Spenden", taxsphere: "non-profit" },
      {
        value: "sponsorship",
        label: "Sponsoring",
        taxsphere: "commercial-operations",
      },
      {
        value: "membership-fees",
        label: "Mitgliedsbeiträge",
        taxsphere: "non-profit",
      },
      {
        value: "ticket-sales",
        label: "Ticketverkäufe/Eintrittsgelder",
        taxsphere: "purpose-operations",
      },
      {
        value: "workshop-income",
        label: "Workshop-Einnahmen",
        taxsphere: "purpose-operations",
      },
      {
        value: "catering-sales",
        label: "Catering-Verkäufe",
        taxsphere: "purpose-operations",
      },
      {
        value: "merchandising",
        label: "Merchandising",
        taxsphere: "commercial-operations",
      },
    ],
  },
  {
    group: "Verpflegung",
    type: "expense",
    items: [
      {
        value: "catering",
        label: "Essen/Catering",
        taxsphere: "purpose-operations",
      },
      {
        value: "beverages-nonalcoholic",
        label: "Getränke (alkoholfrei)",
        taxsphere: "purpose-operations",
      },
      {
        value: "beverages-alcoholic",
        label: "Getränke (alkoholisch)",
        taxsphere: "purpose-operations",
      },
    ],
  },
  {
    group: "Location & Infrastruktur",
    type: "expense",
    items: [
      {
        value: "room-rental",
        label: "Raummiete",
        taxsphere: "purpose-operations",
      },
      {
        value: "technical-equipment",
        label: "Technik (Beamer, Mikrofone, Leinwand, Licht, etc.)",
        taxsphere: "purpose-operations",
      },
      {
        value: "additional-costs",
        label: "Nebenkosten (Reinigung, Energie)",
        taxsphere: "purpose-operations",
      },
      { value: "deposit", label: "Kaution", taxsphere: "purpose-operations" },
      {
        value: "decoration",
        label: "Dekoration",
        taxsphere: "purpose-operations",
      },
    ],
  },
  {
    group: "Honorare & Personal",
    type: "expense",
    items: [
      {
        value: "volunteer-allowance",
        label: "Ehrenamtspauschale",
        taxsphere: "purpose-operations",
      },
      {
        value: "expense-reimbursement",
        label: "Auslagenerstattung",
        taxsphere: "purpose-operations",
      },
      {
        value: "travel-expenses",
        label: "Reisekosten",
        taxsphere: "purpose-operations",
      },
      {
        value: "speaker-fees",
        label: "Speakerhonorare",
        taxsphere: "purpose-operations",
      },
      {
        value: "jobs",
        label: "Gehälter (Minijobs,Werkstudenten, etc.)",
        taxsphere: "purpose-operations",
      },
      {
        value: "ksk-contributions",
        label: "KSK-Abgaben",
        taxsphere: "purpose-operations",
      },
      {
        value: "gema-fees",
        label: "GEMA-Gebühren",
        taxsphere: "purpose-operations",
      },
    ],
  },
  {
    group: "IT",
    type: "expense",
    items: [
      {
        value: "domain-hosting",
        label: "Domain & Hosting",
        taxsphere: "purpose-operations",
      },
      {
        value: "software-licenses",
        label: "Software & Lizenzen",
        taxsphere: "purpose-operations",
      },
      {
        value: "equipment",
        label: "Hardware & Geräte",
        taxsphere: "asset-management",
      },
    ],
  },
  {
    group: "Verwaltung",
    type: "expense",
    items: [
      {
        value: "office-supplies",
        label: "Büromaterial",
        taxsphere: "non-profit",
      },
      {
        value: "postage-shipping",
        label: "Porto & Versand",
        taxsphere: "non-profit",
      },
      { value: "bank-fees", label: "Bankgebühren", taxsphere: "non-profit" },
      {
        value: "consulting",
        label: "Steuer- & Rechtsberatung",
        taxsphere: "non-profit",
      },
      { value: "insurance", label: "Versicherungen", taxsphere: "non-profit" },
    ],
  },
] as const;
