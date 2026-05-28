import { NextResponse } from 'next/server';
import { getFactChatConfig } from '@/lib/factchat';

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

export async function proxyJson(url: string, apiKey: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

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
