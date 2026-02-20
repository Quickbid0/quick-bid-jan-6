import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS, LAYOUT } from '../../config/designTokens';

interface HeaderProps {
  logo?: React.ReactNode;
  title?: string;
  rightContent?: React.ReactNode;
  sticky?: boolean;
  variant?: 'default' | 'minimal' | 'premium';
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  title,
  rightContent,
  sticky = true,
  variant = 'default',
  onMenuToggle,
}) => {
  const headerStyle: React.CSSProperties = {
    background: COLORS.white,
    borderBottom: `1px solid ${COLORS.gray[200]}`,
    height: LAYOUT.headerHeight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: SPACING[4],
    paddingRight: SPACING[4],
    boxShadow: variant === 'premium' ? SHADOWS.sm : 'none',
    position: sticky ? 'sticky' : 'relative',
    top: sticky ? 0 : 'auto',
    zIndex: 200,
    transition: 'all 0.3s ease',
  };

  const leftContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING[3],
    flex: 1,
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING[2],
    textDecoration: 'none',
    color: 'inherit',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    margin: 0,
  };

  const menuButtonStyle: React.CSSProperties = {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '24px',
    color: COLORS.gray[700],
  };

  // Show menu button on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <header style={headerStyle} role="banner">
      <div style={leftContainerStyle}>
        {isMobile && onMenuToggle && (
          <button
            style={menuButtonStyle}
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            aria-expanded="false"
          >
            ☰
          </button>
        )}

        {logo && <div style={logoStyle}>{logo}</div>}

        {title && <h1 style={titleStyle}>{title}</h1>}
      </div>

      {rightContent && <div>{rightContent}</div>}
    </header>
  );
};
