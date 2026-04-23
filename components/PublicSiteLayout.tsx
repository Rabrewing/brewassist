import React from 'react';
import Link from 'next/link';

type PublicSiteLayoutProps = {
  children: React.ReactNode;
  activePath?: string;
};

const PRIMARY_NAV = [
  { href: '/product', label: 'Product' },
  { href: '/brew-agentic', label: 'Brew Agentic' },
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/security', label: 'Security' },
  { href: '/docs', label: 'Docs' },
];

const FOOTER_NAV = [
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/ai-transparency', label: 'AI Transparency' },
  { href: '/support', label: 'Support' },
  { href: '/docs#api', label: 'API' },
  { href: '/status', label: 'Status' },
];

function getLinkClass(href: string, activePath?: string) {
  return href === activePath
    ? 'public-site-nav-link is-active'
    : 'public-site-nav-link';
}

export function PublicSiteLayout({
  children,
  activePath,
}: PublicSiteLayoutProps) {
  return (
    <div className="public-landing-shell public-site-shell">
      <section className="public-site-nav">
        <Link href="/" className="public-site-wordmark">
          BrewAssist
        </Link>
        <div className="public-site-nav-links">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={getLinkClass(item.href, activePath)}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="public-site-nav-auth">
          <Link href="/login" className="public-landing-button">
            Login
          </Link>
          <Link
            href="/start-free"
            className="public-landing-button public-landing-button--primary"
          >
            Start Free
          </Link>
        </div>
      </section>

      {children}

      <section className="public-site-footer">
        <div>
          <Link href="/" className="public-site-wordmark">
            BrewAssist
          </Link>
          <p className="public-site-support-copy">
            Hosted DevOps control plane for browser workflows, with Brew
            Agentic as the local runtime companion.
          </p>
        </div>
        <div className="public-site-inline-links">
          {FOOTER_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
