import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  startListening,
  stopListening,
  setError,
  clearError,
} from '../redux/slices/voiceSlice';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const VoiceBidScreen: React.FC = () => {
  const dispatch = useDispatch();
  const voiceState = useSelector((state: RootState) => state.voice);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAudio();
    return () => {
      cleanupAudio();
    };
  }, []);

  const initializeAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
      setIsInitialized(true);
    } catch (error) {
      Alert.alert('Audio Error', 'Failed to initialize audio system');
    }
  };

  const cleanupAudio = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
    }
  };

  const startVoiceBid = async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Audio system not initialized');
      return;
    }

    try {
      dispatch(clearError());

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(newRecording);
      dispatch(startListening());

      // Speak instructions
      Speech.speak('Listening for your bid. Say something like "bid 500 rupees" or "what is the current price"', {
        language: 'en-IN',
        pitch: 1.0,
        rate: 0.8,
      });

      // Auto-stop after 5 seconds
      setTimeout(async () => {
        await stopVoiceBid();
      }, 5000);

    } catch (error) {
      dispatch(setError('Failed to start voice recording'));
    }
  };

  const stopVoiceBid = async () => {
    if (!recording) return;

    try {
      dispatch(stopListening());
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      if (uri) {
        // Process the audio file
        await processVoiceCommand(uri);
      }

      setRecording(null);
    } catch (error) {
      dispatch(setError('Failed to stop voice recording'));
    }
  };

  const processVoiceCommand = async (audioUri: string) => {
    try {
      // In production, send audio to backend for processing
      // For now, simulate voice recognition
      const mockTranscript = await simulateVoiceRecognition(audioUri);
      const mockIntent = analyzeIntent(mockTranscript);

      // Generate AI response
      const response = generateAIResponse(mockIntent, mockTranscript);

      // Update Redux state
      dispatch(setTranscript({ transcript: mockTranscript, confidence: 0.85 }));

      // Simulate processing delay
      setTimeout(() => {
        dispatch(setResponse({ response, intent: mockIntent.intent }));
        speakResponse(response);
      }, 1000);

    } catch (error) {
      dispatch(setError('Failed to process voice command'));
    }
  };

  const simulateVoiceRecognition = async (audioUri: string): Promise<string> => {
    // Simulate voice recognition delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock different responses
    const mockResponses = [
      'bid 500 rupees',
      'what is the current price',
      'status of auction',
      'place bid for 750',
      'how much time left'
    ];

    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  };

  const analyzeIntent = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.includes('bid') || lowerTranscript.includes('offer')) {
      const amountMatch = transcript.match(/(\d+)/);
      return {
        intent: 'bid',
        amount: amountMatch ? parseInt(amountMatch[1]) : null,
        confidence: 0.9
      };
    }

    if (lowerTranscript.includes('status') || lowerTranscript.includes('current') || lowerTranscript.includes('price')) {
      return {
        intent: 'status',
        confidence: 0.85
      };
    }

    if (lowerTranscript.includes('help') || lowerTranscript.includes('how')) {
      return {
        intent: 'help',
        confidence: 0.8
      };
    }

    return {
      intent: 'unknown',
      confidence: 0.5
    };
  };

  const generateAIResponse = (intent: any, transcript: string): string => {
    switch (intent.intent) {
      case 'bid':
        if (intent.amount) {
          return `I understood you want to place a bid of ₹${intent.amount}. The minimum bid is ₹450. Would you like me to place this bid for you?`;
        }
        return 'I heard you want to place a bid, but I couldn\'t detect the amount. Please say something like "bid 500 rupees".';

      case 'status':
        return 'The current highest bid is ₹425 with 12 active bidders. The auction ends in 2 hours and 15 minutes.';

      case 'help':
        return 'I can help you with bidding, checking auction status, or answering questions about products. Try saying "bid [amount]", "current price", or "auction status".';

      default:
        return 'I\'m sorry, I didn\'t understand that. Please try again or ask for help.';
    }
  };

  const speakResponse = (text: string) => {
    Speech.speak(text, {
      language: 'en-IN',
      pitch: 1.0,
      rate: 0.9,
    });
  };

  const getStatusColor = () => {
    if (voiceState.error) return '#EF4444';
    if (voiceState.isListening) return '#10B981';
    if (voiceState.isProcessing) return '#F59E0B';
    return '#6B7280';
  };

  const getStatusText = () => {
    if (voiceState.error) return 'Error';
    if (voiceState.isListening) return 'Listening...';
    if (voiceState.isProcessing) return 'Processing...';
    return 'Ready';
  };

  const getStatusIcon = () => {
    if (voiceState.error) return 'error';
    if (voiceState.isListening) return 'mic';
    if (voiceState.isProcessing) return 'hourglass-empty';
    return 'mic-none';
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🎤 AI Voice Bidding</Text>
        <Text style={styles.subtitle}>Speak naturally to place bids</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
          <MaterialIcons name={getStatusIcon() as any} size={24} color="white" />
        </View>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {voiceState.confidence > 0 && (
          <Text style={styles.confidenceText}>
            {Math.round(voiceState.confidence * 100)}% confidence
          </Text>
        )}
      </View>

      {voiceState.transcript && (
        <View style={styles.transcriptContainer}>
          <Text style={styles.transcriptLabel}>You said:</Text>
          <Text style={styles.transcriptText}>"{voiceState.transcript}"</Text>
        </View>
      )}

      {voiceState.response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseLabel}>🤖 AI Assistant:</Text>
          <Text style={styles.responseText}>{voiceState.response}</Text>
        </View>
      )}

      {voiceState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {voiceState.error}</Text>
        </View>
      )}

      <View style={styles.voiceButtonContainer}>
        <TouchableOpacity
          style={[
            styles.voiceButton,
            voiceState.isListening && styles.voiceButtonActive,
            voiceState.error && styles.voiceButtonError
          ]}
          onPress={voiceState.isListening ? stopVoiceBid : startVoiceBid}
          disabled={voiceState.isProcessing}
        >
          <FontAwesome5
            name={voiceState.isListening ? 'microphone-slash' : 'microphone'}
            size={32}
            color="white"
          />
          <Text style={styles.voiceButtonText}>
            {voiceState.isListening ? 'Stop Listening' : 'Start Voice Bid'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Voice Commands:</Text>
        <Text style={styles.tipsText}>"Bid 500 rupees"</Text>
        <Text style={styles.tipsText}>"Current price"</Text>
        <Text style={styles.tipsText}>"Auction status"</Text>
        <Text style={styles.tipsText}>"Help"</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  statusIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  transcriptContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 16,
    color: 'white',
    fontStyle: 'italic',
  },
  responseContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    fontSize: 14,
    color: '#FECACA',
    textAlign: 'center',
  },
  voiceButtonContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  voiceButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  voiceButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  voiceButtonError: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  voiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
});

export default VoiceBidScreen;
