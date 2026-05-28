'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

type FactChatModel = {
  id: string;
  owned_by?: string;
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Template = {
  id: string;
  label: string;
  description: string;
  prompt: string;
  tone: string;
};

const KEY_STORAGE = 'seongnam-ai-client-key';
const BASE_URL_STORAGE = 'seongnam-ai-client-base-url';
const MODEL_STORAGE = 'seongnam-ai-client-model';
const DEFAULT_BASE_URL = 'https://factchat-cloud.mindlogic.ai/v1/gateway';

const templates: Template[] = [
  {
    id: 'general',
    label: '일반 질의',
    description: '빠른 답변과 핵심 정리',
    tone: 'neutral',
    prompt: '핵심부터 간결하게 답변하고, 필요한 경우 항목으로 정리하세요.',
  },
  {
    id: 'civil',
    label: '민원답변',
    description: '문자 회신 초안',
    tone: 'green',
    prompt:
      "성남시 담당 부서의 민원 문자 답변 초안으로 작성하세요. '안녕하십니까?'로 시작하고 문의 내용을 이해한 문장을 포함하며, 마지막에는 추가 문의 안내와 감사 인사를 포함하세요.",
  },
  {
    id: 'document',
    label: '공문 문장',
    description: '행정 문체 다듬기',
    tone: 'blue',
    prompt:
      '입력한 문장을 공문서에 맞는 명확하고 정중한 행정 문체로 다듬으세요. 의미는 바꾸지 말고 표현을 정리하세요.',
  },
  {
    id: 'table',
    label: '엑셀 분석',
    description: '표 내용 요약',
    tone: 'amber',
    prompt:
      '붙여넣은 표나 엑셀 내용을 읽고 주요 사실, 이상치, 처리해야 할 항목, 추천 답변을 구분해서 정리하세요.',
  },
];

function maskKey(key: string) {
  if (!key) return '';
  if (key.length <= 8) return '*'.repeat(key.length);
  return `${key.slice(0, 4)}${'*'.repeat(Math.max(8, key.length - 8))}${key.slice(-4)}`;
}

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || data?.message || `요청 실패 (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export default function SeongnamAiPage() {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [models, setModels] = useState<FactChatModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [activeTemplate, setActiveTemplate] = useState(templates[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '성남시 AI API 키를 등록하면 모델 목록과 크레딧을 확인하고 바로 대화를 시작할 수 있습니다.',
    },
  ]);
  const [input, setInput] = useState('');
  const [credits, setCredits] = useState<Record<string, unknown> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const savedKey = window.localStorage.getItem(KEY_STORAGE) ?? '';
    const savedBaseUrl = window.localStorage.getItem(BASE_URL_STORAGE) ?? DEFAULT_BASE_URL;
    const savedModel = window.localStorage.getItem(MODEL_STORAGE) ?? '';

    setApiKey(savedKey);
    setBaseUrl(savedBaseUrl);
    setSelectedModel(savedModel);
  }, []);

  const canUseApi = apiKey.trim().length > 0 && baseUrl.trim().length > 0;

  const creditSummary = useMemo(() => {
    if (!credits) return null;

    return Object.entries(credits)
      .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
      .slice(0, 4);
  }, [credits]);

  async function connectAccount() {
    if (!canUseApi) {
      setNotice('API 키와 Base URL을 입력하세요.');
      return;
    }

    setIsLoadingModels(true);
    setNotice('');

    try {
      const modelData = await readResponse(
        await fetch('/api/factchat/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: apiKey.trim(), baseUrl: baseUrl.trim() }),
        }),
      );

      const nextModels = (modelData.data ?? []) as FactChatModel[];
      setModels(nextModels);

      const storedModel = selectedModel || window.localStorage.getItem(MODEL_STORAGE) || '';
      const modelExists = nextModels.some((model) => model.id === storedModel);
      const nextModel = modelExists ? storedModel : nextModels[0]?.id ?? '';
      setSelectedModel(nextModel);

      window.localStorage.setItem(KEY_STORAGE, apiKey.trim());
      window.localStorage.setItem(BASE_URL_STORAGE, baseUrl.trim());
      if (nextModel) window.localStorage.setItem(MODEL_STORAGE, nextModel);

      setIsConnected(true);
      setNotice(`연결 완료: ${nextModels.length}개 모델을 사용할 수 있습니다.`);

      void loadCredits(apiKey.trim(), baseUrl.trim());
    } catch (error) {
      setIsConnected(false);
      setNotice(error instanceof Error ? error.message : '연결에 실패했습니다.');
    } finally {
      setIsLoadingModels(false);
    }
  }

  async function loadCredits(nextKey = apiKey.trim(), nextBaseUrl = baseUrl.trim()) {
    if (!nextKey || !nextBaseUrl) return;

    try {
      const data = await readResponse(
        await fetch('/api/factchat/credits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey: nextKey, baseUrl: nextBaseUrl }),
        }),
      );
      setCredits(data);
    } catch {
      setCredits(null);
    }
  }

  function forgetKey() {
    window.localStorage.removeItem(KEY_STORAGE);
    setApiKey('');
    setIsConnected(false);
    setModels([]);
    setCredits(null);
    setNotice('저장된 API 키를 삭제했습니다.');
  }

  function selectModel(modelId: string) {
    setSelectedModel(modelId);
    window.localStorage.setItem(MODEL_STORAGE, modelId);
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = input.trim();
    if (!text) return;
    if (!canUseApi || !selectedModel) {
      setNotice('API 키 연결과 모델 선택이 필요합니다.');
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
            apiKey: apiKey.trim(),
            baseUrl: baseUrl.trim(),
            model: selectedModel,
            systemPrompt: activeTemplate.prompt,
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
        '응답 형식을 해석하지 못했습니다.';

      setMessages((current) => [...current, { role: 'assistant', content: answer }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? `요청 중 오류가 발생했습니다: ${error.message}`
              : '요청 중 오류가 발생했습니다.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Seongnam AI Gateway</p>
            <h1>내 API 키로 쓰는 모바일 AI 업무비서</h1>
            <p className={styles.heroCopy}>
              성남시 AI API 키를 등록하고, 본인 크레딧으로 32개 이상 AI 모델을 호출하는
              BYOK 방식의 내부용 AI 클라이언트입니다. 키는 브라우저에 저장되며 요청은
              서버 라우트를 통해 중계됩니다.
            </p>
            <div className={styles.heroActions}>
              <button className={styles.primaryButton} type="button" onClick={connectAccount}>
                {isLoadingModels ? '연결 중' : 'API 연결'}
              </button>
              <button className={styles.ghostButton} type="button" onClick={() => loadCredits()}>
                크레딧 조회
              </button>
            </div>
          </div>
        </div>

        <aside className={styles.heroSide}>
          <div className={styles.metric}>
            <span>Connection</span>
            <strong>{isConnected ? 'Online' : 'Ready'}</strong>
          </div>
          <div className={styles.metric}>
            <span>Models</span>
            <strong>{models.length || 'API 연결 후'}</strong>
          </div>
          <div className={styles.metric}>
            <span>Mode</span>
            <strong>{activeTemplate.label}</strong>
          </div>
        </aside>
      </section>

      {notice && <div className={styles.notice}>{notice}</div>}

      <section className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.sectionHead}>
            <div>
              <span>01 Vault</span>
              <h2>개인 API 키 등록</h2>
            </div>
            <small>{apiKey ? maskKey(apiKey) : '키 미등록'}</small>
          </div>

          <label className={styles.field}>
            <span>FactChat API Key</span>
            <input
              type="password"
              value={apiKey}
              placeholder="본인에게 발급된 성남 AI API 키"
              onChange={(event) => setApiKey(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Base URL</span>
            <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
          </label>

          <div className={styles.buttonRow}>
            <button className={styles.primaryButton} type="button" onClick={connectAccount}>
              모델 불러오기
            </button>
            <button className={styles.textButton} type="button" onClick={forgetKey}>
              키 삭제
            </button>
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.sectionHead}>
            <div>
              <span>02 Model</span>
              <h2>모델 선택</h2>
            </div>
            <small>{models.length ? `${models.length}개 모델` : '대기 중'}</small>
          </div>

          <label className={styles.field}>
            <span>현재 모델</span>
            <select
              value={selectedModel}
              onChange={(event) => selectModel(event.target.value)}
              disabled={!models.length}
            >
              {!models.length && <option value="">API 연결 후 선택</option>}
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.modelPills}>
            {models.slice(0, 8).map((model) => (
              <button
                key={model.id}
                type="button"
                className={model.id === selectedModel ? styles.active : ''}
                onClick={() => selectModel(model.id)}
              >
                {model.id}
              </button>
            ))}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.sectionHead}>
            <div>
              <span>03 Credits</span>
              <h2>크레딧 상태</h2>
            </div>
            <small>실시간 조회</small>
          </div>

          {creditSummary?.length ? (
            <div className={styles.creditGrid}>
              {creditSummary.map(([key, value]) => (
                <div key={key}>
                  <span>{key}</span>
                  <strong>{String(value)}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.mutedCopy}>API 연결 후 크레딧 잔액을 조회합니다.</p>
          )}
        </article>
      </section>

      <section className={styles.chatLayout}>
        <article className={styles.card}>
          <div className={styles.sectionHead}>
            <div>
              <span>04 Template</span>
              <h2>업무 템플릿</h2>
            </div>
          </div>

          <div className={styles.templateList}>
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`${styles.templateButton} ${styles[template.tone]} ${
                  activeTemplate.id === template.id ? styles.active : ''
                }`}
                onClick={() => setActiveTemplate(template)}
              >
                <strong>{template.label}</strong>
                <span>{template.description}</span>
              </button>
            ))}
          </div>

          <div className={styles.promptPreview}>
            <span>시스템 지시</span>
            <p>{activeTemplate.prompt}</p>
          </div>
        </article>

        <article className={styles.chatCard}>
          <div className={styles.chatHeader}>
            <div>
              <span>Selected</span>
              <strong>{selectedModel || '모델 미선택'}</strong>
            </div>
            <div className={styles.chatMeta}>
              <span>{activeTemplate.label}</span>
              <span>{messages.length} messages</span>
            </div>
          </div>

          <div className={styles.messageList}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`${styles.message} ${styles[message.role]}`}
              >
                <span>{message.role === 'assistant' ? 'AI' : '나'}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {isSending && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <span>AI</span>
                <p>응답을 생성하고 있습니다.</p>
              </div>
            )}
          </div>

          <form className={styles.composer} onSubmit={sendMessage}>
            <textarea
              value={input}
              placeholder="질문, 민원 내용, 공문 문장, 엑셀 표 내용을 붙여넣으세요."
              onChange={(event) => setInput(event.target.value)}
              rows={4}
            />
            <div className={styles.composerActions}>
              <button
                className={styles.ghostButton}
                type="button"
                onClick={() => setMessages(messages.slice(0, 1))}
              >
                대화 초기화
              </button>
              <button className={styles.primaryButton} type="submit" disabled={isSending}>
                {isSending ? '전송 중' : '보내기'}
              </button>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
}
