export function getApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('sb_api_key') || '';
}

export function setApiKey(key: string) {
  localStorage.setItem('sb_api_key', key);
}

export function hasApiKey(): boolean {
  return !!getApiKey();
}

// Confirmed free models on Gemini API as of April 2026
export const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash-lite-preview-06-17', label: 'Gemini 2.5 Flash Lite (free) ⚡ Fastest' },
  { id: 'gemini-2.5-flash',                    label: 'Gemini 2.5 Flash (free) — Recommended' },
  { id: 'gemini-2.0-flash',                    label: 'Gemini 2.0 Flash (free)' },
  { id: 'gemini-2.0-flash-lite',               label: 'Gemini 2.0 Flash Lite (free)' },
];

export const DEFAULT_MODEL = GEMINI_MODELS[1].id; // 2.5 Flash

export function getAgentModel(agentId: string): string {
  if (typeof window === 'undefined') return DEFAULT_MODEL;
  return localStorage.getItem(`sb_model_${agentId}`) || DEFAULT_MODEL;
}

export function setAgentModel(agentId: string, modelId: string) {
  localStorage.setItem(`sb_model_${agentId}`, modelId);
}

export async function callClaude(
  prompt: string,
  system = 'You are a helpful second brain assistant.',
  modelId?: string,
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('NO_KEY');

  const model = modelId || DEFAULT_MODEL;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 400 && err?.error?.message?.includes('API_KEY')) throw new Error('INVALID_KEY');
    if (res.status === 403) throw new Error('INVALID_KEY');
    if (res.status === 404) throw new Error('MODEL_NOT_FOUND');
    throw new Error(err?.error?.message || 'API_ERROR');
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
