'use client';

import { useEffect, useRef } from 'react';

interface CaptchaWidgetProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

/**
 * CAPTCHA Widget Component
 * Supports both Cloudflare Turnstile and hCaptcha
 * Provider is determined by environment variable
 */
export function CaptchaWidget({ onVerify, onError, onExpire }: CaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const provider = process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER || 'turnstile';
  const siteKey = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey) {
      console.warn('CAPTCHA site key not configured');
      return;
    }

    if (!containerRef.current) return;

    // Load the appropriate CAPTCHA script
    if (provider === 'turnstile') {
      loadTurnstile();
    } else if (provider === 'hcaptcha') {
      loadHCaptcha();
    }

    return () => {
      // Cleanup on unmount
      if (widgetIdRef.current) {
        if (provider === 'turnstile' && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
        } else if (provider === 'hcaptcha' && window.hcaptcha) {
          window.hcaptcha.remove(widgetIdRef.current);
        }
      }
    };
    // loadHCaptcha and loadTurnstile are intentionally excluded from dependencies as they're defined below
    // and would cause infinite loops if included. They only depend on provider and siteKey which are already tracked.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, siteKey]);

  /**
   * Load and render Cloudflare Turnstile
   */
  const loadTurnstile = () => {
    // Check if script is already loaded
    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    // Load script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => renderTurnstile();
    document.head.appendChild(script);
  };

  /**
   * Render Turnstile widget
   */
  const renderTurnstile = () => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerify(token),
      'error-callback': () => onError?.(),
      'expired-callback': () => onExpire?.(),
    });
  };

  /**
   * Load and render hCaptcha
   */
  const loadHCaptcha = () => {
    // Check if script is already loaded
    if (window.hcaptcha) {
      renderHCaptcha();
      return;
    }

    // Load script
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => renderHCaptcha();
    document.head.appendChild(script);
  };

  /**
   * Render hCaptcha widget
   */
  const renderHCaptcha = () => {
    if (!containerRef.current || !window.hcaptcha || !siteKey) return;

    widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
      sitekey: siteKey,
      callback: (token: string) => onVerify(token),
      'error-callback': () => onError?.(),
      'expired-callback': () => onExpire?.(),
    });
  };

  if (!siteKey) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        CAPTCHA not configured. Please set NEXT_PUBLIC_CAPTCHA_SITE_KEY environment variable.
      </div>
    );
  }

  return <div ref={containerRef} className="captcha-widget" />;
}

// TypeScript declarations for CAPTCHA libraries
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
    hcaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}
