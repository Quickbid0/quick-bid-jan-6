import * as React from 'react';
import { colors, spacing, typography } from '@/design-system';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface StatusStripProps {
  phoneVerified: boolean;
  kycVerified: boolean;
  tokenActive: boolean;
  depositPaid: boolean;
  walletBalance: number | null;
  requiredDeposit: number;
  yardRequiresToken?: boolean;
  onVerifyPhone?: () => void;
  onVerifyKyc?: () => void;
  onBuyToken?: () => void;
  onPayDeposit?: () => void;
  onTopUp?: () => void;
  compact?: boolean;
  showWallet?: boolean;
}

const getBadgeVariant = (passed: boolean) => (passed ? 'success' : 'warning');

export const StatusStrip = React.forwardRef<HTMLDivElement, StatusStripProps>((props, ref) => {
  const {
    phoneVerified,
    kycVerified,
    tokenActive,
    depositPaid,
    walletBalance,
    requiredDeposit,
    yardRequiresToken = true,
    onVerifyPhone,
    onVerifyKyc,
    onBuyToken,
    onPayDeposit,
    onTopUp,
    compact = false,
    showWallet = true,
    ...rest
  } = props;

  const paddingSize = compact ? 'sm' : 'md';
  const rowGap = compact ? spacing.sm : spacing.md;
  const textSize = compact ? typography.caption.fontSize : typography.body.fontSize;
  const walletLabel = walletBalance === null ? 'Sign in to view' : `₹${walletBalance.toLocaleString()}`;
  const remainingDeposit = Math.max(requiredDeposit - (walletBalance ?? 0), 0);
  const needsDeposit = !depositPaid;
  const depositStatusText = depositPaid
    ? 'Security deposit secured'
    : `₹${requiredDeposit.toLocaleString()} required • ₹${remainingDeposit.toLocaleString()} remaining`;

  const badgeClasses = `text-[${textSize}px]`;
  const rowClasses = `flex flex-wrap items-center justify-between gap-[${rowGap}px]`;
  const labelClasses = `text-[${textSize}px] font-semibold text-[${colors.muted}]`;

  return (
    <Card ref={ref} padding={paddingSize} variant="surface" className="w-full" {...rest}>
      <div className={`flex flex-col gap-[${rowGap}px]`}> 
        <div className={rowClasses} role="status" aria-label="KYC and phone status">
          <div className="flex items-center gap-[${spacing.sm}px]">
            <Badge variant={getBadgeVariant(phoneVerified)} aria-label={phoneVerified ? 'Phone verified' : 'Phone pending'}>
              Phone
            </Badge>
            <span className={labelClasses}>{phoneVerified ? 'Phone verified' : 'Phone verification needed'}</span>
          </div>
          {!phoneVerified && onVerifyPhone && (
            <Button size="sm" variant="secondary" onClick={onVerifyPhone}>
              Verify phone
            </Button>
          )}
        </div>

        <div className={rowClasses} role="status" aria-label="KYC status">
          <div className="flex items-center gap-[${spacing.sm}px]">
            <Badge variant={getBadgeVariant(kycVerified)} aria-label={kycVerified ? 'KYC verified' : 'KYC pending'}>
              KYC
            </Badge>
            <span className={labelClasses}>{kycVerified ? 'Aadhaar verified' : 'Complete KYC'}</span>
          </div>
          {!kycVerified && onVerifyKyc && (
            <Button size="sm" variant="primary" onClick={onVerifyKyc}>
              Verify KYC
            </Button>
          )}
        </div>

        {yardRequiresToken && (
          <div className={rowClasses} role="status" aria-label="Token status">
            <div className="flex items-center gap-[${spacing.sm}px]">
              <Badge variant={getBadgeVariant(tokenActive)} aria-label={tokenActive ? 'Token active' : 'Token required'}>
                Token
              </Badge>
              <span className={labelClasses}>{tokenActive ? 'Token fee paid' : 'Token required to bid'}</span>
            </div>
            {!tokenActive && onBuyToken && (
              <Button size="sm" variant="outline" onClick={onBuyToken}>
                Buy token
              </Button>
            )}
          </div>
        )}

        <div className={rowClasses} role="status" aria-label="Deposit status">
          <div className="flex items-center gap-[${spacing.sm}px]">
            <Badge variant={depositPaid ? 'success' : 'warning'} aria-label={depositPaid ? 'Deposit paid' : 'Deposit required'}>
              Deposit
            </Badge>
            <span className={labelClasses}>{depositStatusText}</span>
          </div>
          {needsDeposit && onPayDeposit && (
            <Button size="sm" variant="primary" onClick={onPayDeposit}>
              Pay deposit
            </Button>
          )}
        </div>

        {showWallet && (
          <div className={rowClasses} role="status" aria-label="Wallet status">
            <div className="flex items-center gap-[${spacing.sm}px]">
              <Badge variant={walletBalance && walletBalance > 0 ? 'success' : 'neutral'} aria-label="Wallet balance">
                Wallet
              </Badge>
              <span className={labelClasses}>Balance: {walletLabel}</span>
            </div>
            {onTopUp && (
              <Button size="sm" variant="outline" onClick={onTopUp}>
                Top up wallet
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

StatusStrip.displayName = 'StatusStrip';

/**
 * Usage example:
 * <StatusStrip
 *   phoneVerified={false}
 *   kycVerified={false}
 *   tokenActive={false}
 *   depositPaid={false}
 *   walletBalance={1200}
 *   requiredDeposit={5000}
 *   onVerifyPhone={() => {}}
 *   onVerifyKyc={() => {}}
 *   onBuyToken={() => {}}
 *   onPayDeposit={() => {}}
 *   onTopUp={() => {}}
 * />
 */
