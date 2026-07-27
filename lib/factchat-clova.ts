import { existsSync, readFileSync } from 'fs';

export type FactChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: unknown;
};

export type FactChatConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  imageModel: string;
  audioModel: string;
};

const CLOVA_BASE_URL = 'https://clovastudio.stream.ntruss.com';
const DEFAULT_TEXT_MODEL = 'HCX-003';
const DEFAULT_VISION_MODEL = 'HCX-005';
const DEFAULT_IMAGE_MODEL = 'unsupported';
const DEFAULT_AUDIO_MODEL = 'unsupported';
const CLOVA_TIMEOUT_MS = 60_000;
const CLOVA_MAX_ATTEMPTS = 2;

let cachedFileEnv: Record<string, string> | null = null;

const LOCAL_CLOVA_ENV_PATH =
  'C:\\Users\\Owner\\Desktop\\사진우\\AI\\clova api.env';

function parseEnvText(text: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex < 0) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
  return env;
}

function readLocalClovaEnv(): Record<string, string> {
  if (cachedFileEnv) return cachedFileEnv;
  const configuredPath = process.env.CLOVA_ENV_PATH || LOCAL_CLOVA_ENV_PATH;
  if (!existsSync(configuredPath)) {
    cachedFileEnv = {};
    return cachedFileEnv;
  }
  cachedFileEnv = parseEnvText(readFileSync(configuredPath, 'utf8'));
  return cachedFileEnv;
}

function readValue(key: string, fallback = '') {
  const directValue = process.env[key];
  if (directValue) return directValue;
  const normalizedProcessKey = Object.keys(process.env).find(
    (candidate) => candidate.replace(/^\uFEFF/, '') === key,
  );
  if (normalizedProcessKey) {
    return process.env[normalizedProcessKey] || fallback;
  }
  const fileEnv = readLocalClovaEnv();
  return fileEnv[key] || fallback;
}

function getApiKey(): string {
  const apiKey = readValue('CLOVA_API_KEY') || readValue('CLOVASTUDIO_API_KEY');
  if (!apiKey) {
    throw new Error(
      'CLOVA_API_KEY가 필요합니다. 환경변수 또는 clova api.env에 설정하세요.',
    );
  }
  return apiKey;
}

function getRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

async function clovaFetch(
  path: string,
  init: RequestInit = {},
  modelName: string
): Promise<unknown> {
  const apiKey = getApiKey();
  const url = `${CLOVA_BASE_URL}${path}/${modelName}`;

  let lastError: unknown;

  for (let attempt = 1; attempt <= CLOVA_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CLOVA_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'X-NCP-CLOVASTUDIO-REQUEST-ID': getRequestId(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(init.headers ?? {}),
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (attempt < CLOVA_MAX_ATTEMPTS && (response.status === 429 || response.status >= 500)) {
        lastError = new Error(`CLOVA 요청 실패 (${response.status})`);
        continue;
      }

      const data = await response.json();

      if (!response.ok) {
        const message = data?.status?.message || `CLOVA 요청 실패 (${response.status})`;
        throw new Error(message);
      }

      return data;
    } catch (error) {
      lastError = error;
      if (attempt >= CLOVA_MAX_ATTEMPTS) break;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError instanceof Error
    ? new Error(`CLOVA 요청 실패: ${lastError.message}`)
    : new Error('CLOVA 요청에 실패했습니다.');
}

function extractJsonObject(text: string): string {
  const withoutFence = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  if (withoutFence.startsWith('{') || withoutFence.startsWith('[')) {
    return withoutFence;
  }

  const start = withoutFence.search(/[\[{]/);
  if (start < 0) return withoutFence;

  const opener = withoutFence[start];
  const closer = opener === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < withoutFence.length; index += 1) {
    const char = withoutFence[index];
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === opener) depth += 1;
    if (char === closer) depth -= 1;
    if (depth === 0) {
      return withoutFence.slice(start, index + 1);
    }
  }
  return withoutFence.slice(start);
}

function messagesToClovaFormat(messages: FactChatMessage[]): Array<{ role: string; content: string }> {
  return messages.map((m) => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
  }));
}

