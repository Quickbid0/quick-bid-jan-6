import React from 'react';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, LAYOUT } from '../../config/designTokens';

interface FooterProps {
  columns?: {
    title?: string;
    items?: Array<{ label: string; href?: string; onClick?: () => void }>;
  }[];
  bottomContent?: React.ReactNode;
  variant?: 'default' | 'minimal' | 'comprehensive';
}

export const Footer: React.FC<FooterProps> = ({
  columns = [],
  bottomContent,
  variant = 'default',
}) => {
  const footerStyle: React.CSSProperties = {
    background: COLORS.gray[50],
    borderTop: `1px solid ${COLORS.gray[200]}`,
    marginTop: 'auto',
    paddingTop: SPACING[6],
    paddingBottom: SPACING[4],
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingLeft: SPACING[4],
    paddingRight: SPACING[4],
  };

  const contentStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns:
      variant === 'minimal'
        ? '1fr'
        : `repeat(auto-fit, minmax(200px, 1fr))`,
    gap: SPACING[6],
    marginBottom: bottomContent ? SPACING[4] : 0,
  };

  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING[2],
  };

  const columnTitleStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.gray[900],
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
  };

  const linkStyle: React.CSSProperties = {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray[600],
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  const dividerStyle: React.CSSProperties = {
    height: '1px',
    background: COLORS.gray[200],
    margin: `${SPACING[4]} 0`,
  };

  const bottomStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray[600],
    flexWrap: 'wrap',
    gap: SPACING[3],
  };

  if (variant === 'minimal') {
    return (
      <footer style={footerStyle} role="contentinfo">
        <div style={containerStyle}>
          {bottomContent && <div style={bottomStyle}>{bottomContent}</div>}
        </div>
      </footer>
    );
  }

  return (
    <footer style={footerStyle} role="contentinfo">
      <div style={containerStyle}>
        {columns.length > 0 && (
          <div style={contentStyle}>
            {columns.map((column, idx) => (
              <div key={idx} style={columnStyle}>
                {column.title && <h3 style={columnTitleStyle}>{column.title}</h3>}
                {column.items && (
                  <ul style={{ list: 'none', padding: 0, margin: 0 }}>
                    {column.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        {item.href ? (
                          <a href={item.href} style={linkStyle}>
                            {item.label}
                          </a>
                        ) : (
                          <button
                            onClick={item.onClick}
                            style={{
                              ...linkStyle,
                              background: 'none',
                              border: 'none',
                            }}
                          >
                            {item.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {bottomContent && (
          <>
            {columns.length > 0 && <div style={dividerStyle} />}
            <div style={bottomStyle}>{bottomContent}</div>
          </>
        )}
      </div>
    </footer>
  );
};
