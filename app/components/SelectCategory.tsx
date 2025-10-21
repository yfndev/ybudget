"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// AI generated examples that will be implemented through convex
const categoryGroups = [
  {
    group: "VERPFLEGUNG",
    items: [
      {
        value: "essen-catering",
        label: "Essen/Catering",
        description: "Kosten für Speisen und Catering-Service",
      },
      {
        value: "getraenke-alkoholfrei",
        label: "Getränke (alkoholfrei)",
        description: "Wasser, Säfte, Softdrinks",
      },
      {
        value: "getraenke-alkoholisch",
        label: "Getränke (alkoholisch)",
        description: "Bier, Wein, Spirituosen",
      },
      {
        value: "helfer-verpflegung",
        label: "Helfer-Verpflegung",
        description: "Verpflegung für ehrenamtliche Helfer",
      },
      {
        value: "speaker-catering",
        label: "Speaker-Catering",
        description: "Spezielle Verpflegung für Referenten",
      },
    ],
  },
  {
    group: "LOCATION & INFRASTRUKTUR",
    items: [
      {
        value: "raummiete",
        label: "Raummiete",
        description: "Miete für Veranstaltungsräume",
      },
      {
        value: "nebenkosten",
        label: "Nebenkosten (Reinigung, Energie)",
        description: "Zusätzliche Kosten für Reinigung und Energie",
      },
      {
        value: "kaution",
        label: "Kaution",
        description: "Sicherheitskaution für Location",
      },
      {
        value: "technik",
        label: "Technik (Beamer, Mikrofone, Leinwand)",
        description: "Grundlegende Veranstaltungstechnik",
      },
      {
        value: "licht-ton",
        label: "Licht & Tontechnik",
        description: "Professionelle Licht- und Tontechnik",
      },
      {
        value: "streaming",
        label: "Streaming-Equipment",
        description: "Equipment für Live-Streaming",
      },
      {
        value: "wlan-it",
        label: "WLAN/IT-Infrastruktur",
        description: "Internet und IT-Infrastruktur",
      },
    ],
  },
  {
    group: "HONORARE & PERSONAL",
    items: [
      {
        value: "speaker-honorare",
        label: "Speaker-Honorare",
        description: "Honorare für Referenten und Vortragende",
      },
      {
        value: "moderatoren-honorare",
        label: "Moderatoren-Honorare",
        description: "Honorare für Moderatoren",
      },
      {
        value: "workshop-leiter",
        label: "Workshop-Leiter",
        description: "Honorare für Workshop-Leiter",
      },
      {
        value: "ehrenamtspauschale",
        label: "Ehrenamtspauschale",
        description: "Pauschale für ehrenamtliche Tätigkeiten",
      },
      {
        value: "uebungsleiterpauschale",
        label: "Übungsleiterpauschale",
        description: "Steuerfreie Übungsleiterpauschale",
      },
      {
        value: "minijobs",
        label: "Minijobs",
        description: "Kosten für geringfügige Beschäftigungen",
      },
      {
        value: "helfer-aufwand",
        label: "Helfer-Aufwandsentschädigungen",
        description: "Aufwandsentschädigungen für Helfer",
      },
    ],
  },
  {
    group: "REISEKOSTEN",
    items: [
      {
        value: "bahntickets",
        label: "Bahntickets",
        description: "Zugfahrkarten für Anreise",
      },
      {
        value: "fluege",
        label: "Flüge",
        description: "Flugkosten für Anreise",
      },
      {
        value: "hotel",
        label: "Hotel-Übernachtungen",
        description: "Übernachtungskosten",
      },
      {
        value: "taxi-transfers",
        label: "Taxi/Transfers",
        description: "Lokale Transportkosten",
      },
      {
        value: "kilometerpauschale",
        label: "Kilometerpauschale",
        description: "Pauschale für PKW-Nutzung",
      },
    ],
  },
  {
    group: "MARKETING & WERBUNG",
    items: [
      {
        value: "flyer-druck",
        label: "Flyer-Druck",
        description: "Druckkosten für Flyer",
      },
      {
        value: "plakate-druck",
        label: "Plakate-Druck",
        description: "Druckkosten für Plakate",
      },
      {
        value: "banner-rollups",
        label: "Banner & Roll-Ups",
        description: "Großformate für Veranstaltung",
      },
      {
        value: "social-media-ads",
        label: "Social Media Ads",
        description: "Werbeanzeigen auf Social Media",
      },
      {
        value: "google-ads",
        label: "Google Ads",
        description: "Werbeanzeigen bei Google",
      },
      {
        value: "fotografie-videografie",
        label: "Fotografie/Videografie",
        description: "Professionelle Foto- und Videoaufnahmen",
      },
      {
        value: "website-hosting",
        label: "Website & Hosting",
        description: "Kosten für Website und Hosting",
      },
      {
        value: "ticketing-system",
        label: "Ticketing-System",
        description: "Online-Ticketverkaufssystem",
      },
    ],
  },
  {
    group: "VERWALTUNG",
    items: [
      {
        value: "bueromaterial",
        label: "Büromaterial",
        description: "Schreibwaren und Bürobedarf",
      },
      {
        value: "porto-versand",
        label: "Porto & Versand",
        description: "Versandkosten und Porto",
      },
      {
        value: "bankgebuehren",
        label: "Bankgebühren",
        description: "Kontoführungs- und Transaktionsgebühren",
      },
      {
        value: "steuerberatung",
        label: "Steuerberatung",
        description: "Honorare für Steuerberater",
      },
      {
        value: "rechtsberatung",
        label: "Rechtsberatung",
        description: "Honorare für Rechtsberatung",
      },
      {
        value: "versicherungen",
        label: "Versicherungen",
        description: "Verschiedene Versicherungen",
      },
      {
        value: "buchhaltungssoftware",
        label: "Buchhaltungssoftware",
        description: "Software für Buchhaltung",
      },
      {
        value: "vereinssoftware",
        label: "Vereinssoftware/CRM",
        description: "Verwaltungssoftware für Vereine",
      },
    ],
  },
  {
    group: "IT & DIGITALE TOOLS",
    items: [
      {
        value: "domain-hosting",
        label: "Domain & Hosting",
        description: "Domain-Registrierung und Webhosting",
      },
      {
        value: "cloud-speicher",
        label: "Cloud-Speicher",
        description: "Cloud-Speicherlösungen",
      },
      {
        value: "collaboration-tools",
        label: "Collaboration-Tools (Slack, Notion, Zoom)",
        description: "Tools für Zusammenarbeit",
      },
      {
        value: "email-marketing",
        label: "E-Mail-Marketing-Tools",
        description: "Newsletter und E-Mail-Marketing",
      },
    ],
  },
  {
    group: "SONSTIGES",
    items: [
      {
        value: "gema-gebuehren",
        label: "GEMA-Gebühren",
        description: "Gebühren für Musikrechte",
      },
      {
        value: "ksk-abgaben",
        label: "KSK-Abgaben",
        description: "Künstlersozialkasse-Abgaben",
      },
      {
        value: "dekoration",
        label: "Dekoration",
        description: "Dekorationsmaterial",
      },
      {
        value: "beschilderung",
        label: "Beschilderung",
        description: "Hinweisschilder und Wegweiser",
      },
      {
        value: "namensschilder",
        label: "Namensschilder",
        description: "Namensschilder für Teilnehmer",
      },
      {
        value: "goodie-bags",
        label: "Goodie Bags/Give-Aways",
        description: "Geschenke und Werbeartikel",
      },
      {
        value: "notfall-puffer",
        label: "Notfall-Puffer",
        description: "Reserve für unvorhergesehene Ausgaben",
      },
    ],
  },
];

