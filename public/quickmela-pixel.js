(function () {
  var QM_PIXEL_ENDPOINT = window.QM_PIXEL_ENDPOINT || 'http://localhost:5001/api/v1/pixel';

  function hasConsent() {
    if (typeof window.qmConsent !== 'undefined') return !!window.qmConsent;
    try {
      return localStorage.getItem('qm_consent') === 'true';
    } catch (_e) {
      return false;
    }
  }

  function uuidv4() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    var d = new Date().getTime();
    var d2 = (performance && performance.now && performance.now() * 1000) || 0;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16;
      if (d > 0) {
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function getVisitorId() {
    try {
      var key = 'qm_visitor_id';
      var existing = localStorage.getItem(key);
      if (existing) return existing;
      var id = uuidv4();
      localStorage.setItem(key, id);
      return id;
    } catch (_e) {
      return uuidv4();
    }
  }

  function buildBasePayload(eventName, metadata) {
    var now = new Date().toISOString();
    var searchParams = new URLSearchParams(window.location.search || '');
    var utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
      var v = searchParams.get(k);
      if (v) utm[k.replace('utm_', '')] = v;
    });

    return {
      pixel_id: window.QM_PIXEL_ID || 'quickmela_default',
      event: eventName,
      metadata: metadata || {},
      visitor_id: getVisitorId(),
      user_id: window.QM_USER_ID || null,
      utm: Object.keys(utm).length ? utm : undefined,
      ts: now
    };
  }

  function send(eventName, metadata) {
    if (!hasConsent()) {
      return;
    }

    var payload = buildBasePayload(eventName, metadata);

    try {
      fetch(QM_PIXEL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function () {
        // swallow network errors on pixel
      });
    } catch (_e) {
      // ignore
    }
  }

  var api = {
    track: function (eventName, metadata) {
      send(eventName, metadata || {});
    },
    pageView: function (metadata) {
      send('page_view', metadata || {});
    },
    setUser: function (userId) {
      window.QM_USER_ID = userId;
    },
    setConsent: function (value) {
      try {
        localStorage.setItem('qm_consent', value ? 'true' : 'false');
      } catch (_e) {}
      window.qmConsent = !!value;
    }
  };

  if (!window.qmPixel) {
    window.qmPixel = api;
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    api.pageView({ path: window.location.pathname, referrer: document.referrer || undefined });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      api.pageView({ path: window.location.pathname, referrer: document.referrer || undefined });
    });
  }
})();
