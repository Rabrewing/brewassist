"use client";
import { useCockpitMode } from "@/contexts/CockpitModeContext";
import type { CockpitMode } from "@/lib/brewTypes";

export function CockpitModeToggle() {
  const { mode, updateMode } = useCockpitMode();

  return (
    <select
      value={mode}
      onChange={(e) => updateMode(e.target.value as CockpitMode)}
      className="brew-toggle"
    >
      <option value="admin">Admin Mode</option>
      <option value="customer">Customer Mode</option>
    </select>
  );
}
