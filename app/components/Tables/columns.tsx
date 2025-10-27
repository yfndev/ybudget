"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

export const columns = [
  {
    id: "indicator",
    cell: ({ row }: any) => {
      const isExpense = row.original.type === "expense";
      const dotColor = isExpense ? "bg-red-500" : "bg-green-500";

      return (
        <div className="flex items-center px-1 justify-center">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="h-8 px-2"
        >
          Datum
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => {
      const date = row.getValue("date");
      const dateValue = typeof date === 'number' ? new Date(date) : date;
      return <div className="pl-2">{format(dateValue, "dd.MM.yyyy")}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Beschreibung",
  },
  {
    accessorKey: "project",
    header: "Projekt",
  },
  {
    accessorKey: "category",
    header: "Kategorie",
  },
  {
    accessorKey: "amount",
    header: ({ column }: any) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting()}
          className="h-8 px-2 w-full justify-end"
        >
          Betrag
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }: any) => {
      const amount = row.getValue("amount");
      const isNegative = amount < 0;
      const absoluteAmount = Math.abs(amount);

      const formattedAmount = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(absoluteAmount);

      const displayAmount = isNegative
        ? `- ${formattedAmount}`
        : `+ ${formattedAmount}`;

      return <div className="text-right font-medium pr-2">{displayAmount}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => {
      const status = row.getValue("status");
      const transactionType = row.original.type || row.original.transactionType;
      
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
      let displayText = "Geplant";
      
      if (status === "bezahlt") {
        variant = "default";
        displayText = "Bezahlt";
      } else if (status === "matched") {
        variant = "outline";
        displayText = "Zugeordnet";
      } else if (status === "geplant") {
        variant = "secondary";
        displayText = "Geplant";
      }

      return (
        <Badge variant={variant}>
          {displayText}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Actions coming soon</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
