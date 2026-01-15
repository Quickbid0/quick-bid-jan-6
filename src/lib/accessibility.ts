// Accessibility utilities and helpers

export interface AccessibilityConfig {
  enableScreenReaderSupport: boolean;
  enableKeyboardNavigation: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
  enableFocusManagement: boolean;
  enableAriaLabels: boolean;
}

class AccessibilityManager {
  private static instance: AccessibilityManager;
  private config: AccessibilityConfig;
  private focusableElements: string[] = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  static getInstance(): AccessibilityManager {
    if (!AccessibilityManager.instance) {
      AccessibilityManager.instance = new AccessibilityManager();
    }
    return AccessibilityManager.instance;
  }

  constructor() {
    this.config = {
      enableScreenReaderSupport: true,
      enableKeyboardNavigation: true,
      enableHighContrast: false,
      enableReducedMotion: false,
      enableFocusManagement: true,
      enableAriaLabels: true,
    };
  }

  // Initialize accessibility features
  init(): void {
    if (typeof window === 'undefined') return;

    this.detectUserPreferences();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupAriaLabels();
    this.announcePageChanges();
  }

  // Detect user accessibility preferences
  private detectUserPreferences(): void {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.config.enableReducedMotion = true;
      document.body.classList.add('reduced-motion');
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.config.enableHighContrast = true;
      document.body.classList.add('high-contrast');
    }

    // Check for screen reader
    if (window.matchMedia('(prefers-reduced-data: reduce)').matches) {
      this.config.enableScreenReaderSupport = true;
    }

