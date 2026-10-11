import { createContext } from 'react';
import type { SRSStore } from '../hooks/useSRSStore';

export const SRSContext = createContext<SRSStore | null>(null);
