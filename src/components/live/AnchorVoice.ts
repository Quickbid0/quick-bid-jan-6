const provider = import.meta.env.VITE_TTS_PROVIDER || 'browser';
const elevenLabsVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

export async function speak(text: string): Promise<void> {
  if (!text) return;

  if (provider === 'browser' || !provider) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
    return;
  }

  if (provider === 'elevenlabs') {
    if (!elevenLabsVoiceId) {
      return;
    }

    try {
      const response = await fetch('/.netlify/functions/tts-elevenlabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      // fail silently
    }
    return;
  }

  if (provider === 'gcloud' || provider === 'google' || provider === 'google_cloud') {
    return;
  }
}

export function announceBid(userName: string, amount: number) {
  const firstName = userName?.split(' ')[0] || 'Bidder';
  const text = `${firstName} just placed a bid of rupees ${Math.round(amount)}.`;
  return speak(text);
}

export function announceStart(itemName: string) {
  const text = `QuickMela live auction now starting for ${itemName}. Place your bids in real time.`;
  return speak(text);
}

export function announceCountdown() {
  const text = 'Final countdown before we reveal today\'s live auction winner. Stay tuned.';
  return speak(text);
}

export function announceWinner(name: string, amount: number) {
  const firstName = name?.split(' ')[0] || 'our winner';
  const text = `Congratulations ${firstName}! You are the QuickMela live auction winner at rupees ${Math.round(amount)}.`;
  return speak(text);
}

export function announceOutro() {
  const text = 'That was the winner for this live auction on QuickMela. Stay tuned for the next lot.';
  return speak(text);
}