    // Listen for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.config.enableReducedMotion = e.matches;
      document.body.classList.toggle('reduced-motion', e.matches);
    });

    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      this.config.enableHighContrast = e.matches;
      document.body.classList.toggle('high-contrast', e.matches);
    });
  }

  // Setup keyboard navigation
  private setupKeyboardNavigation(): void {
    if (!this.config.enableKeyboardNavigation) return;

    // Handle Tab navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Handle mouse usage
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });

    // Handle Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleEscapeKey(e);
      }
    });

    // Handle Enter and Space for interactive elements
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        this.handleActivationKey(e);
      }
    });
  }

  // Handle Escape key
  private handleEscapeKey(e: KeyboardEvent): void {
    // Close modals, dropdowns, etc.
    const activeElement = document.activeElement as HTMLElement;
    
    if (activeElement) {
      // Trigger custom escape event
      const escapeEvent = new CustomEvent('escape', { bubbles: true });
      activeElement.dispatchEvent(escapeEvent);
    }
  }

  // Handle activation keys (Enter, Space)
  private handleActivationKey(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    
    // Only handle for elements that aren't already handling these keys
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return;
    }

    if (target.tagName === 'BUTTON' || target.role === 'button' || target.getAttribute('tabindex') !== null) {
      if (e.key === ' ') {
        e.preventDefault();
        target.click();
      }
    }
  }

  // Setup focus management
  private setupFocusManagement(): void {
    if (!this.config.enableFocusManagement) return;

    // Trap focus within modals
    this.setupFocusTrap();
    
    // Manage focus for dynamic content
    this.setupDynamicFocus();
    
    // Skip links
    this.setupSkipLinks();
  }

  // Setup focus trap for modals
  private setupFocusTrap(): void {
    const modals = document.querySelectorAll('[role="dialog"], .modal');
    
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(this.focusableElements.join(', ')) as NodeListOf<HTMLElement>;
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        });
      }
    });
  }

  // Setup dynamic focus management
  private setupDynamicFocus(): void {
    // Observe DOM changes for new focusable elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Add appropriate ARIA attributes
            this.addAriaAttributes(element);
            
            // Setup keyboard events for new interactive elements
            this.setupInteractiveElement(element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Setup skip links
  private setupSkipLinks(): void {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.setAttribute('aria-label', 'Skip to main content');
    
    // Add styles for skip link
    const style = document.createElement('style');
    style.textContent = `
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.2s;
      }
      .skip-link:focus {
        top: 6px;
      }
    `;
    
    document.head.appendChild(style);
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Setup screen reader support
  private setupScreenReaderSupport(): void {
    if (!this.config.enableScreenReaderSupport) return;

    // Add live regions for dynamic content
    this.setupLiveRegions();
    
    // Announce page changes
    this.setupPageAnnouncements();
    
    // Handle form validation announcements
    this.setupFormValidationAnnouncements();
  }

  // Setup live regions
  private setupLiveRegions(): void {
    // Create status live region
    const statusRegion = document.createElement('div');
    statusRegion.setAttribute('aria-live', 'polite');
    statusRegion.setAttribute('aria-atomic', 'true');
    statusRegion.className = 'sr-only live-region-status';
    statusRegion.setAttribute('data-live-region', 'status');
    document.body.appendChild(statusRegion);

    // Create alert live region
    const alertRegion = document.createElement('div');
    alertRegion.setAttribute('aria-live', 'assertive');
    alertRegion.setAttribute('aria-atomic', 'true');
    alertRegion.className = 'sr-only live-region-alert';
    alertRegion.setAttribute('data-live-region', 'alert');
    document.body.appendChild(alertRegion);

    // Add styles for screen reader only content
    const style = document.createElement('style');
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // Setup page announcements
  private setupPageAnnouncements(): void {
    // Announce page title changes
    let lastTitle = document.title;
    
    const titleObserver = new MutationObserver(() => {
      if (document.title !== lastTitle) {
        this.announceToScreenReader(`Page changed to: ${document.title}`, 'polite');
        lastTitle = document.title;
      }
    });

    titleObserver.observe(document.querySelector('title')!, {
      childList: true,
    });

    // Announce route changes (for SPA)
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        this.announceToScreenReader(`Navigated to: ${document.title}`, 'polite');
      }, 100);
    });
  }

  // Setup form validation announcements
  private setupFormValidationAnnouncements(): void {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const invalidElements = form.querySelectorAll(':invalid') as NodeListOf<HTMLInputElement>;
        
        if (invalidElements.length > 0) {
          e.preventDefault();
          
          const firstInvalid = invalidElements[0];
          firstInvalid.focus();
          
          const errors = Array.from(invalidElements).map(el => 
            `${el.labels?.[0]?.textContent || el.name}: ${el.validationMessage}`
          ).join(', ');
          
          this.announceToScreenReader(`Form has errors: ${errors}`, 'assertive');
        }
      });
    });
  }

  // Setup ARIA labels
  private setupAriaLabels(): void {
    if (!this.config.enableAriaLabels) return;

    // Add ARIA labels to common elements
    this.addAriaLabelsToElements();
    
    // Setup landmark roles
    this.setupLandmarkRoles();
    
    // Setup descriptive labels
    this.setupDescriptiveLabels();
  }

  // Add ARIA labels to elements
  private addAriaLabelsToElements(): void {
    // Add labels to buttons without text
    const iconButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    iconButtons.forEach(button => {
      const icon = button.querySelector('svg, i');
      if (icon && !button.textContent.trim()) {
        // Try to infer meaning from icon classes
        const className = icon.className;
        let label = 'Button';
        
        if (className.includes('close') || className.includes('x')) {
          label = 'Close';
        } else if (className.includes('menu') || className.includes('hamburger')) {
          label = 'Menu';
        } else if (className.includes('search') || className.includes('magnifying')) {
          label = 'Search';
        } else if (className.includes('cart') || className.includes('shopping')) {
          label = 'Shopping cart';
        } else if (className.includes('user') || className.includes('person')) {
          label = 'User account';
        } else if (className.includes('heart') || className.includes('favorite')) {
          label = 'Favorite';
        } else if (className.includes('edit') || className.includes('pencil')) {
          label = 'Edit';
        } else if (className.includes('delete') || className.includes('trash')) {
          label = 'Delete';
        }
        
        button.setAttribute('aria-label', label);
      }
    });

    // Add labels to images without alt text
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      img.setAttribute('alt', ''); // Decorative image
      img.setAttribute('role', 'presentation');
    });
  }

  // Setup landmark roles
  private setupLandmarkRoles(): void {
    // Add role="main" to main content area
    const mainContent = document.querySelector('main, #main, [role="main"]');
    if (!mainContent) {
      const firstSection = document.querySelector('section, .section');
      if (firstSection) {
        firstSection.setAttribute('role', 'main');
        firstSection.id = 'main-content';
      }
    }

    // Add role="navigation" to nav elements
    const navs = document.querySelectorAll('nav:not([role])');
    navs.forEach(nav => {
      nav.setAttribute('role', 'navigation');
    });

    // Add role="banner" to header
    const header = document.querySelector('header:not([role])');
    if (header) {
      header.setAttribute('role', 'banner');
    }

    // Add role="contentinfo" to footer
    const footer = document.querySelector('footer:not([role])');
    if (footer) {
      footer.setAttribute('role', 'contentinfo');
    }

    // Add role="search" to search forms
    const searchForms = document.querySelectorAll('form[action*="search"]:not([role])');
    searchForms.forEach(form => {
      form.setAttribute('role', 'search');
    });
  }

  // Setup descriptive labels
  private setupDescriptiveLabels(): void {
    // Add descriptions to form fields
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const element = input as HTMLElement;
      
      // Add aria-describedby if there's help text
      const helpText = element.parentElement?.querySelector('.help-text, .description, .hint');
      if (helpText && !element.getAttribute('aria-describedby')) {
        const helpId = `help-${element.id || Math.random().toString(36).substr(2, 9)}`;
        helpText.id = helpId;
        element.setAttribute('aria-describedby', helpId);
      }
      
      // Add required indicator
      if (element.hasAttribute('required') && !element.getAttribute('aria-required')) {
        element.setAttribute('aria-required', 'true');
      }
    });

    // Add labels to progress bars
    const progressBars = document.querySelectorAll('.progress, [role="progressbar"]');
    progressBars.forEach(progress => {
      if (!progress.getAttribute('aria-label') && !progress.getAttribute('aria-labelledby')) {
        progress.setAttribute('aria-label', 'Progress');
      }
    });
  }

  // Add ARIA attributes to element
  private addAriaAttributes(element: Element): void {
    // Add appropriate ARIA attributes based on role and content
    const role = element.getAttribute('role');
    const tagName = element.tagName.toLowerCase();
    
    switch (role) {
      case 'button':
        if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby') && !element.textContent.trim()) {
          element.setAttribute('aria-label', 'Button');
        }
        break;
        
      case 'link':
        if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
          const text = element.textContent.trim();
          if (text) {
            element.setAttribute('aria-label', text);
          }
        }
        break;
        
      case 'img':
        if (!element.hasAttribute('alt')) {
          element.setAttribute('alt', '');
          element.setAttribute('role', 'presentation');
        }
        break;
    }
    
    // Handle specific tag types
    switch (tagName) {
      case 'button':
        if (!role && !element.hasAttribute('type')) {
          element.setAttribute('type', 'button');
        }
        break;
        
      case 'input': {
        const input = element as HTMLInputElement;
        if (input.type === 'checkbox' || input.type === 'radio') {
          if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            if (label) {
              label.setAttribute('id', `label-${input.id}`);
              element.setAttribute('aria-labelledby', `label-${input.id}`);
            }
          }
        }
        break;
      }
    }
  }

  // Setup interactive element
  private setupInteractiveElement(element: Element): void {
    if (element.getAttribute('role') === 'button' || element.tagName === 'BUTTON') {
      element.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (element as HTMLElement).click();
        }
      });
    }
  }

  // Announce page changes
  private announcePageChanges(): void {
    // Monitor for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if important content was added
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Announce new messages, alerts, or important content
              if (element.classList.contains('message') || 
                  element.classList.contains('alert') || 
                  element.classList.contains('notification')) {
                const text = element.textContent.trim();
                if (text) {
                  this.announceToScreenReader(text, 'polite');
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // Announce to screen reader
  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = document.querySelector(`[data-live-region="${priority === 'assertive' ? 'alert' : 'status'}"]`) as HTMLElement;
    
    if (region) {
      region.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  // Get focusable elements within a container
  getFocusableElements(container: Element): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableElements.join(', '))) as HTMLElement[];
  }

  // Set focus to first focusable element
  focusFirstElement(container: Element): boolean {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
      return true;
    }
    return false;
  }

  // Check if element is focusable
  isFocusable(element: Element): boolean {
    return this.focusableElements.some(selector => element.matches(selector));
  }

  // Update configuration
  updateConfig(config: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Apply configuration changes
    document.body.classList.toggle('high-contrast', this.config.enableHighContrast);
    document.body.classList.toggle('reduced-motion', this.config.enableReducedMotion);
  }

  // Get current configuration
  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }
}

