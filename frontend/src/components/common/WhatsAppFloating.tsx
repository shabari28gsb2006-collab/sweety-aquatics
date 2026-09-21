import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { buildWhatsAppUrl } from '../../config/siteConfig';

interface WhatsAppFloatingProps {
  onOpenModal?: (contextMessage: string) => void;
}

export const WhatsAppFloating: React.FC<WhatsAppFloatingProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');


  const sendWhatsApp = (text: string) => {
    const message = text || 'Hello Sweety Birds & Fishes, I have an enquiry about your guppies and fish food.';
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setUserMsg('');
  };

  return (
    <div id="whatsapp-floating-container" className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
      {isOpen && (
        <div
          id="whatsapp-chat-popup"
          className="mb-3 w-80 sm:w-88 rounded-2xl bg-white shadow-2xl border border-[#50D4EE]/30 overflow-hidden transition-all duration-300 transform origin-bottom-right"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#032B42] to-[#0875B5] p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#50D4EE]/20 flex items-center justify-center border border-[#50D4EE]/50">
                <MessageCircle className="w-5 h-5 text-[#50D4EE]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Sweety Birds & Fishes</h4>
                <p className="text-xs text-[#E8F9FC]/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  WhatsApp Business Enquiry
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              aria-label="Close WhatsApp chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#F5FCFF] space-y-3">
            <div className="bg-white p-3 rounded-xl rounded-tl-none text-xs text-[#064463] shadow-xs border border-sky-100 max-w-[85%]">
              Hello! 👋 Welcome to Sweety Birds & Fishes. How can we help you today?
            </div>

            {/* Quick action chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Quick Enquiries:</p>
              <button
                onClick={() => sendWhatsApp('Hello! Is live guppy delivery available to my PIN code in Tamil Nadu?')}
                className="w-full text-left text-xs bg-white hover:bg-sky-50 text-[#0875B5] px-3 py-2 rounded-lg border border-sky-200 transition-colors"
              >
                📍 Check PIN Code Serviceability
              </button>
              <button
                onClick={() => sendWhatsApp('Hello! I would like to know about available guppy breeding pairs and pricing.')}
                className="w-full text-left text-xs bg-white hover:bg-sky-50 text-[#0875B5] px-3 py-2 rounded-lg border border-sky-200 transition-colors"
              >
                🐟 Guppy Pairs & Color Varieties
              </button>
            </div>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (userMsg.trim()) sendWhatsApp(userMsg);
            }}
            className="p-3 bg-white border-t border-sky-100 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-[#F8FDFF] border border-sky-200 rounded-lg focus:outline-none focus:border-[#0875B5] text-slate-800"
            />
            <button
              type="submit"
              className="bg-[#0875B5] hover:bg-[#064463] text-white p-2 rounded-lg transition-colors flex items-center justify-center"
              aria-label="Send WhatsApp message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        id="btn-whatsapp-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        aria-label="Open WhatsApp live enquiry"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline text-xs font-semibold tracking-wide">
          Enquire on WhatsApp
        </span>
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-400"></span>
        </span>
      </button>
    </div>
  );
};
