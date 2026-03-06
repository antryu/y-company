'use client';

import Building from '@/components/Building';
import { LangProvider } from '@/context/LangContext';

export default function Home() {
  return (
    <LangProvider>
      <Building />
    </LangProvider>
  );
}
