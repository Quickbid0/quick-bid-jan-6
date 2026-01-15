import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import AuctionCard from '../../src/components/AuctionCard';

describe('AuctionCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with basic props', () => {
    render(
      <AuctionCard
        variant="catalog"
        id="test-1"
        title="Test Product"
        image="https://example.com/image.jpg"
        currentBid={10000}
        bidCount={5}
        onPrimaryAction={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
    expect(screen.getByText('5 bids')).toBeInTheDocument();
  });

  it('renders live indicators', () => {
    render(
      <AuctionCard
        variant="live"
        id="test-2"
        title="Live Product"
        image="https://example.com/image.jpg"
        currentBid={15000}
        bidCount={10}
        timeRemaining="2h 30m"
        isLive={true}
        onPrimaryAction={vi.fn()}
        onClick={vi.fn()}
      />
    );

    expect(screen.getByText('LIVE NOW')).toBeInTheDocument();
    expect(screen.getByText(/ending in/i)).toBeInTheDocument();
  });

  it('handles click actions', async () => {
    const mockPrimaryAction = vi.fn();
    const mockClick = vi.fn();

    render(
      <AuctionCard
        variant="live"
        id="test-3"
        title="Clickable Product"
        image="https://example.com/image.jpg"
        currentBid={20000}
        bidCount={15}
        isLive={true}
        onPrimaryAction={mockPrimaryAction}
        onClick={mockClick}
      />
    );

    const primaryButton = screen.getByRole('button');
    await primaryButton.click();
    expect(mockPrimaryAction).toHaveBeenCalledOnce();

    const card = screen.getByRole('article');
    await card.click();
    expect(mockClick).toHaveBeenCalledOnce();
  });
});