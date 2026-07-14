import { useEffect } from 'react';
import { createRunSSE } from '../services/api.js';

export function useRunSSE(onNewRun) {
  useEffect(() => {
    const es = createRunSSE();
    es.addEventListener('run', e => onNewRun(JSON.parse(e.data)));
    return () => es.close();
  }, []);
}
