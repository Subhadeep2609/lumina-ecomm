import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiCall } from '../../utils/api.js';

// Default welcome message
const INITIAL_MESSAGES = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    text: "✨ **Welcome to LuminaMarket!** I'm **Lumina AI**, your personal shopping concierge and tech stylist.\n\nAsk me for product recommendations, budget finds under any price, gift ideas, or technical comparisons!",
    recommendedProducts: [],
    timestamp: new Date().toISOString()
  }
];

const loadPersistedMessages = () => {
  try {
    const saved = localStorage.getItem('lumina_ai_chat');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return INITIAL_MESSAGES;
};

export const sendAiMessage = createAsyncThunk(
  'ai/sendMessage',
  async ({ message }, { getState, rejectWithValue }) => {
    try {
      const { messages } = getState().ai;
      const recentHistory = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        content: m.text
      }));

      const res = await apiCall('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history: recentHistory })
      });

      return {
        reply: res.data.reply,
        recommendedProducts: res.data.recommendedProducts || []
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to get AI response');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    isOpen: false,
    loading: false,
    error: null,
    messages: loadPersistedMessages(),
    quickPrompts: [
      '🔥 Trending deals today',
      '🎧 Best noise-canceling audio',
      '🎁 Gift ideas under $150',
      '⚡ Express delivery details'
    ]
  },
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state, action) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    clearHistory: (state) => {
      state.messages = INITIAL_MESSAGES;
      try {
        localStorage.removeItem('lumina_ai_chat');
      } catch (e) {}
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendAiMessage.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        const userMsg = {
          id: 'user_' + Date.now(),
          sender: 'user',
          text: action.meta.arg.message,
          recommendedProducts: [],
          timestamp: new Date().toISOString()
        };
        state.messages.push(userMsg);
        try {
          localStorage.setItem('lumina_ai_chat', JSON.stringify(state.messages));
        } catch (e) {}
      })
      .addCase(sendAiMessage.fulfilled, (state, action) => {
        state.loading = false;
        const aiMsg = {
          id: 'ai_' + Date.now(),
          sender: 'assistant',
          text: action.payload.reply,
          recommendedProducts: action.payload.recommendedProducts,
          timestamp: new Date().toISOString()
        };
        state.messages.push(aiMsg);
        try {
          localStorage.setItem('lumina_ai_chat', JSON.stringify(state.messages));
        } catch (e) {}
      })
      .addCase(sendAiMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.messages.push({
          id: 'ai_err_' + Date.now(),
          sender: 'assistant',
          text: `⚠️ *I encountered an issue connecting to the AI service:* ${action.payload}. Please try again shortly!`,
          recommendedProducts: [],
          timestamp: new Date().toISOString()
        });
      });
  }
});

export const { toggleChat, openChat, closeChat, clearHistory } = aiSlice.actions;
export default aiSlice.reducer;