export function SelectCategory({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = categoryGroups
    .flatMap((group) => group.items)
    .find((item) => item.value === value);

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value ? selectedItem?.label : "Kategorie wählen..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[400px] p-0 shadow-lg border-2"
          align="start"
        >
          <Command className="rounded-lg">
            <CommandInput placeholder="Kategorie suchen..." className="h-9" />
            <ScrollArea className="h-[400px]">
              <CommandList>
                <CommandEmpty>Keine Kategorie gefunden.</CommandEmpty>
                {categoryGroups.map((group, idx) => (
                  <CommandGroup
                    key={group.group}
                    heading={`${idx + 1}. ${group.group}`}
                  >
                    {group.items.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.value}
                        keywords={[item.label, item.description]}
                        onSelect={(currentValue) => {
                          onValueChange(
                            currentValue === value ? "" : currentValue
                          );
                          setOpen(false);
                        }}
                        className="flex flex-col items-start gap-1 px-4 py-3 cursor-pointer"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="font-medium">→ {item.label}</span>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0",
                              value === item.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </ScrollArea>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedItem && (
        <div className="rounded-md border bg-muted/50 p-3">
          <p className="text-sm font-medium">{selectedItem.label}</p>
          <p className="text-xs text-muted-foreground">
            {selectedItem.description}
          </p>
        </div>
      )}
    </div>
  );
}
