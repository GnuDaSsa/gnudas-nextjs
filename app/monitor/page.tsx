'use client';

import { useEffect, useState } from 'react';
import PixelOffice from '@/components/PixelOffice';

type LocalWork = {
  branch: string;
  changedCount: number;
  changedFiles: string[];
  updatedAt: string;
  agentPipeline: { name: string; model?: string; state: string; detail: string }[];
};

export default function MonitorPage() {
  const [localWork, setLocalWork] = useState<LocalWork | null>(null);

  useEffect(() => {
    let mounted = true;
    const tick = async () => {
      try {
        const res = await fetch('/api/local-work', { cache: 'no-store' });
        const data = await res.json();
        if (mounted) setLocalWork(data);
      } catch {
        // noop
      }
    };
    tick();
    const t = setInterval(tick, 2000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#070b18', color: '#e8efff', padding: 10 }}>
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#8fb2ff', marginBottom: 8 }}>
        OpenClaw Mini Monitor · {localWork?.branch || '...'} · changed {localWork?.changedCount ?? '-'}
      </div>
      <PixelOffice agents={localWork?.agentPipeline || []} compact />
    </main>
  );
}