// Singleton instance
export const accessibilityManager = AccessibilityManager.getInstance();

// React hook for accessibility
export const useAccessibility = () => {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityManager.announceToScreenReader(message, priority);
  };

  const focusFirst = (container: Element | null) => {
    if (container) {
      return accessibilityManager.focusFirstElement(container);
    }
    return false;
  };

  const getFocusableElements = (container: Element) => {
    return accessibilityManager.getFocusableElements(container);
  };

  return {
    announce,
    focusFirst,
    getFocusableElements,
  };
};

// Utility functions
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getAriaLabel = (element: Element): string | null => {
  return element.getAttribute('aria-label') || 
         element.getAttribute('aria-labelledby') || 
         element.getAttribute('title') || 
         element.textContent?.trim() || null;
};

export const setAriaLabel = (element: Element, label: string): void => {
  element.setAttribute('aria-label', label);
};

export const addAriaDescribedBy = (element: Element, descriptionId: string): void => {
  const existing = element.getAttribute('aria-describedby');
  if (existing) {
    element.setAttribute('aria-describedby', `${existing} ${descriptionId}`);
  } else {
    element.setAttribute('aria-describedby', descriptionId);
  }
};

// Initialize accessibility on module load
if (typeof window !== 'undefined') {
  accessibilityManager.init();
}
