import type { AppProps } from 'next/app';
import { GuideProvider } from '@/contexts/GuideContext';
import { CockpitModeProvider } from '@/contexts/CockpitModeContext';
import { RepoConnectionProvider } from '@/contexts/RepoConnectionContext';
import { DevOps8RuntimeProvider } from '@/contexts/DevOps8RuntimeContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { EnterpriseSelectionProvider } from '@/contexts/EnterpriseSelectionContext';
import 'highlight.js/styles/github-dark.css';
import '@/styles/globals.css'; // keep whatever you already had
import '@/styles/cockpit-action-menu.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SupabaseAuthProvider>
      <EnterpriseSelectionProvider>
        <CockpitModeProvider>
          <RepoConnectionProvider>
            <DevOps8RuntimeProvider>
              <GuideProvider>
                <Component {...pageProps} />
              </GuideProvider>
            </DevOps8RuntimeProvider>
          </RepoConnectionProvider>
        </CockpitModeProvider>
      </EnterpriseSelectionProvider>
    </SupabaseAuthProvider>
  );
}
