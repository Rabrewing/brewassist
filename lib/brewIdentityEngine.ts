// File: lib/brewIdentityEngine.ts
// Phase: S4.6 Implementation
// Summary: Central identity brain for BrewAssist, managing persona, emotion, and context.

import { BrewLastToolRun } from './brewLast'; // Assuming BrewLastToolRun is defined here
import { logIdentityEvent } from './brewLastServer'; // Import logIdentityEvent

// Define types for Persona, Emotion Tier, and Context Window
export type PersonaId = 'rb' | 'default' | 'strict';
export type EmotionTier = 1 | 2 | 3 | 4 | 5; // Calm to Emergency

export interface Persona {
  id: PersonaId;
  label: string;
  tone: string;
  emotionTier: EmotionTier;
  safetyMode: 'soft-stop' | 'hard-stop';
  memoryWindow: number;
  systemPrompt: string; // Added systemPrompt to Persona interface
}

export interface IdentityStatus {
  enabled: boolean;
  activePersonaId: PersonaId;
  emotionTier: EmotionTier;
  memoryBackend: 'file'; // For now, file-based
}

// Placeholder for active persona (will be loaded/managed)
let activePersona: Persona = {
  id: 'rb',
  label: 'RB Mode – BrewExec Architect',
  tone: 'Conversational, confident, and collaborative.',
  emotionTier: 3, // Default to Focused / Tactical
  safetyMode: 'soft-stop',
  memoryWindow: 12,
  systemPrompt: `You are BrewAssist, DevOps + AI co-pilot for RB (Randy Brewington).
You are inside the BrewExec DevOps Cockpit.

Style:
- Warm, collaborative, and confident.
- Mix technical clarity with a little hype when things are going well.
- Use emojis sparingly (1–3 per reply max), never every sentence.
- Be direct, do not over-apologize, and do not sound like corporate boilerplate.

Behavior:
- Assume the user is an expert builder, often on mobile, moving fast.
- Keep answers structured and skimmable: short paragraphs, bullet lists when helpful.
- Always think in terms of phases, testability, and safety.
- If something is risky or destructive (rm, dropping tables, rewriting env files),
  explain the risk and suggest a safer alternative (soft-stop), instead of blindly obeying.

Memory & Context:
- Treat this API as having a rolling window of recent turns.
- If past context is provided (or stored), use it naturally.
- Do NOT claim there is no prior context if messages are provided.

Voice:
- You can celebrate big wins ("we're cooking", "that passed", "ship it"),
  but keep it fast and focused.
- Default to present tense and action language ("Let’s do…", "Next move is…").`,
};

export type PersonaMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

// Placeholder for context window (simple array for now)
let contextWindow: PersonaMessage[] = [];

/**
 * Retrieves the current context window.
 * @returns An array of PersonaMessage objects representing the conversational context.
 */
export function getContextWindow(): PersonaMessage[] {
  return [...contextWindow]; // Return a copy to prevent direct modification
}

/**
 * Pushes a new entry to the context window, maintaining the memory window limit.
 * @param entry The new PersonaMessage entry to add to the context.
 */
export function pushToContextWindow(entry: PersonaMessage): void {
  contextWindow.push(entry);
  if (contextWindow.length > activePersona.memoryWindow) {
    contextWindow.shift(); // Remove the oldest entry
  }
  recordIdentityEvent('context_update', {
    entrySummary: entry.content.slice(0, 50),
  }); // Log context update if needed
}

/**
 * Updates the emotion tier of the active persona.
 * @param newTier The new emotion tier to set.
 */
export function updateEmotionTier(newTier: EmotionTier): void {
  const oldTier = activePersona.emotionTier;
  activePersona.emotionTier = newTier;
  recordIdentityEvent('emotion_shift', { fromTier: oldTier, toTier: newTier });
}

/**
 * Records an identity-related event (e.g., emotion shift, context update).
 * @param eventType The type of identity event.
 * @param details Optional details about the event.
 */
export function recordIdentityEvent(eventType: string, details?: any): void {
  logIdentityEvent({
    event: eventType,
    personaId: activePersona.id,
    details: details,
  });
}

/**
 * Retrieves the currently active persona.
 * @returns The active Persona object.
 */
export function getActivePersona(): Persona {
  return activePersona;
}

// Utility: set active persona (for initialization)
export function setActivePersona(persona: Persona): void {
  activePersona = persona;
}

// Initial setup or loading of persona (e.g., from config or .env)
// This would typically happen on server startup or first request.
// For now, it's hardcoded to 'rb'.
