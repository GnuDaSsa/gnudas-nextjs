import { NextResponse } from 'next/server';
import { getFactChatConfig } from '@/lib/factchat';
const FACTCHAT_TIMEOUT_MS = 45_000;
const FACTCHAT_MAX_ATTEMPTS = 2;


export type FactChatConfig = {
  apiKey: string;
  baseUrl: string;
};

export function parseConfig(body: unknown): FactChatConfig {
  const input = body as Partial<FactChatConfig> | null;
  const fallback = getFactChatConfig();
  const apiKey = input?.apiKey?.trim() || fallback.apiKey;
  const baseUrl = (input?.baseUrl?.trim() || fallback.baseUrl).replace(/\/+$/, '');

  if (!apiKey) {
    throw new Error('FactChat API 키가 필요합니다.');
  }

  if (!baseUrl || !baseUrl.startsWith('https://')) {
    throw new Error('HTTPS Base URL이 필요합니다.');
  }

  return { apiKey, baseUrl };
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

function createTimeoutSignal(timeoutMs: number, upstreamSignal?: AbortSignal | null) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort();
    } else {
      upstreamSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  return { signal: controller.signal, clear: () => clearTimeout(timeoutId) };
}

export async function proxyJson(url: string, apiKey: string, init: RequestInit = {}) {
  let response: Response | null = null;
  let lastError: unknown;

  for (let attempt = 1; attempt <= FACTCHAT_MAX_ATTEMPTS; attempt += 1) {
    const timeout = createTimeoutSignal(FACTCHAT_TIMEOUT_MS, init.signal);

    try {
      response = await fetch(url, {
        ...init,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(init.headers ?? {}),
        },
        cache: 'no-store',
        signal: timeout.signal,
      });

      if (attempt < FACTCHAT_MAX_ATTEMPTS && isRetryableStatus(response.status)) {
        lastError = new Error(`FactChat 요청 실패 (${response.status})`);
        continue;
      }

      break;
    } catch (error) {
      lastError = error;
      if (attempt >= FACTCHAT_MAX_ATTEMPTS) break;
    } finally {
      timeout.clear();
    }
  }

  if (!response) {
    throw lastError instanceof Error
      ? new Error(`FactChat 요청 실패: ${lastError.message}`)
      : new Error('FactChat 요청에 실패했습니다.');
  }

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

    return NextResponse.json(
      { error: { code: 'FACTCHAT_ERROR', message, detail: data } },
      { status: response.status },
    );
  }

  return NextResponse.json(data);
}

export function apiError(error: unknown) {
  return NextResponse.json(
    {
      error: {
        code: 'BAD_REQUEST',
        message: error instanceof Error ? error.message : '요청을 처리할 수 없습니다.',
      },
    },
    { status: 400 },
  );
}
