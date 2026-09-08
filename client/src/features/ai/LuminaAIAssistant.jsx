import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleChat, closeChat, sendAiMessage, clearHistory } from './aiSlice.js';
import { openModal, showToast } from '../ui/uiSlice.js';
import { addToCart } from '../orders/orderSlice.js';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Trash2,
  Minimize2,
  ShoppingBag,
  ExternalLink,
  Star,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

const LuminaAIAssistant = () => {
  const dispatch = useDispatch();
  const { isOpen, loading, messages, quickPrompts } = useSelector((state) => state.ai);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [input, setInput] = useState('');
  const chatBottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput('');
    dispatch(sendAiMessage({ message: text }));
  };

  const handleQuickPrompt = (prompt) => {
    if (loading) return;
    dispatch(sendAiMessage({ message: prompt }));
  };

  const handleViewProduct = (product) => {
    dispatch(openModal({ modal: 'PRODUCT_DETAIL', product }));
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please sign in to a Buyer account to add items to cart.', type: 'info' }));
      dispatch(openModal({ modal: 'LOGIN' }));
      return;
    }
    if (user?.role !== 'user') {
      dispatch(showToast({ message: 'Only buyer accounts can purchase items.', type: 'error' }));
      return;
    }
    dispatch(addToCart({ ...product, quantity: 1 }));
    dispatch(showToast({ message: `Added "${product.title}" to your cart!`, type: 'success' }));
  };

  // Helper to format basic markdown text (bold, list, headings)
  const renderFormattedText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      // Bold **text**
      const parts = content.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'leading-relaxed my-0.5'}>
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-extrabold text-indigo-950 dark:text-indigo-200">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-7 right-6 z-50 group">
          <div className="absolute -top-9 right-0 bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-xl shadow-lg border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-400" />
            <span>Ask Lumina AI</span>
          </div>

          <button
            onClick={() => dispatch(toggleChat())}
            aria-label="Open Lumina AI Assistant"
            className="relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-2xl shadow-xl shadow-indigo-600/35 active:scale-95 transition-all duration-300 border border-white/20"
          >
            <div className="relative">
              <Sparkles size={18} className="animate-spin-slow text-amber-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-700 animate-ping" />
            </div>
            <span className="hidden sm:inline-block tracking-wide">Lumina AI Concierge</span>
            <span className="sm:hidden tracking-wide">AI</span>
          </button>
        </div>
      )}

      {/* Slide-Up / Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-w-full bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-body transition-all duration-300 animate-slideUp">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-4 py-3.5 text-white flex items-center justify-between border-b border-indigo-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30 ring-1 ring-white/20">
                <Bot size={20} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black font-heading text-white tracking-tight">Lumina AI</h3>
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-wider">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Live Catalog Shopping Concierge</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => dispatch(clearHistory())}
                title="Clear Chat Thread"
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-lg transition"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => dispatch(closeChat())}
                title="Minimize Concierge"
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/10 rounded-lg transition"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 max-h-[460px] min-h-[320px] overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}>
                  {/* Speech Bubble */}
                  <div
                    className={`max-w-[88%] text-xs rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-wider mb-1 font-heading">
                        <Sparkles size={11} /> Lumina Concierge
                      </div>
                    )}
                    <div className="text-[12px]">{renderFormattedText(msg.text)}</div>
                  </div>

                  {/* Interactive Recommended Product Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="w-full space-y-2 pt-1 pl-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1 font-heading">
                        <Zap size={11} className="text-amber-500" /> Catalog Matches:
                      </span>
                      <div className="space-y-2">
                        {msg.recommendedProducts.map((prod) => {
                          const img = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
                          return (
                            <div
                              key={prod._id || prod.id}
                              className="bg-white border border-slate-200/90 rounded-2xl p-2.5 flex items-center gap-3 shadow-2xs hover:border-indigo-300 transition group"
                            >
                              <img
                                src={img}
                                alt={prod.title}
                                className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider truncate">
                                    {prod.category}
                                  </span>
                                  <div className="flex items-center gap-0.5 text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                                    <Star size={10} className="fill-amber-400 text-amber-400" />
                                    <span>{prod.rating || 4.8}</span>
                                  </div>
                                </div>

                                <h4
                                  onClick={() => handleViewProduct(prod)}
                                  className="text-xs font-bold text-slate-900 truncate hover:text-indigo-600 cursor-pointer"
                                  title={prod.title}
                                >
                                  {prod.title}
                                </h4>

                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs font-black text-slate-900 font-mono">
                                    ${Number(prod.price).toFixed(2)}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleViewProduct(prod)}
                                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                                      title="Inspect Details"
                                    >
                                      <span>View</span>
                                      <ExternalLink size={10} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleAddToCart(prod)}
                                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 shadow-2xs"
                                      title="Add to Cart"
                                    >
                                      <ShoppingBag size={10} />
                                      <span>Add</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pulsing Loading State */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/80 px-3.5 py-2.5 rounded-2xl w-fit border border-indigo-100">
                <Sparkles size={14} className="animate-spin text-indigo-600" />
                <span className="font-bold">Lumina AI is searching live catalog...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200/80 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleQuickPrompt(chip.replace(/^[^\w\s]+/, '').trim())}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-[10px] font-bold text-slate-700 hover:text-indigo-700 rounded-xl transition shadow-2xs shrink-0 disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recommendations, deals, gift ideas..."
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/10 transition font-medium"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl shadow-md transition disabled:opacity-40 active:scale-95 shrink-0"
              title="Send Message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default LuminaAIAssistant;
