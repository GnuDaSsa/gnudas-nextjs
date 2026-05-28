import { existsSync, readFileSync } from 'fs';

type EnvMap = Record<string, string>;

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

const LOCAL_FACTCHAT_ENV_PATH =
  'C:\\Users\\Owner\\Desktop\\사진우\\AI\\factchat api.env';

const DEFAULT_BASE_URL = 'https://factchat-cloud.mindlogic.ai/v1/gateway';
const DEFAULT_TEXT_MODEL = 'claude-sonnet-4-6';
const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';
const DEFAULT_AUDIO_MODEL = 'gemini-2.5-flash';

let cachedFileEnv: EnvMap | null = null;

function parseEnvText(text: string): EnvMap {
  const env: EnvMap = {};

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

function readLocalFactChatEnv(): EnvMap {
  if (cachedFileEnv) return cachedFileEnv;

  const configuredPath = process.env.FACTCHAT_ENV_PATH || LOCAL_FACTCHAT_ENV_PATH;
  if (!existsSync(configuredPath)) {
    cachedFileEnv = {};
    return cachedFileEnv;
  }

  cachedFileEnv = parseEnvText(readFileSync(configuredPath, 'utf8'));
  return cachedFileEnv;
}

function readValue(key: string, fallback = '') {
  return process.env[key] || readLocalFactChatEnv()[key] || fallback;
}

export function getFactChatConfig(): FactChatConfig {
  const apiKey = readValue('FACTCHAT_API_KEY');

  if (!apiKey) {
    throw new Error(
      'FACTCHAT_API_KEY가 필요합니다. Vercel 환경변수 또는 로컬 factchat api.env에 설정하세요.',
    );
  }

  return {
    apiKey,
    baseUrl: readValue('FACTCHAT_BASE_URL', DEFAULT_BASE_URL).replace(/\/+$/, ''),
    model: readValue('FACTCHAT_MODEL', DEFAULT_TEXT_MODEL),
    imageModel: readValue('FACTCHAT_IMAGE_MODEL', DEFAULT_IMAGE_MODEL),
    audioModel: readValue('FACTCHAT_AUDIO_MODEL', DEFAULT_AUDIO_MODEL),
  };
}

async function parseFactChatResponse(response: Response) {
  const text = await response.text();
  let data: unknown = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof data.error === 'object' &&
      data.error !== null &&
      'message' in data.error
        ? String(data.error.message)
        : `FactChat 요청 실패 (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export async function factChatFetch(path: string, init: RequestInit = {}) {
  const config = getFactChatConfig();
  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  return parseFactChatResponse(response);
}

export async function factChatText({
  messages,
  model,
  maxTokens = 1800,
}: {
  messages: FactChatMessage[];
  model?: string;
  maxTokens?: number;
}) {
  const config = getFactChatConfig();
  const data = (await factChatFetch('/chat/completions/', {
    method: 'POST',
    body: JSON.stringify({
      model: model || config.model,
      messages,
      max_tokens: maxTokens,
    }),
  })) as {
    choices?: Array<{ message?: { content?: string } }>;
    output_text?: string;
  };

  return data.choices?.[0]?.message?.content || data.output_text || '';
}

export async function factChatJson<T>({
  messages,
  model,
  maxTokens = 1200,
}: {
  messages: FactChatMessage[];
  model?: string;
  maxTokens?: number;
}) {
  const text = await factChatText({ messages, model, maxTokens });
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned) as T;
}

export function dataUrlToBase64(dataUrl: string) {
  const index = dataUrl.indexOf(',');
  return index >= 0 ? dataUrl.slice(index + 1) : dataUrl;
}
