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

const MODEL_STORAGE = 'seongnam-ai-client-model-v2';
const PREFERRED_MODEL = 'gpt-5.5';
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
      content: '성남AI 게이트웨이에 연결할게요. 모델을 불러온 뒤 바로 질문할 수 있습니다.',
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
      const preferredModel = nextModels.find((model) => {
        const modelId = model.id.toLowerCase();
        return modelId === PREFERRED_MODEL || modelId.startsWith(`${PREFERRED_MODEL}-`);
      })?.id;
      const nextModel = modelExists ? storedModel : preferredModel ?? nextModels[0]?.id ?? '';

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

  const statusLabel = notice ? 'Setup needed' : isLoadingModels ? 'Connecting' : isConnected ? 'Online' : 'Ready';
  const modelLabel = selectedModel || 'No model selected';

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>Seongnam<br />AI Platform</h1>
        </div>

        <aside className={styles.statusPanel} aria-label="성남AI 연결 상태">
          <div className={styles.statusTopline}>
            <span className={`${styles.statusDot} ${isConnected ? styles.online : ''}`} />
            <span>{statusLabel}</span>
          </div>
          <div>
            <div className={styles.statusModel}>{modelLabel}</div>
            <p className={styles.statusHint}>
              {selectedModel
                ? '선택한 모델로 보고자료, 민원 문장, 내부 검토 초안을 바로 정리합니다.'
                : 'FactChat 모델을 불러오면 이 영역에서 현재 라우팅 상태를 확인할 수 있습니다.'}
            </p>
          </div>
          <div className={styles.statusGrid}>
            <div>
              <span>Models</span>
              <strong>{models.length || '-'}</strong>
            </div>
            <div>
              <span>Endpoint</span>
              <strong>FactChat</strong>
            </div>
          </div>
        </aside>
      </section>

      {notice && <div className={styles.notice}>{notice}</div>}

      <section className={styles.workspace}>
        <aside className={styles.controlPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span>Model routing</span>
              <h2>응답 모델</h2>
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
              {!models.length && (
                <option value="">{isLoadingModels ? 'Loading models' : 'No models available'}</option>
              )}
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.modelList}>
            {models.slice(0, 5).map((model) => (
              <button
                key={model.id}
                type="button"
                className={model.id === selectedModel ? styles.modelPillActive : styles.modelPill}
                onClick={() => selectModel(model.id)}
              >
                {model.id}
              </button>
            ))}
            {!models.length && (
              <p>
                {isLoadingModels
                  ? 'FactChat에서 모델 목록을 불러오는 중입니다.'
                  : '모델을 불러오지 못했습니다. API 키와 연결 상태를 확인하세요.'}
              </p>
            )}
          </div>

          <div className={styles.helperCard}>
            <span>System</span>
            <p>한국어 우선, 공공기관 실무 답변, 간결하고 검증 가능한 초안 중심.</p>
          </div>
        </aside>

        <article className={styles.chatCard}>
          <div className={styles.chatHeader}>
            <div>
              <span>Conversation</span>
              <strong>{selectedModel || '모델 연결 대기'}</strong>
            </div>
            <div className={styles.chatMeta}>
              <span>{messages.length} messages</span>
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
              id="seongnam-composer"
              value={input}
              placeholder="예: 시민 안내문을 더 친절하게 다듬어줘 / 회의 결과를 보도자료 초안으로 정리해줘"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={4}
            />
            <div className={styles.composerActions}>
              <span>Enter 전송 · Shift+Enter 줄바꿈</span>
              <div>
                <button
                  className={styles.ghostButton}
                  type="button"
                  onClick={() => setMessages(messages.slice(0, 1))}
                >
                  Reset
                </button>
                <button className={styles.primaryButton} type="submit" disabled={isSending || !selectedModel}>
                  Send
                </button>
              </div>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}
