export interface CtaEventPayload {
  action: string;
  category?: string;
  label?: string;
  metadata?: Record<string, any>;
  page?: string;
}

const safeLog = (payload: CtaEventPayload) => {
  if (process.env.NODE_ENV === 'test') return;
  const meta = payload.metadata || {};

  if (typeof window !== 'undefined') {
    const gtag = (window as any).gtag;
    if (typeof gtag === 'function') {
      gtag('event', payload.action, {
        event_category: payload.category || 'growth-cta',
        event_label: payload.label,
        page: payload.page,
        ...meta,
      });
    }

    const amplitude = (window as any).amplitude;
    const amplitudeClient = amplitude?.getInstance ? amplitude.getInstance() : amplitude;
    if (amplitudeClient?.logEvent) {
      amplitudeClient.logEvent(payload.action, {
        category: payload.category || 'growth-cta',
        label: payload.label,
        page: payload.page,
        ...meta,
      });
    }

    const dataLayer = (window as any).dataLayer;
    if (Array.isArray(dataLayer)) {
      dataLayer.push({
        event: payload.action,
        category: payload.category || 'growth-cta',
        label: payload.label,
        page: payload.page,
        ...meta,
      });
    }
  }
};

export const trackCtaEvent = (payload: CtaEventPayload) => {
  try {
    safeLog(payload);
  } catch (error) {
    console.debug('CTA analytics suppressed', error);
  }
};
