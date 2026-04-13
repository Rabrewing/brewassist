'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'brewassist.cookie-consent.v1';

export function CookieConsentBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setVisible(window.localStorage.getItem(COOKIE_KEY) !== 'accepted');
  }, []);

  if (!visible) return null;

  const accept = () => {
    window.localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  return (
    <div className="cookie-consent-bar" role="dialog" aria-live="polite">
      <div className="cookie-consent-copy">
        <strong>Cookies</strong>
        <span>
          BrewAssist uses essential cookies for session auth, preferences, and
          safety.
        </span>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-consent-btn" onClick={accept}>
          Accept
        </button>
        <Link className="cookie-consent-link" href="/privacy">
          Privacy
        </Link>
      </div>
    </div>
  );
}
