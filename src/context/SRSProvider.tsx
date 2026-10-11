import type { ReactNode } from 'react';
import { useSRSStore } from '../hooks/useSRSStore';
import { SRSContext } from './SRSContext';

export function SRSProvider({ children }: { children: ReactNode }) {
  const store = useSRSStore();
  return <SRSContext.Provider value={store}>{children}</SRSContext.Provider>;
}
