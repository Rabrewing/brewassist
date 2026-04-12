import type { AppProps } from 'next/app';
import { GuideProvider } from '@/contexts/GuideContext';
import { CockpitModeProvider } from '@/contexts/CockpitModeContext';
import { RepoConnectionProvider } from '@/contexts/RepoConnectionContext';
import { DevOps8RuntimeProvider } from '@/contexts/DevOps8RuntimeContext';
import 'highlight.js/styles/github-dark.css';
import '@/styles/globals.css'; // keep whatever you already had
import '@/styles/cockpit-action-menu.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CockpitModeProvider>
      <RepoConnectionProvider>
        <DevOps8RuntimeProvider>
          <GuideProvider>
            <Component {...pageProps} />
          </GuideProvider>
        </DevOps8RuntimeProvider>
      </RepoConnectionProvider>
    </CockpitModeProvider>
  );
}
