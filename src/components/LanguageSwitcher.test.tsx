import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import LanguageSwitcher from '../components/LanguageSwitcher';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
      languages: ['en', 'hi', 'te', 'ta']
    }
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    // Reset i18n language before each test
    i18n.changeLanguage('en');
  });

  it('renders language switcher with default dropdown variant', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Select language/ })).toBeInTheDocument();
  });

  it('renders minimal variant correctly', () => {
    render(<LanguageSwitcher variant="minimal" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('EN');
  });

  it('renders full variant with expanded options', () => {
    render(<LanguageSwitcher variant="full" />);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Select language')).toBeInTheDocument();
  });

  it('shows dropdown when clicked', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('हिंदी')).toBeInTheDocument();
      expect(screen.getByText('తెలుగు')).toBeInTheDocument();
      expect(screen.getByText('தமிழ்')).toBeInTheDocument();
    });
  });

  it('changes language when option is selected', async () => {
    const mockChangeLanguage = jest.fn();
    i18n.changeLanguage = mockChangeLanguage;

    render(<LanguageSwitcher />);

    // Open dropdown
    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    // Click on Hindi option
    const hindiOption = screen.getByText('हिंदी');
    fireEvent.click(hindiOption);

    expect(mockChangeLanguage).toHaveBeenCalledWith('hi');
  });

  it('shows checkmark for currently selected language', async () => {
    // Set current language to Hindi
    i18n.language = 'hi';

    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    await waitFor(() => {
      const hindiOption = screen.getByText('हिंदी').closest('button');
      expect(hindiOption).toHaveClass('bg-blue-50'); // Should have selected styling
    });
  });

  it('closes dropdown when clicking outside', async () => {
    render(
      <div>
        <LanguageSwitcher />
        <div data-testid="outside">Outside</div>
      </div>
    );

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    // Wait for dropdown to appear
    await waitFor(() => {
      expect(screen.getByText('हिंदी')).toBeInTheDocument();
    });

    // Click outside
    const outsideElement = screen.getByTestId('outside');
    fireEvent.click(outsideElement);

    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByText('हिंदी')).not.toBeInTheDocument();
    });
  });

  it('handles language change loading state', async () => {
    const mockChangeLanguage = jest.fn().mockResolvedValue(undefined);

    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    const hindiOption = screen.getByText('हिंदी');
    fireEvent.click(hindiOption);

    // Button should be disabled during language change
    expect(button).toBeDisabled();
  });

  it('displays flag emojis for each language', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('🇺🇸')).toBeInTheDocument(); // English flag
      expect(screen.getByText('🇮🇳')).toBeInTheDocument(); // Indian flag for Hindi/Telugu/Tamil
    });
  });

  it('shows native language names', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('हिंदी')).toBeInTheDocument();
      expect(screen.getByText('Hindi')).toBeInTheDocument();
      expect(screen.getByText('తెలుగు')).toBeInTheDocument();
      expect(screen.getByText('Telugu')).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });

    // Open with Enter key
    fireEvent.keyDown(button, { key: 'Enter' });
    await waitFor(() => {
      expect(screen.getByText('हिंदी')).toBeInTheDocument();
    });

    // Close with Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText('हिंदी')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<LanguageSwitcher className="custom-class" />);

    const container = screen.getByRole('button', { name: /Select language/ }).parentElement;
    expect(container).toHaveClass('custom-class');
  });

  it('renders with animation', async () => {
    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    // Check for animation classes (this depends on framer-motion setup)
    const dropdown = screen.getByRole('listbox').parentElement;
    expect(dropdown).toBeInTheDocument();
  });

  it('saves language preference to localStorage', async () => {
    const mockSetItem = jest.fn();
    Storage.prototype.setItem = mockSetItem;

    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    const hindiOption = screen.getByText('हिंदी');
    fireEvent.click(hindiOption);

    expect(mockSetItem).toHaveBeenCalledWith('i18nextLng', 'hi');
  });

  it('loads language from localStorage on mount', () => {
    const mockGetItem = jest.fn().mockReturnValue('te');
    Storage.prototype.getItem = mockGetItem;

    render(<LanguageSwitcher />);

    expect(mockGetItem).toHaveBeenCalledWith('i18nextLng');
  });

  it('handles error during language change', async () => {
    const mockChangeLanguage = jest.fn().mockRejectedValue(new Error('Change failed'));
    i18n.changeLanguage = mockChangeLanguage;

    // Mock console.error to avoid test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    const hindiOption = screen.getByText('हिंदी');
    fireEvent.click(hindiOption);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to change language:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('displays loading state during language change', async () => {
    let resolvePromise: (value: void) => void;
    const changePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    const mockChangeLanguage = jest.fn().mockReturnValue(changePromise);

    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: /Select language/ });
    fireEvent.click(button);

    const hindiOption = screen.getByText('हिंदी');
    fireEvent.click(hindiOption);

    // Button should be disabled during change
    expect(button).toBeDisabled();

    // Resolve the promise
    resolvePromise();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
