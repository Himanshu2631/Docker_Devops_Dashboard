import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, Sparkles, Terminal, Activity, Zap, Shield, 
  ChevronRight, RotateCcw, Cpu, LayoutGrid, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * AICopilot.jsx
 * -------------
 * Premium AI DevOps Assistant interface.
 * Provides an infrastructure-aware chat experience for diagnostics and monitoring.
 */

const AICopilot = () => {
  const { api } = useAuth();
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "System Intelligence Online. I am **Core-AI**, your infrastructure-aware DevOps copilot. How can I assist with your Docker cluster today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const suggestedPrompts = [
    "Analyze infrastructure health",
    "Why is CPU usage high?",
    "Which containers are unhealthy?",
    "Summarize recent Docker events"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { 
      role: 'user', 
      content: text, 
      timestamp: new Date().toLocaleTimeString() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history for context (last 5 messages)
      const history = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await api.post('/ai/chat', { message: text, history });
      
      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.data.reply,
          metadata: response.data.data.metadata,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ **System Error**: I'm having trouble connecting to the neural gateway. Please check your API configuration.",
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-6">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0c0c0e]/60 backdrop-blur-3xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
        {/* CRT Overlay */}
        <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-blue/10 rounded-2xl text-accent-blue border border-accent-blue/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Bot size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
                System <span className="text-accent-blue">Intelligence</span>
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Neural link active • SRE Mode</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-3 hover:bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all"
            title="Reset Terminal"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Message Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue' : 'bg-white/5 border-white/10 text-white'}`}>
                    {msg.role === 'user' ? <LayoutGrid size={18} /> : <Cpu size={18} />}
                  </div>
                  <div className={`p-5 rounded-3xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-accent-blue text-white shadow-[0_0_30px_rgba(59,130,246,0.15)] font-medium' 
                      : msg.isError ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500' : 'bg-white/[0.03] border border-white/5 text-slate-300'
                  }`}>
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('**') ? 'font-bold mb-2' : 'mb-1'}>
                        {line.replace(/\*\*/g, '')}
                      </p>
                    ))}
                    <div className={`text-[9px] mt-4 font-mono uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'text-white' : 'text-slate-500'}`}>
                      {msg.timestamp} {msg.metadata && `• context: ${msg.metadata.containerCount} nodes`}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center animate-pulse text-white">
                  <Cpu size={18} />
                </div>
                <div className="flex gap-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-accent-blue"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Suggested Prompts Area */}
        <div className="px-8 pb-4 flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-accent-blue/10 hover:border-accent-blue/30 hover:text-accent-blue transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-8 pt-4">
          <div className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Core-AI about your infrastructure..."
              className="w-full bg-black/40 border border-white/10 rounded-[24px] py-5 pl-8 pr-20 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-blue/40 transition-all shadow-inner font-medium"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 p-3 bg-accent-blue text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
             <div className="flex items-center gap-2">
               <Shield size={12} className="text-emerald-500/50" />
               <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">End-to-End Encrypted</span>
             </div>
             <div className="flex items-center gap-2">
               <Activity size={12} className="text-accent-blue/50" />
               <span className="text-[8px] text-slate-600 uppercase font-black tracking-[0.2em]">Context-Aware Processing</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Info */}
      <div className="w-80 flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0c0c0e]/60 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 flex flex-col gap-6"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="text-accent-purple" size={20} />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Capabilities</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Metrics Analysis', icon: Activity, text: 'Real-time resource troubleshooting' },
              { label: 'Event Correlation', icon: Zap, text: 'Mapping logs to system failures' },
              { label: 'Health Audits', icon: Shield, text: 'Infrastructure vulnerability scans' },
              { label: 'CLI Generation', icon: Terminal, text: 'Synthesizing Docker commands' }
            ].map((cap, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-3 mb-1">
                  <cap.icon size={14} className="text-slate-500 group-hover:text-accent-blue transition-colors" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{cap.label}</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed pl-7">{cap.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-6 border-t border-white/5">
             <div className="bg-accent-blue/5 rounded-2xl p-4 border border-accent-blue/10">
               <div className="flex items-center gap-2 mb-2">
                 <Info size={12} className="text-accent-blue" />
                 <span className="text-[9px] font-black text-accent-blue uppercase tracking-widest">DevOps Copilot</span>
               </div>
               <p className="text-[10px] text-slate-400 italic leading-relaxed">
                 "I can analyze trends across your entire cluster to predict potential resource exhaustion before it happens."
               </p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AICopilot;
