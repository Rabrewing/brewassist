import type { AppProps } from 'next/app';
import { GuideProvider } from '@/contexts/GuideContext';
import '@/styles/globals.css'; // keep whatever you already had

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GuideProvider>
      <Component {...pageProps} />
    </GuideProvider>
  );
}
