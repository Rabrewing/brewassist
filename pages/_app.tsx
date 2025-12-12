import type { AppProps } from 'next/app';
import { GuideProvider } from '@/contexts/GuideContext';
import { CockpitModeProvider } from '@/contexts/CockpitModeContext';
import '@/styles/globals.css'; // keep whatever you already had

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CockpitModeProvider>
      <GuideProvider>
        <Component {...pageProps} />
      </GuideProvider>
    </CockpitModeProvider>
  );
}
