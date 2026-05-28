'use client';

import { FormEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

type FactChatModel = {
  id: string;
  owned_by?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const MODEL_STORAGE = 'seongnam-ai-client-model';
const DEFAULT_BASE_URL = 'https://factchat-cloud.mindlogic.ai/v1/gateway';
const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful AI assistant for public-sector office work. Answer in Korean unless the user asks for another language. Be concise, accurate, and practical.';

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export default function SeongnamAiPage() {
  const baseUrl = DEFAULT_BASE_URL;
  const [models, setModels] = useState<FactChatModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Ready.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState('');
  const didAutoConnect = useRef(false);

  const connectAccount = useCallback(async () => {
    const nextBaseUrl = baseUrl.trim();
    if (!nextBaseUrl) {
      setNotice('Base URL is required.');
      return;
    }

    setIsLoadingModels(true);
    setNotice('');

    try {
      const modelData = await readResponse(
        await fetch('/api/factchat/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseUrl: nextBaseUrl }),
        }),
      );

      const nextModels = (modelData.data ?? []) as FactChatModel[];
      setModels(nextModels);

      const storedModel = window.localStorage.getItem(MODEL_STORAGE) || '';
      const modelExists = nextModels.some((model) => model.id === storedModel);
      const nextModel = modelExists ? storedModel : nextModels[0]?.id ?? '';

      setSelectedModel(nextModel);
      if (nextModel) window.localStorage.setItem(MODEL_STORAGE, nextModel);

      setIsConnected(true);
      setNotice('');
    } catch (error) {
      setIsConnected(false);
      setNotice(error instanceof Error ? error.message : 'Connection failed.');
    } finally {
      setIsLoadingModels(false);
    }
  }, [baseUrl]);

  useEffect(() => {
    if (didAutoConnect.current) return;
    didAutoConnect.current = true;
    void connectAccount();
  }, [connectAccount]);

  function selectModel(modelId: string) {
    setSelectedModel(modelId);
    window.localStorage.setItem(MODEL_STORAGE, modelId);
  }

  async function sendMessage(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const text = input.trim();
    if (!text || isSending) return;
    if (!selectedModel) {
      setNotice('Select a model before sending.');
      return;
    }

    const userMessage: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);
    setNotice('');

    try {
      const data = await readResponse(
        await fetch('/api/factchat/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baseUrl: baseUrl.trim(),
            model: selectedModel,
            systemPrompt: DEFAULT_SYSTEM_PROMPT,
            messages: nextMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          }),
        }),
      );

      const answer =
        data?.choices?.[0]?.message?.content ??
        data?.output_text ??
        'The response format could not be parsed.';

      setMessages((current) => [...current, { role: 'assistant', content: answer }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? `Request failed: ${error.message}`
              : 'Request failed. Please try again.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    void sendMessage();
  }

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Seongnam AI Gateway</p>
            <h1>
              <span>SN</span>
              <span>Service</span>
            </h1>
          </div>
        </div>

        <aside className={styles.heroSide}>
          <div className={styles.metric}>
            <span>Status</span>
            <strong>{isLoadingModels ? 'Connecting' : isConnected ? 'Online' : 'Ready'}</strong>
          </div>
          <div className={styles.metric}>
            <span>Models</span>
            <strong>{models.length || '-'}</strong>
          </div>
          <div className={styles.metric}>
            <span>Current</span>
            <strong>{selectedModel || 'None'}</strong>
          </div>
        </aside>
      </section>

      {notice && <div className={styles.notice}>{notice}</div>}

      <section className={styles.chatLayout}>
        <article className={styles.card}>
          <div className={styles.sectionHead}>
            <div>
              <span>Models</span>
              <h2>Model</h2>
            </div>
            <small>{models.length || '-'}</small>
          </div>

          <label className={styles.field}>
            <span>Selected model</span>
            <select
              value={selectedModel}
              onChange={(event) => selectModel(event.target.value)}
              disabled={!models.length}
            >
              {!models.length && <option value="">Loading models</option>}
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
            </select>
          </label>
          <button className={styles.ghostButton} type="button" onClick={connectAccount}>
            Refresh
          </button>
        </article>

        <article className={styles.chatCard}>
          <div className={styles.chatHeader}>
            <div>
              <span>Chat</span>
              <strong>{selectedModel || 'Model loading'}</strong>
            </div>
            <div className={styles.chatMeta}>
              <span>{messages.length}</span>
            </div>
          </div>

          <div className={styles.messageList}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`${styles.message} ${styles[message.role]}`}
              >
                <span>{message.role === 'assistant' ? 'AI' : 'You'}</span>
                <p>{message.content}</p>
              </div>
            ))}

            {isSending && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <span>AI</span>
                <div className={styles.loadingBubble}>
                  <i />
                  <p>Generating</p>
                </div>
              </div>
            )}
          </div>

          <form className={styles.composer} onSubmit={sendMessage}>
            <textarea
              value={input}
              placeholder="Ask anything."
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={4}
            />
            <div className={styles.composerActions}>
              <button
              className={styles.ghostButton}
              type="button"
              onClick={() => setMessages(messages.slice(0, 1))}
            >
                Reset
              </button>
              <button className={styles.primaryButton} type="submit" disabled={isSending}>
                Send
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}
