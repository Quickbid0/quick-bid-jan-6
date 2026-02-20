import React, { useState } from 'react';
import { COLORS, SPACING, LAYOUT, BREAKPOINTS, TRANSITIONS } from '../../config/designTokens';
import { Header } from './Header';
import { Footer } from './Footer';

interface SidebarLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'minimal';
  collapsible?: boolean;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  header,
  sidebar,
  footer,
  children,
  variant = 'default',
  collapsible = true,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: COLORS.gray[50],
  };

  const contentWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  };

  const sidebarStyle: React.CSSProperties = {
    width: sidebarOpen ? LAYOUT.sidebarWidth : LAYOUT.sidebarWidthCollapsed,
    background: COLORS.white,
    borderRight: `1px solid ${COLORS.gray[200]}`,
    overflowY: 'auto',
    transition: `width ${TRANSITIONS.base}`,
    position: 'relative',
    zIndex: 100,
  };

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  };

  const pageContentStyle: React.CSSProperties = {
    flex: 1,
    padding: SPACING[4],
    maxWidth: '100%',
  };

  // Mobile styles
  const isMobile = typeof window !== 'undefined' && parseInt(BREAKPOINTS.sm) > window.innerWidth;
  const isTablet = typeof window !== 'undefined' && parseInt(BREAKPOINTS.md) > window.innerWidth;

  if (isMobile) {
    return (
      <div style={mainContainerStyle}>
        {header}
        {sidebar && sidebarOpen && (
          <div
            style={{
              ...sidebarStyle,
              position: 'fixed',
              left: 0,
              top: LAYOUT.headerHeight,
              height: `calc(100vh - ${LAYOUT.headerHeight})`,
              zIndex: 200,
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {sidebar}
          </div>
        )}
        {sidebarOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 150,
            }}
            onClick={() => setSidebarOpen(false)}
            role="button"
            tabIndex={-1}
            aria-hidden="true"
          />
        )}
        <div style={mainContentStyle}>
          <div style={pageContentStyle}>{children}</div>
          {footer}
        </div>
      </div>
    );
  }

  return (
    <div style={mainContainerStyle}>
      {header}
      <div style={contentWrapperStyle}>
        {sidebar && <div style={sidebarStyle}>{sidebar}</div>}
        <div style={mainContentStyle}>
          <div style={pageContentStyle}>{children}</div>
          {footer}
        </div>
      </div>
    </div>
  );
};
