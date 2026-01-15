import { useEffect } from 'react';

interface UsePageSEOOptions {
  title: string;
  description?: string;
  /** Optional path portion of the canonical URL, e.g. "/legal/terms-and-conditions" */
  canonicalPath?: string;
  /** Robots directive, defaults to "index,follow" when provided */
  robots?: string;
}

export function usePageSEO({ title, description, canonicalPath, robots }: UsePageSEOOptions) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    // Meta: description
    let descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    const prevDescription = descriptionMeta.getAttribute('content') || '';
    if (description) {
      descriptionMeta.setAttribute('content', description);
    }

    // Link: canonical
    const prevCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    let canonicalLink = prevCanonical;
    const origin = window.location.origin;
    const canonicalHref = canonicalPath ? `${origin}${canonicalPath}` : undefined;
    if (canonicalHref) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalHref);
    }

    // Meta: robots
    const robotsValue = robots || (canonicalPath ? 'index,follow' : undefined);
    let robotsMeta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prevRobots = robotsMeta?.getAttribute('content') || '';
    if (robotsValue) {
      if (!robotsMeta) {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute('content', robotsValue);
    }

    return () => {
      document.title = prevTitle;
      if (description) {
        descriptionMeta?.setAttribute('content', prevDescription);
      }
      if (canonicalHref && canonicalLink && !prevCanonical) {
        // Remove canonical we added if there wasn't one before
        document.head.removeChild(canonicalLink);
      } else if (canonicalHref && canonicalLink && prevCanonical) {
        // Restore previous canonical href
        prevCanonical.setAttribute('href', prevCanonical.getAttribute('href') || '');
      }
      if (robotsValue && robotsMeta) {
        if (prevRobots) {
          robotsMeta.setAttribute('content', prevRobots);
        } else {
          document.head.removeChild(robotsMeta);
        }
      }
    };
  }, [title, description, canonicalPath, robots]);
}
