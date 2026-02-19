import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

interface VoiceBidButtonProps {
  sessionId: string;
  userId: string;
}

const VoiceBidButton: React.FC<VoiceBidButtonProps> = ({ sessionId, userId }) => {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    socket.emit('joinLiveAuction', { sessionId, userId });
  }, [sessionId, userId]);

  const parseAmount = (text: string): number | null => {
    const words = text.toLowerCase().split(' ');
    let amount: number | null = null;

    for (let i = 0; i < words.length; i++) {
      if (words[i] === 'increase' && words[i + 1] === 'by') {
        amount = parseFloat(words[i + 2]);
        break;
      } else if (words[i] === 'bid') {
        amount = parseFloat(words[i + 1]);
        break;
      } else {
        const num = parseFloat(words[i]);
        if (!isNaN(num)) {
          amount = num;
          break;
        }
      }
    }

    return amount;
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported');
      return;
    }

    const recognition = new ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const amount = parseAmount(transcript);
      if (amount) {
        socket.emit('voiceBid', {
          sessionId,
          userId,
          spokenText: transcript,
          amount,
          confidence: 0.8
        });
      } else {
        console.log('Could not parse amount from:', transcript);
      }
    };

    recognition.start();
  };

  return (
    <button
      onClick={startListening}
      disabled={isListening}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {isListening ? '🎤 Listening...' : '🎤 Voice Bid'}
    </button>
  );
};

export default VoiceBidButton;
