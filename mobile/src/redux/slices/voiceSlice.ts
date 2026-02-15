import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
  lastIntent: string;
  response: string;
  error: string | null;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    message: string;
    timestamp: number;
  }>;
}

const initialState: VoiceState = {
  isListening: false,
  isProcessing: false,
  transcript: '',
  confidence: 0,
  lastIntent: '',
  response: '',
  error: null,
  conversationHistory: [],
};

const voiceSlice = createSlice({
  name: 'voice',
  initialState,
  reducers: {
    startListening: (state) => {
      state.isListening = true;
      state.error = null;
    },
    stopListening: (state) => {
      state.isListening = false;
    },
    setTranscript: (state, action: PayloadAction<{ transcript: string; confidence: number }>) => {
      state.transcript = action.payload.transcript;
      state.confidence = action.payload.confidence;
      state.isProcessing = true;
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
    setResponse: (state, action: PayloadAction<{ response: string; intent: string }>) => {
      state.response = action.payload.response;
      state.lastIntent = action.payload.intent;
      state.isProcessing = false;
      state.conversationHistory.push({
        role: 'assistant',
        message: action.payload.response,
        timestamp: Date.now(),
      });
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.conversationHistory.push({
        role: 'user',
        message: action.payload,
        timestamp: Date.now(),
      });
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isListening = false;
      state.isProcessing = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetVoiceState: (state) => {
      return { ...initialState, conversationHistory: state.conversationHistory };
    },
  },
});

export const {
  startListening,
  stopListening,
  setTranscript,
  setProcessing,
  setResponse,
  addUserMessage,
  setError,
  clearError,
  resetVoiceState,
} = voiceSlice.actions;

export default voiceSlice.reducer;
