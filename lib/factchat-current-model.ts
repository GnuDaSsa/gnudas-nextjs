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

const LOCAL_FACTCHAT_ENV_PATH =
  'C:\\Users\\Owner\\Desktop\\사진우\\AI\\factchat api.env';

const DEFAULT_BASE_URL = 'https://factchat-cloud.mindlogic.ai/v1/gateway';
const DEFAULT_TEXT_MODEL = 'nemotron-current';
const DEFAULT_IMAGE_MODEL = 'gpt-image-2';
const DEFAULT_AUDIO_MODEL = 'gemini-2.5-flash';
const FACTCHAT_TIMEOUT_MS = 45_000;
const FACTCHAT_MAX_ATTEMPTS = 2;

let cachedFileEnv: Record<string, string> | null = null;

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

function readLocalFactChatEnv(): Record<string, string> {
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
  const directValue = process.env[key];
  if (directValue) return directValue;
  const normalizedProcessKey = Object.keys(process.env).find(
    (candidate) => candidate.replace(/^\uFEFF/, '') === key,
  );
  if (normalizedProcessKey) {
    return process.env[normalizedProcessKey] || fallback;
  }
  const fileEnv = readLocalFactChatEnv();
  return fileEnv[key] || fallback;
}

export function getFactChatConfig(): FactChatConfig {
  return {
    apiKey: 'current-model-context',
    baseUrl: 'internal://current-model',
    model: DEFAULT_TEXT_MODEL,
    imageModel: DEFAULT_IMAGE_MODEL,
    audioModel: DEFAULT_AUDIO_MODEL,
  };
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

export async function factChatText({
  messages,
  model,
  maxTokens = 1800,
}: {
  messages: FactChatMessage[];
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  throw new Error(
    'factChatText must be called from within the model context. ' +
    'Use the unified wrapper that delegates to the current model.'
  );
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
  throw new Error(
    'factChatJson must be called from within the model context. ' +
    'Use the unified wrapper that delegates to the current model.'
  );
}

export async function factChatFetch(
  path: string,
  init: RequestInit = {}
): Promise<unknown> {
  const body = init.body ? JSON.parse(init.body as string) : {};
  const messages: FactChatMessage[] = body.messages || [];

  if (path === '/chat/completions/') {
    throw new Error(
      'factChatFetch must be called from within the model context. ' +
      'Use the unified wrapper that delegates to the current model.'
    );
  }

  if (path === '/images/generate/') {
    throw new Error('Image generation not supported via current model context');
  }

  throw new Error(`Unsupported path: ${path}`);
}

export function dataUrlToBase64(dataUrl: string): string {
  const index = dataUrl.indexOf(',');
  return index >= 0 ? dataUrl.slice(index + 1) : dataUrl;
}