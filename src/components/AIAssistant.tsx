import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Sparkles, 
  Plus, 
  Settings2, 
  Mic, 
  Send, 
  Package, 
  TrendingUp, 
  Truck, 
  BarChart3,
  Zap,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export function AIAssistant() {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const firstName = profile?.displayName?.split(' ')[0] || profile?.email?.split('@')[0] || 'User';

  const quickActions = [
    { label: 'Inventory Report', icon: <Package className="w-3.5 h-3.5" />, color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-700 hover:border-emerald-400/40' },
    { label: 'Sales Forecast', icon: <TrendingUp className="w-3.5 h-3.5" />, color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-700 hover:border-blue-400/40' },
    { label: 'Logistics Optimizer', icon: <Truck className="w-3.5 h-3.5" />, color: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-700 hover:border-amber-400/40' },
    { label: 'Financial Analysis', icon: <BarChart3 className="w-3.5 h-3.5" />, color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-700 hover:border-purple-400/40' },
  ];

  const suggestions = [
    'Summarize this month\'s warehouse performance',
    'Which SKUs need restocking this week?',
    'Generate a delivery route optimization plan',
    'Draft a client follow-up for overdue payments',
  ];

  const handleSubmit = (text?: string) => {
    const message = text || query;
    if (!message.trim()) return;
    
    setIsTyping(true);
    setQuery('');
    
    setTimeout(() => {
      setIsTyping(false);
      toast.info('AI Assistant is a prototype feature. Full integration coming soon!', {
        description: `Your query: "${message.substring(0, 60)}${message.length > 60 ? '...' : ''}"`,
        duration: 4000,
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-gold-400/5 via-transparent to-emerald-400/5 rounded-full blur-3xl" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-500" />
          <span className="text-sm font-black tracking-tight text-navy-900">ActivePro AI</span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-navy-400 bg-navy-50 px-2 py-0.5 rounded-full border border-navy-100">Prototype</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600 bg-gold-50 px-2.5 py-1 rounded-full border border-gold-200">PRO</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-white text-xs font-black uppercase">
            {firstName[0]}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full max-w-2xl space-y-8 relative z-10 -mt-8">
        {/* Greeting */}
        <div className="space-y-2">
          <h1 className="text-lg font-medium text-navy-400">
            Hi {firstName}
          </h1>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-900 leading-tight">
            What should we do today?
          </h2>
        </div>

        {/* Input area */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-400/20 via-navy-400/10 to-emerald-400/20 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-sm" />
          <div className="relative bg-white border border-navy-200 rounded-2xl shadow-lg group-focus-within:border-navy-300 group-focus-within:shadow-xl transition-all duration-300">
            <input
              type="text"
              placeholder="Ask ActivePro AI..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full px-5 pt-4 pb-12 bg-transparent text-sm text-navy-900 placeholder-navy-300 focus:outline-none rounded-2xl"
            />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button 
                  className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-navy-600 transition-colors"
                  onClick={() => toast.info('File attachment coming in future update')}
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-navy-600 transition-colors text-xs font-medium"
                  onClick={() => toast.info('Tools panel coming in future update')}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  Tools
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  className="p-1.5 rounded-lg hover:bg-navy-50 text-navy-400 hover:text-navy-600 transition-colors"
                  onClick={() => toast.info('Voice input coming in future update')}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleSubmit()}
                  disabled={!query.trim()}
                  className="p-1.5 rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3 px-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs text-navy-400 font-medium">ActivePro AI is thinking...</span>
          </div>
        )}

        {/* Quick action chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleSubmit(action.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border bg-gradient-to-r text-xs font-semibold transition-all duration-200 hover:shadow-md active:scale-95 ${action.color}`}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        {/* Suggestion cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(suggestion)}
              className="group/card flex items-start gap-3 p-4 rounded-xl border border-navy-100 bg-white/60 hover:bg-white hover:border-navy-200 hover:shadow-md text-left transition-all duration-200 active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-navy-600 leading-relaxed">{suggestion}</span>
              <ArrowRight className="w-3.5 h-3.5 text-navy-300 shrink-0 mt-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity ml-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-[10px] text-navy-300 font-medium">
          ActivePro AI is a prototype feature · Responses are simulated · <span className="text-gold-500 font-bold">Full Gemini integration planned</span>
        </p>
      </div>
    </div>
  );
}
