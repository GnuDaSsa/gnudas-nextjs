import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

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

type LocalModelProvider = 'claude-code' | 'codex' | 'auto';

interface LocalModelConfig {
  provider: LocalModelProvider;
  model: string;
  reasoningEffort?: string;
  timeoutMs?: number;
}

let cachedLocalConfig: LocalModelConfig | null = null;

function getLocalModelConfig(): LocalModelConfig {
  if (cachedLocalConfig) return cachedLocalConfig;

  const provider = (process.env.LOCAL_MODEL_PROVIDER as LocalModelProvider) || 'auto';
  const model = process.env.LOCAL_MODEL_NAME || 'claude-sonnet-4-6';
  const reasoningEffort = process.env.LOCAL_MODEL_REASONING || 'high';
  const timeoutMs = parseInt(process.env.LOCAL_MODEL_TIMEOUT || '120000', 10);

  cachedLocalConfig = { provider, model, reasoningEffort, timeoutMs };
  return cachedLocalConfig;
}

function findCliPath(cliName: string, knownPaths: string[]): string | null {
  for (const p of knownPaths) {
    const expanded = p.replace('$USERPROFILE', process.env.USERPROFILE || '');
    if (existsSync(expanded)) return expanded;
  }
  try {
    const result = spawnSync('where', [cliName], { encoding: 'utf8', stdio: 'pipe' });
    if (result.status === 0 && result.stdout.trim()) {
      return result.stdout.trim().split('\n')[0];
    }
  } catch {}
  return null;
}

function getClaudeCodePath(): string | null {
  return findCliPath('claude-code', [
    'claude-code',
    join(process.env.USERPROFILE || '', '.claude', 'downloads', 'claude-2.1.217-win32-x64.exe'),
    join(process.env.LOCALAPPDATA || '', 'Programs', 'Claude', 'claude-code.exe'),
    join(process.env.PROGRAMFILES || '', 'Claude', 'claude-code.exe'),
  ]);
}

function getCodexPath(): string | null {
  return findCliPath('codex', [
    'codex',
    join(process.env.USERPROFILE || '', '.codex', '.sandbox-bin', 'codex.exe'),
    join(process.env.LOCALAPPDATA || '', 'Programs', 'Codex', 'codex.exe'),
  ]);
}

function buildSystemPrompt(mode: 'text' | 'json'): string {
  const base = `You are a helpful AI assistant accessed via a local CLI wrapper.
Respond directly without preamble.`;

  if (mode === 'json') {
    return `${base}
Output MUST be valid JSON only. No markdown fences, no extra text.`;
  }
  return base;
}

function messagesToPrompt(messages: FactChatMessage[]): string {
  return messages
    .map((m) => {
      const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
      return `[${m.role.toUpperCase()}]\n${content}`;
    })
    .join('\n\n');
}

async function callClaudeCode(
  prompt: string,
  model: string,
  timeoutMs: number,
  systemPrompt: string
): Promise<string> {
  const cliPath = getClaudeCodePath();
  if (!cliPath) throw new Error('claude-code CLI not found');

  const fullPrompt = `${systemPrompt}\n\n${prompt}`;
  const result = spawnSync(cliPath, ['--model', model, '-p', fullPrompt], {
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 1024 * 1024 * 10,
    env: { ...process.env, NO_COLOR: '1' },
  });

  if (result.error) {
    throw new Error(`claude-code execution failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = result.stderr?.toString() || 'unknown error';
    throw new Error(`claude-code exited with code ${result.status}: ${stderr}`);
  }
  return result.stdout?.toString().trim() || '';
}

async function callCodex(
  prompt: string,
  model: string,
  reasoningEffort: string,
  timeoutMs: number,
  systemPrompt: string
): Promise<string> {
  const cliPath = getCodexPath();
  if (!cliPath) throw new Error('codex CLI not found');

  const fullPrompt = `${systemPrompt}\n\n${prompt}`;
  const result = spawnSync(
    cliPath,
    ['exec', '--model', model, '--reasoning-effort', reasoningEffort, '-p', fullPrompt],
    {
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024 * 10,
      env: { ...process.env, NO_COLOR: '1' },
    }
  );

  if (result.error) {
    throw new Error(`codex execution failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const stderr = result.stderr?.toString() || 'unknown error';
    throw new Error(`codex exited with code ${result.status}: ${stderr}`);
  }
  return result.stdout?.toString().trim() || '';
}

export async function factChatTextLocal({
  messages,
  model,
  maxTokens = 1800,
}: {
  messages: FactChatMessage[];
  model?: string;
  maxTokens?: number;
}): Promise<string> {
  const config = getLocalModelConfig();
  const prompt = messagesToPrompt(messages);
  const systemPrompt = buildSystemPrompt('text');
  const targetModel = model || config.model;

  try {
    if (config.provider === 'claude-code' || (config.provider === 'auto' && getClaudeCodePath())) {
      return await callClaudeCode(prompt, targetModel, config.timeoutMs || 120000, systemPrompt);
    }
    if (config.provider === 'codex' || (config.provider === 'auto' && getCodexPath())) {
      return await callCodex(
        prompt,
        targetModel,
        config.reasoningEffort || 'high',
        config.timeoutMs || 120000,
        systemPrompt
      );
    }
    throw new Error('No local model CLI available (claude-code or codex)');
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Local model text generation failed: ${error.message}`
        : 'Local model text generation failed',
    );
  }
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

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === opener) depth += 1;
    if (char === closer) depth -= 1;

    if (depth === 0) {
      return withoutFence.slice(start, index + 1);
    }
  }

  return withoutFence.slice(start);
}

export async function factChatJsonLocal<T>({
  messages,
  model,
  maxTokens = 1200,
}: {
  messages: FactChatMessage[];
  model?: string;
  maxTokens?: number;
}): Promise<T> {
  const text = await factChatTextLocal({ messages, model, maxTokens });
  const cleaned = extractJsonObject(text);
  try {
    return JSON.parse(cleaned) as T;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Local model JSON parsing failed: ${error.message}`
        : 'Local model JSON parsing failed',
    );
  }
}

export async function factChatFetchLocal(
  path: string,
  init: RequestInit = {}
): Promise<unknown> {
  const body = init.body ? JSON.parse(init.body as string) : {};
  const messages: FactChatMessage[] = body.messages || [];
  const model = body.model;
  const maxTokens = body.max_tokens;

  if (path === '/chat/completions/') {
    const text = await factChatTextLocal({ messages, model, maxTokens });
    return {
      choices: [{ message: { content: text } }],
      output_text: text,
    };
  }

  if (path === '/images/generate/') {
    throw new Error('Image generation not supported via local CLI models');
  }

  throw new Error(`Unsupported path: ${path}`);
}

export function getFactChatConfigLocal(): FactChatConfig {
  const config = getLocalModelConfig();
  return {
    apiKey: 'local-cli',
    baseUrl: 'local://cli',
    model: config.model,
    imageModel: 'unsupported',
    audioModel: 'unsupported',
  };
}

export function dataUrlToBase64(dataUrl: string): string {
  const index = dataUrl.indexOf(',');
  return index >= 0 ? dataUrl.slice(index + 1) : dataUrl;
}

export function resetLocalModelConfig(): void {
  cachedLocalConfig = null;
}