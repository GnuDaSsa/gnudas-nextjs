import {
  FactChatMessage,
  FactChatConfig,
  factChatText as factChatTextRemote,
  factChatJson as factChatJsonRemote,
  factChatFetch as factChatFetchRemote,
  getFactChatConfig as getFactChatConfigRemote,
  dataUrlToBase64,
  resetClovaConfig,
} from './factchat-clova';

import {
  factChatText as factChatTextCurrent,
  factChatJson as factChatJsonCurrent,
  factChatFetch as factChatFetchCurrent,
  getFactChatConfig as getFactChatConfigCurrent,
} from './factchat-current-model';

export type { FactChatMessage, FactChatConfig };

const USE_CLOVA = process.env.USE_CLOVA === 'true';
const USE_CURRENT_MODEL = process.env.USE_CURRENT_MODEL === 'true';

export function getFactChatConfig(): FactChatConfig {
  if (USE_CURRENT_MODEL) {
    return getFactChatConfigCurrent();
  }
  return getFactChatConfigRemote();
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
  if (USE_CURRENT_MODEL) {
    return factChatTextCurrent({ messages, model, maxTokens });
  }
  return factChatTextRemote({ messages, model, maxTokens });
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
  if (USE_CURRENT_MODEL) {
    return factChatJsonCurrent<T>({ messages, model, maxTokens });
  }
  return factChatJsonRemote<T>({ messages, model, maxTokens });
}

export async function factChatFetch(
  path: string,
  init: RequestInit = {}
): Promise<unknown> {
  if (USE_CURRENT_MODEL) {
    return factChatFetchCurrent(path, init);
  }
  return factChatFetchRemote(path, init);
}

export { dataUrlToBase64 };

export { resetClovaConfig };