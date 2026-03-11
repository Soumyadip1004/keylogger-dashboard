"use client";

import { Keyboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ApiKeyGateProps {
  onSubmit: (apiKey: string) => void;
}

/**
 * A full-screen gate that prompts the user for their API key.
 * Renders the login form and calls `onSubmit` with the trimmed key.
 */
export function ApiKeyGate({ onSubmit }: ApiKeyGateProps) {
  const [value, setValue] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Keyboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg">
              Keylogger Dashboard
            </h1>
            <p className="text-muted-foreground text-xs">
              Enter your API key to access the dashboard.
            </p>
          </div>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            const trimmed = value.trim();
            if (trimmed) {
              onSubmit(trimmed);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="api-key"
              className="mb-1.5 block font-medium text-foreground text-sm"
            >
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Enter your API key..."
              className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <Button type="submit" className="w-full">
            Access Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}
