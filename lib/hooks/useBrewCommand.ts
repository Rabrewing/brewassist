// lib/hooks/useBrewCommand.ts
import { useState } from "react";
import type { BrewResult } from "@/lib/commands/types";

export function useBrewCommand() {
  const [isRunning, setIsRunning] = useState(false);

  async function runCommand(
    command: string,
    input: string
  ): Promise<BrewResult | null> {
    setIsRunning(true);
    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, input }),
      });

      if (!res.ok) {
        console.error("Command failed", await res.text());
        return null;
      }

      const data = (await res.json()) as BrewResult;
      return data;
    } finally {
      setIsRunning(false);
    }
  }

  return { runCommand, isRunning };
}
