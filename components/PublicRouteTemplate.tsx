import React from 'react';
import Link from 'next/link';

import { PublicSiteLayout } from './PublicSiteLayout';

type RouteSection = {
  title: string;
  body: string;
  points?: string[];
};

type RouteLink = {
  href: string;
  label: string;
};

type PublicRouteTemplateProps = {
  activePath: string;
  kicker: string;
  title: string;
  lede: string;
  primaryCta?: RouteLink;
  secondaryCta?: RouteLink;
  sections: RouteSection[];
};

function renderCta(link: RouteLink, primary?: boolean) {
  const className = primary
    ? 'public-landing-button public-landing-button--primary'
    : 'public-landing-button';

  if (link.href.startsWith('mailto:') || link.href.startsWith('http')) {
    return (
      <a href={link.href} className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function PublicRouteTemplate({
  activePath,
  kicker,
  title,
  lede,
  primaryCta,
  secondaryCta,
  sections,
}: PublicRouteTemplateProps) {
  return (
    <PublicSiteLayout activePath={activePath}>
      <section className="public-site-panel public-site-panel--hero">
        <div className="public-site-hero-grid">
          <div className="public-site-copy">
            <div className="public-landing-kicker">{kicker}</div>
            <h1 className="public-site-title">{title}</h1>
            <p className="public-site-lede">{lede}</p>
            <div className="public-site-cta-row">
              {primaryCta ? renderCta(primaryCta, true) : null}
              {secondaryCta ? renderCta(secondaryCta) : null}
            </div>
          </div>

          <div className="public-site-hero-art">
            <div className="public-site-preview-card public-site-preview-card--route">
              <div className="public-site-preview-header">
                <span>{kicker}</span>
                <span>{sections.length} Panels</span>
              </div>
              <div className="public-site-preview-body">
                {sections.slice(0, 2).map((section) => (
                  <div key={section.title} className="public-site-preview-pane">
                    <strong>{section.title}</strong>
                    <div className="public-site-preview-lines">
                      <span>{section.body}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-site-card-grid">
        {sections.map((section) => (
          <article key={section.title} className="public-site-card">
            <strong>{section.title}</strong>
            <p>{section.body}</p>
            {section.points?.length ? (
              <div className="public-site-list">
                {section.points.map((point) => (
                  <div key={point} className="public-site-list-item">
                    {point}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </PublicSiteLayout>
  );
}
