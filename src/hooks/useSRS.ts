import { useContext } from 'react';
import { SRSContext } from '../context/SRSContext';
import type { SRSStore } from './useSRSStore';

export function useSRS(): SRSStore {
  const ctx = useContext(SRSContext);
  if (!ctx) throw new Error('useSRS must be used inside <SRSProvider>');
  return ctx;
}