export function getFactChatConfig(): FactChatConfig {
  return {
    apiKey: getApiKey(),
    baseUrl: CLOVA_BASE_URL,
    model: readValue('CLOVA_TEXT_MODEL', DEFAULT_TEXT_MODEL),
    imageModel: readValue('CLOVA_IMAGE_MODEL', DEFAULT_IMAGE_MODEL),
    audioModel: readValue('CLOVA_AUDIO_MODEL', DEFAULT_AUDIO_MODEL),
  };
}

export async function factChatText({
  messages,
  model,
  maxTokens = 1800,
}: {
  messages: FactChatMessage[];
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const targetModel = model || readValue('CLOVA_TEXT_MODEL', DEFAULT_TEXT_MODEL);
  const useV3 = targetModel.startsWith('HCX-005') || targetModel.startsWith('HCX-DASH-002');
  const path = useV3 ? '/v3/chat-completions' : '/v1/chat-completions';

  const payload = {
    messages: messagesToClovaFormat(messages),
    maxTokens: Math.min(maxTokens, 4096),
    temperature: 0.5,
    topP: 0.8,
    topK: 0,
    repetitionPenalty: useV3 ? 1.1 : 5.0,
    includeAiFilters: false,
  };

  const data = (await clovaFetch(path, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, targetModel)) as {
    result?: {
      message?: { content?: string };
      usage?: { completionTokens?: number; promptTokens?: number; totalTokens?: number };
    };
    status?: { code?: string; message?: string };
  };

  if (data.status?.code !== '20000' && data.status?.code !== '200') {
    throw new Error(data.status?.message || 'CLOVA API 오류');
  }

  return data.result?.message?.content || '';
}

export async function factChatJson<T>({
  messages,
  model,
  maxTokens = 1200,
}: {
  messages: FactChatMessage[];
  model?: string;
  maxTokens?: number;
}): Promise<T> {
  const text = await factChatText({ messages, model, maxTokens });
  const cleaned = extractJsonObject(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `CLOVA JSON 파싱 실패: ${error.message}`
        : 'CLOVA JSON 파싱 실패',
    );
  }
}

export async function factChatFetch(
  path: string,
  init: RequestInit = {}
): Promise<unknown> {
  const body = init.body ? JSON.parse(init.body as string) : {};
  const messages: FactChatMessage[] = body.messages || [];
  const model = body.model;
  const maxTokens = body.max_tokens;

  if (path === '/chat/completions/') {
    const targetModel = model || readValue('CLOVA_TEXT_MODEL', DEFAULT_TEXT_MODEL);
    const useV3 = targetModel.startsWith('HCX-005') || targetModel.startsWith('HCX-DASH-002');
    const clovaPath = useV3 ? '/v3/chat-completions' : '/v1/chat-completions';

    const payload = {
      messages: messagesToClovaFormat(messages),
      maxTokens: Math.min(maxTokens || 1800, 4096),
      temperature: 0.5,
      topP: 0.8,
      topK: 0,
      repetitionPenalty: useV3 ? 1.1 : 5.0,
      includeAiFilters: false,
    };

    const data = await clovaFetch(clovaPath, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, targetModel);

    return data;
  }

  if (path === '/images/generate/') {
    throw new Error(
      'CLOVA Studio는 이미지 생성을 지원하지 않습니다. HCX-005는 이미지 이해만 가능합니다. ' +
      '이미지 생성이 필요하면 DALL-E, Midjourney, Stable Diffusion 등 별도 서비스 연동 필요.'
    );
  }

  throw new Error(`Unsupported path: ${path}`);
}

export function dataUrlToBase64(dataUrl: string): string {
  const index = dataUrl.indexOf(',');
  return index >= 0 ? dataUrl.slice(index + 1) : dataUrl;
}

export function resetClovaConfig(): void {
  cachedFileEnv = null;
}