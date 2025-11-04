import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

type Category = {
  _id: Id<"categories">;
  name: string;
  description: string;
  parentId?: Id<"categories">;
};

type CategoryGroup = {
  parent: Category;
  children: Category[];
};

type SelectCategoryUIProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Id<"categories"> | undefined;
  selectedItem: Category | undefined;
  search: string;
  onSearchChange: (search: string) => void;
  filteredGroups: CategoryGroup[];
  activeGroupIdx: number;
  onActiveGroupChange: (idx: number) => void;
  activeItemIdx: number;
  onActiveItemChange: (idx: number) => void;
  activeItems: Category[];
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSelect: (id: Id<"categories">) => void;
};

export function SelectCategoryUI({
  open,
  onOpenChange,
  value,
  selectedItem,
  search,
  onSearchChange,
  filteredGroups,
  activeGroupIdx,
  onActiveGroupChange,
  activeItemIdx,
  onActiveItemChange,
  activeItems,
  onKeyDown,
  onSelect,
  triggerRef,
}: SelectCategoryUIProps & { triggerRef?: React.Ref<HTMLButtonElement> }) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          className="w-full justify-between h-auto py-2.5 hover:bg-accent/50 transition-all"
          data-testid="category-trigger"
        >
          <span className="flex flex-col items-start gap-1 flex-1 min-w-0">
            <span
              className={cn(
                "font-medium text-sm",
                value ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {value ? selectedItem?.name : "Kategorie wählen..."}
            </span>
            {selectedItem?.description && (
              <span className="text-xs text-muted-foreground line-clamp-1 text-left">
                {selectedItem.description}
              </span>
            )}
          </span>
          <ChevronsUpDown className="opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 shadow-xl border w-[640px] z-[100]"
        align="start"
        side="bottom"
        sideOffset={4}
        onKeyDown={onKeyDown}
      >
        <div className="border-b">
          <div className="flex items-center gap-2 w-full h-9 rounded-md border-input bg-background px-3 text-sm transition-all">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Kategorie suchen..."
              className="h-5 border-0 p-0 focus-visible:ring-0 font-medium placeholder:text-muted-foreground text-sm"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
            />
            {search && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange("");
                }}
                className="shrink-0 rounded-sm opacity-50 hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="flex max-h-[440px]">
          {filteredGroups.length === 0 ? (
            <div className="flex-1 py-12 text-center">
              <div className="flex flex-col items-center gap-2">
                <Search className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">
                  Keine Kategorie gefunden
                </p>
                <p className="text-xs text-muted-foreground">
                  Versuchen Sie einen anderen Suchbegriff
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-64 border-r bg-muted/30 overflow-y-auto">
                {filteredGroups.map((group, idx) => (
                  <button
                    key={group.parent._id}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm font-semibold hover:bg-accent/50 transition-colors",
                      idx === activeGroupIdx && "bg-accent"
                    )}
                    onMouseEnter={() => {
                      onActiveGroupChange(idx);
                      onActiveItemChange(0);
                    }}
                    type="button"
                  >
                    <span>
                      {idx + 1}. {group.parent.name}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {activeItems.map((item, itemIdx) => (
                  <button
                    key={item._id}
                    className={cn(
                      "w-full text-left px-2 py-1 hover:bg-accent transition-all",
                      itemIdx === activeItemIdx && "bg-accent",
                      value === item._id && "bg-accent/50"
                    )}
                    onClick={() => onSelect(item._id)}
                    onMouseEnter={() => onActiveItemChange(itemIdx)}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-snug mb-1">
                          {item.name}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0 mt-0.5 transition-all",
                          value === item._id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
