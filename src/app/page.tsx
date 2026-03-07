'use client';

import { LangProvider } from '@/context/LangContext';
import { TowerView } from '@/components/TowerView';

export default function Home() {
  return (
    <LangProvider>
      <TowerView />
    </LangProvider>
  );
}
