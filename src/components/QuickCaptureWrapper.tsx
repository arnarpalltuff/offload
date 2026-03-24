'use client';

import QuickCaptureBar from './QuickCaptureBar';
import { DEMO_MODE } from '@/lib/demo-client';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useToast } from '@/components/Toast';
import type { QuickCapture } from '@/lib/types';

export default function QuickCaptureWrapper() {
  const [captures, setCaptures] = useLocalStorage<QuickCapture[]>('offload_captures', []);
  const { toast } = useToast();

  function handleCapture(text: string) {
    if (DEMO_MODE) {
      const newCapture: QuickCapture = {
        id: `c_${Date.now()}`,
        text,
        category: 'must_do',
        created_at: new Date().toISOString(),
      };
      setCaptures((prev) => [...prev, newCapture]);
      toast('Thought captured', 'success');
      return;
    }

    fetch('/api/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then((res) => {
        if (res.ok) {
          toast('Thought captured', 'success');
        } else {
          toast('Failed to save capture. Please try again.', 'error');
        }
      })
      .catch(() => {
        toast('Failed to save capture. Check your connection.', 'error');
      });
  }

  return <QuickCaptureBar onCapture={handleCapture} />;
}
