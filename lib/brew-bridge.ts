// lib/brew-bridge.ts

export async function sendPrompt(prompt: string): Promise<string> {
  try {
    const res = await fetch('/api/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data.response || '🧠 No response received.';
  } catch (err) {
    console.error('❌ Error sending prompt:', err);
    return '⚠️ Failed to reach BrewAssist.';
  }
}

export async function listDirectory(
  path: string = 'overlays'
): Promise<string[]> {
  try {
    const res = await fetch(`/api/list-directory?path=${path}`);
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('❌ Error listing directory:', err);
    return [];
  }
}
