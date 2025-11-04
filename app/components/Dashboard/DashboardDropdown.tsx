import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function DashboardDropdown({
  onOpenExpense,
  onOpenIncome,
  onOpenImport,
  onOpenDonor,
  onOpenCategory,
  onOpenProject,
}: {
  onOpenExpense: () => void;
  onOpenIncome: () => void;
  onOpenImport: () => void;
  onOpenDonor: () => void;
  onOpenCategory: () => void;
  onOpenProject: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">Hinzufügen</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-auto mr-4" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onOpenExpense}>
            <span className="font-semibold"> Ausgabe planen</span>
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenIncome}>
            <span className="font-semibold"> Einnahme planen</span>
            <DropdownMenuShortcut>⌘I</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={onOpenProject}>
            <span> Projekt erstellen</span>
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenDonor}>
            <span> Förderer hinzufügen</span>
            <DropdownMenuShortcut>⇧⌘F</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenImport}>
            CSV importieren
            {/* <DropdownMenuShortcut>⇧⌘B</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenCategory}>
            <span> Kategorie hinzufügen</span>
            <DropdownMenuShortcut>⇧⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <span className="text-muted-foreground"> Shortcuts</span>

            {/* <DropdownMenuShortcut>⌘K</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
