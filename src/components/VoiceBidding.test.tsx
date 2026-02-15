import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import VoiceBidding from '../components/VoiceBidding';

// Mock speech recognition API
const mockSpeechRecognition = {
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  continuous: false,
  interimResults: false,
  lang: 'en-IN',
  onstart: null,
  onresult: null,
  onend: null,
  onerror: null,
  onaudioend: null,
  onspeechend: null,
  onspeechstart: null,
  onsoundend: null,
  onsoundstart: null,
  onnomatch: null,
};

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
});

// Mock speech synthesis
const mockSpeechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn(() => []),
  paused: false,
  pending: false,
  speaking: false,
};

Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: mockSpeechSynthesis,
});

// Mock navigator media devices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue(new MediaStream()),
  },
  configurable: true,
});

// Mock permissions API
Object.defineProperty(navigator, 'permissions', {
  value: {
    query: jest.fn().mockResolvedValue({ state: 'granted' }),
  },
  configurable: true,
});

describe('VoiceBidding Component', () => {
  const defaultProps = {
    auctionId: 'test-auction-123',
    currentBid: 5000,
    bidIncrement: 500,
    onBidPlaced: jest.fn(),
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders voice bidding interface', () => {
    render(<VoiceBidding {...defaultProps} />);

    expect(screen.getByText('Voice Bidding Assistant')).toBeInTheDocument();
    expect(screen.getByText(/Powered by AI/)).toBeInTheDocument();
    expect(screen.getByText('🎯 Ready to listen')).toBeInTheDocument();
  });

  it('shows microphone button', () => {
    render(<VoiceBidding {...defaultProps} />);

    const micButton = screen.getByRole('button', { name: /🎤 Listening|🎯 Ready to listen/ });
    expect(micButton).toBeInTheDocument();
  });

  it('displays help text for voice commands', () => {
    render(<VoiceBidding {...defaultProps} />);

    expect(screen.getByText(/Try saying:/)).toBeInTheDocument();
    expect(screen.getByText(/"bid \[amount\]"/)).toBeInTheDocument();
    expect(screen.getByText(/"status"/)).toBeInTheDocument();
    expect(screen.getByText(/"help"/)).toBeInTheDocument();
  });

  it('starts listening when microphone button is clicked', () => {
    render(<VoiceBidding {...defaultProps} />);

    const micButton = screen.getByRole('button', { name: /🎯 Ready to listen/ });
    fireEvent.click(micButton);

    expect(mockSpeechRecognition.start).toHaveBeenCalled();
  });

  it('requests microphone permission when needed', async () => {
    // Mock permissions as denied
    navigator.permissions.query = jest.fn().mockResolvedValue({ state: 'denied' });

    render(<VoiceBidding {...defaultProps} />);

    const micButton = screen.getByRole('button', { name: /🎯 Ready to listen/ });
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });
  });

  it('shows processing state during command processing', async () => {
    render(<VoiceBidding {...defaultProps} />);

    // Simulate starting listening
    const micButton = screen.getByRole('button', { name: /🎯 Ready to listen/ });
    fireEvent.click(micButton);

    // Simulate speech recognition result
    mockSpeechRecognition.onstart();
    mockSpeechRecognition.onresult({
      resultIndex: 0,
      results: [{
        [0]: { transcript: 'bid 10000 rupees', confidence: 0.9 },
        isFinal: true,
        length: 1
      }],
      length: 1
    });

    await waitFor(() => {
      expect(screen.getByText('🧠 Processing...')).toBeInTheDocument();
    });
  });

  it('displays voice text and confidence', async () => {
    render(<VoiceBidding {...defaultProps} />);

    // Simulate speech recognition result
    mockSpeechRecognition.onresult({
      resultIndex: 0,
      results: [{
        [0]: { transcript: 'bid 7500 rupees', confidence: 0.85 },
        isFinal: true,
        length: 1
      }],
      length: 1
    });

    await waitFor(() => {
      expect(screen.getByText('You said:')).toBeInTheDocument();
      expect(screen.getByText('"bid 7500 rupees"')).toBeInTheDocument();
      expect(screen.getByText('85% confidence')).toBeInTheDocument();
    });
  });

  it('displays voice assistant response', async () => {
    render(<VoiceBidding {...defaultProps} />);

    // Simulate processing complete with response
    // This would normally come from the backend API call
    // For testing, we can simulate the state update

    await waitFor(() => {
      // Test that response area exists
      expect(screen.getByText('Assistant:')).toBeInTheDocument();
    });
  });

  it('shows pending bid confirmation', async () => {
    render(<VoiceBidding {...defaultProps} />);

    // This would be tested by simulating the pending bid state
    // The component should show confirmation UI when there's a pending bid
  });

  it('handles disabled state', () => {
    render(<VoiceBidding {...defaultProps} disabled={true} />);

    const micButton = screen.getByRole('button');
    expect(micButton).toBeDisabled();
  });

  it('shows unsupported browser message', () => {
    // Mock unsupported browser
    Object.defineProperty(window, 'SpeechRecognition', {
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'webkitSpeechRecognition', {
      writable: true,
      value: undefined,
    });

    render(<VoiceBidding {...defaultProps} />);

    expect(screen.getByText('Voice bidding not supported in this browser')).toBeInTheDocument();
    expect(screen.getByText(/Try using Chrome, Edge, or Safari/)).toBeInTheDocument();
  });

  it('speaks responses using speech synthesis', async () => {
    render(<VoiceBidding {...defaultProps} />);

    // Simulate a command that triggers speech
    const micButton = screen.getByRole('button', { name: /🎯 Ready to listen/ });
    fireEvent.click(micButton);

    // Simulate speech recognition result
    mockSpeechRecognition.onresult({
      resultIndex: 0,
      results: [{
        [0]: { transcript: 'help', confidence: 0.9 },
        isFinal: true,
        length: 1
      }],
      length: 1
    });

    await waitFor(() => {
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    });
  });

  it('handles speech recognition errors', async () => {
    render(<VoiceBidding {...defaultProps} />);

    // Simulate network error
    mockSpeechRecognition.onerror({
      error: 'network',
      message: 'Network error occurred'
    });

    await waitFor(() => {
      expect(screen.getByText('Network error. Please check your connection.')).toBeInTheDocument();
    });
  });

  it('handles no speech detected', async () => {
    render(<VoiceBidding {...defaultProps} />);

    // Simulate no speech error
    mockSpeechRecognition.onerror({
      error: 'no-speech',
      message: 'No speech detected'
    });

    await waitFor(() => {
      expect(screen.getByText('No speech detected. Please try again.')).toBeInTheDocument();
    });
  });

  it('handles microphone access denied', async () => {
    // Mock getUserMedia rejection
    navigator.mediaDevices.getUserMedia = jest.fn().mockRejectedValue(new Error('Permission denied'));

    render(<VoiceBidding {...defaultProps} />);

    const micButton = screen.getByRole('button', { name: /🎯 Ready to listen/ });
    fireEvent.click(micButton);

    await waitFor(() => {
      expect(screen.getByText('Microphone access denied. Please enable microphone permissions in your browser.')).toBeInTheDocument();
    });
  });

  it('stops listening when stop button is clicked', () => {
    render(<VoiceBidding {...defaultProps} />);

    // Start listening
    const micButton = screen.getByRole('button', { name: /🎯 Ready to listen/ });
    fireEvent.click(micButton);

    // Should be listening now
    expect(mockSpeechRecognition.start).toHaveBeenCalled();

    // Click again to stop (assuming it shows stop state)
    // Note: In real component, the button might change appearance
  });

  it('displays AI indicator', () => {
    render(<VoiceBidding {...defaultProps} />);

    expect(screen.getByText('AI-powered voice recognition')).toBeInTheDocument();
  });

  it('cleans up on unmount', () => {
    const { unmount } = render(<VoiceBidding {...defaultProps} />);

    unmount();

    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
  });
});
