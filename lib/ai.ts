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

export const OPENROUTER_MODELS = [
  // Gemini
  { id: 'google/gemini-2.0-flash-exp:free',              label: 'Gemini 2.0 Flash Exp (free)' },
  { id: 'google/gemini-2.0-flash-thinking-exp:free',     label: 'Gemini 2.0 Flash Thinking (free)' },
  { id: 'google/gemini-flash-1.5:free',                  label: 'Gemini 1.5 Flash (free)' },
  { id: 'google/gemini-pro-1.5:free',                    label: 'Gemini 1.5 Pro (free)' },
  // Llama
  { id: 'meta-llama/llama-3.3-70b-instruct:free',        label: 'Llama 3.3 70B (free)' },
  { id: 'meta-llama/llama-3.1-70b-instruct:free',        label: 'Llama 3.1 70B (free)' },
  { id: 'meta-llama/llama-3.1-8b-instruct:free',         label: 'Llama 3.1 8B (free)' },
  { id: 'meta-llama/llama-3-8b-instruct:free',           label: 'Llama 3 8B (free)' },
  // Mistral
  { id: 'mistralai/mistral-7b-instruct:free',            label: 'Mistral 7B (free)' },
  { id: 'mistralai/mistral-nemo:free',                   label: 'Mistral Nemo (free)' },
  // DeepSeek
  { id: 'deepseek/deepseek-r1:free',                     label: 'DeepSeek R1 (free)' },
  { id: 'deepseek/deepseek-chat:free',                   label: 'DeepSeek V3 (free)' },
  // Qwen
  { id: 'qwen/qwen-2.5-72b-instruct:free',               label: 'Qwen 2.5 72B (free)' },
  { id: 'qwen/qwen-2-7b-instruct:free',                  label: 'Qwen 2 7B (free)' },
  // Others
  { id: 'microsoft/phi-3-mini-128k-instruct:free',       label: 'Phi-3 Mini 128K (free)' },
  { id: 'microsoft/phi-3-medium-128k-instruct:free',     label: 'Phi-3 Medium 128K (free)' },
  { id: 'nousresearch/hermes-3-llama-3.1-405b:free',     label: 'Hermes 3 405B (free)' },
  { id: 'openchat/openchat-7b:free',                     label: 'OpenChat 7B (free)' },
  { id: 'huggingfaceh4/zephyr-7b-beta:free',             label: 'Zephyr 7B Beta (free)' },
  { id: 'gryphe/mythomist-7b:free',                      label: 'MythoMist 7B (free)' },
];

export const DEFAULT_MODEL = OPENROUTER_MODELS[0].id;

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

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
      'X-Title': 'SecondBrain',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) throw new Error('INVALID_KEY');
    if (res.status === 404) throw new Error(`MODEL_NOT_FOUND: ${model}`);
    throw new Error(err?.error?.message || 'API_ERROR');
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
