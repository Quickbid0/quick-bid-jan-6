import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  Mic, MicOff, Volume2, VolumeX, AlertCircle,
  CheckCircle, Loader, Zap
} from 'lucide-react';

interface VoiceBiddingProps {
  auctionId: string;
  currentBid: number;
  bidIncrement: number;
  onBidPlaced?: (amount: number) => void;
  disabled?: boolean;
}

interface VoiceCommand {
  type: 'bid' | 'status' | 'help' | 'cancel' | 'confirm' | 'unknown';
  amount?: number;
  confidence: number;
  text: string;
}

const VoiceBidding: React.FC<VoiceBiddingProps> = ({
  auctionId,
  currentBid,
  bidIncrement,
  onBidPlaced,
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [pendingBid, setPendingBid] = useState<number | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      setupSpeechRecognition();
    }

    // Check speech synthesis support
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Check microphone permissions
    checkMicrophonePermission();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const setupSpeechRecognition = () => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText('');
      setVoiceResponse('');
      speak('Listening for your bidding command');
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setVoiceText(finalTranscript || interimTranscript);
      setConfidence(event.results[0]?.[0]?.confidence || 0);
    };

    recognition.onend = async () => {
      setIsListening(false);

      if (voiceText.trim()) {
        await processVoiceCommand(voiceText, confidence);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      console.error('Speech recognition error:', event.error);

      let errorMessage = 'Voice recognition failed';
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please enable microphone permissions.';
          setPermissionsGranted(false);
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please connect a microphone.';
          break;
      }

      setVoiceResponse(errorMessage);
      speak(errorMessage);
      toast.error(errorMessage);
    };
  };

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionsGranted(result.state === 'granted');

      result.addEventListener('change', () => {
        setPermissionsGranted(result.state === 'granted');
      });
    } catch (error) {
      // Fallback for browsers that don't support permissions API
      setPermissionsGranted(true);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionsGranted(true);
      toast.success('Microphone access granted');
    } catch (error) {
      setPermissionsGranted(false);
      toast.error('Microphone access denied. Please enable microphone permissions in your browser.');
    }
  };

  const startListening = () => {
    if (!isSupported) {
      toast.error('Voice bidding is not supported in your browser');
      return;
    }

    if (!permissionsGranted) {
      requestMicrophonePermission();
      return;
    }

    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast.error('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = async (text: string, confidence: number) => {
    if (confidence < 0.7) {
      const response = "I'm sorry, I didn't hear you clearly. Please speak more clearly and try again.";
      setVoiceResponse(response);
      speak(response);
      return;
    }

    setIsProcessing(true);

    try {
      // Send voice command to backend for processing
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          auctionId,
          voiceText: text,
          confidence
        })
      });

      if (response.ok) {
        const result = await response.json();
        const command = result.command;
        const responseText = result.response.text;

        setVoiceResponse(responseText);
        speak(responseText);

        // Handle different command types
        if (command.type === 'bid' && result.response.action === 'bid') {
          if (result.response.requiresConfirmation) {
            setPendingBid(result.response.bidAmount || null);
          } else if (result.response.bidAmount) {
            // Place the bid
            await placeVoiceBid(result.response.bidAmount);
          }
        } else if (result.response.action === 'confirm' && pendingBid) {
          await placeVoiceBid(pendingBid);
          setPendingBid(null);
        } else if (result.response.action === 'cancel') {
          setPendingBid(null);
        }

        toast.success('Voice command processed');
      } else {
        const errorResponse = 'Sorry, I had trouble processing your voice command. Please try again.';
        setVoiceResponse(errorResponse);
        speak(errorResponse);
        toast.error('Voice command processing failed');
      }
    } catch (error) {
      console.error('Voice command processing error:', error);
      const errorResponse = 'Voice processing error. Please try again.';
      setVoiceResponse(errorResponse);
      speak(errorResponse);
      toast.error('Voice processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const placeVoiceBid = async (amount: number) => {
    try {
      // Use existing bid placement logic
      if (onBidPlaced) {
        onBidPlaced(amount);
      }

      const successMessage = `Bid of ₹${amount.toLocaleString()} placed successfully!`;
      setVoiceResponse(successMessage);
      speak(successMessage);
      toast.success(successMessage);
    } catch (error) {
      const errorMessage = 'Failed to place voice bid';
      setVoiceResponse(errorMessage);
      speak(errorMessage);
      toast.error(errorMessage);
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN'; // Indian English
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Add voice preferences for better experience
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice =>
      voice.lang.includes('en-IN') || voice.lang.includes('en-GB')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    synthRef.current.speak(utterance);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.6) return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MicOff className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Voice bidding not supported in this browser</p>
          <p className="text-xs mt-1">Try using Chrome, Edge, or Safari for voice features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full">
          <Mic className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            Voice Bidding Assistant
            <span className="text-sm font-normal bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Speak naturally to place bids</p>
        </div>
      </div>

      {/* Voice Control Button */}
      <div className="flex items-center justify-center mb-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled || isProcessing || !permissionsGranted}
          className={`relative p-6 rounded-full transition-all duration-300 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-700'
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {isProcessing ? (
            <Loader className="w-8 h-8 text-white animate-spin" />
          ) : isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}

          {/* Listening indicator */}
          {isListening && (
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
          )}
        </button>
      </div>

      {/* Voice Status */}
      <div className="text-center mb-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {isListening ? '🎤 Listening...' :
           isProcessing ? '🧠 Processing...' :
           voiceText ? '✅ Command received' : '🎯 Ready to listen'}
        </div>

        {!permissionsGranted && (
          <button
            onClick={requestMicrophonePermission}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 underline"
          >
            Enable microphone access
          </button>
        )}
      </div>

      {/* Voice Text Display */}
      {voiceText && (
        <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">You said:</span>
            <div className={`flex items-center gap-1 text-sm ${getConfidenceColor(confidence)}`}>
              {getConfidenceIcon(confidence)}
              <span>{Math.round(confidence * 100)}% confidence</span>
            </div>
          </div>
          <p className="text-gray-900 dark:text-white font-medium">"{voiceText}"</p>
        </div>
      )}

      {/* Voice Response */}
      {voiceResponse && (
        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Assistant:</span>
          </div>
          <p className="text-indigo-900 dark:text-indigo-100">{voiceResponse}</p>
        </div>
      )}

      {/* Pending Bid Confirmation */}
      {pendingBid && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Confirm bid: ₹{pendingBid.toLocaleString()}?
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Say "confirm" or "yes" to place the bid
              </p>
            </div>
            <button
              onClick={() => setPendingBid(null)}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p className="mb-1">Try saying:</p>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">"bid 5000 rupees"</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">"status"</span>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">"help"</span>
        </div>
      </div>

      {/* AI Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-purple-600 dark:text-purple-400">
        <Zap className="w-3 h-3" />
        <span>AI-powered voice recognition</span>
      </div>
    </div>
  );
};

export default VoiceBidding;
