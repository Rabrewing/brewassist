import type { BrewLastState } from '@/lib/brewLast';

export async function fetchBrewLast(): Promise<BrewLastState | null> {
  try {
    const response = await fetch('/api/brewlast');
    if (!response.ok) {
      console.error('Failed to fetch BrewLast state:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.ok) {
      return data.state as BrewLastState;
    }

    console.error('BrewLast API returned an error:', data.error);
    return null;
  } catch (error) {
    console.error('Error fetching BrewLast state:', error);
    return null;
  }
}
