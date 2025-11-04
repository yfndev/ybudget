import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export function DashboardDropdown({
  onOpenExpense,
  onOpenIncome,
  onOpenImport,
  onOpenDonor,
  onOpenCategory,
}: {
  onOpenExpense: () => void;
  onOpenIncome: () => void;
  onOpenImport: () => void;
  onOpenDonor: () => void;
  onOpenCategory: () => void;
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
            {/* <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenIncome}>
            <span className="font-semibold"> Einnahme planen</span>
            {/* <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenDonor}>
            <span className=""> Förderer hinzufügen</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenImport}>
            CSV importieren
            {/* <DropdownMenuShortcut>⇧⌘B</DropdownMenuShortcut> */}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenCategory}>
            <span> Kategorie hinzufügen</span>
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
