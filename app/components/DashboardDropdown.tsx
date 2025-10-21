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
}: {
  onOpenExpense: () => void;
  onOpenIncome: () => void;
  onOpenImport: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">Hinzufügen</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-6" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onOpenExpense}>
            Ausgabe planen
            <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenIncome}>
            Einnahme planen
            <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onOpenImport}>
            Banking CSV imporieren
            <DropdownMenuShortcut>⇧⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
