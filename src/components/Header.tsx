import React from 'react';
import { Volume2, VolumeX, Ticket, Plus, Sparkles, Home, Package, Briefcase, Gem } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  stars: number;
  tickets: number;
  loyaltyPoints: number;
  inventoryCount: number;
  activeTab: 'home' | 'cases' | 'inventory' | 'rules';
  onSelectTab: (tab: 'home' | 'cases' | 'inventory' | 'rules') => void;
  onAddStars: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stars,
  tickets,
  loyaltyPoints,
  inventoryCount,
  activeTab,
  onSelectTab,
  onAddStars,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#05070F]/75 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                PaxtaBox
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/25">
                Moon Epic + Kalendar
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">
              5 Xil Quti · 199 ta Noyob NFT · 500+ ⭐ Kodlar
            </p>
          </div>
        </div>

        {/* Center: Desktop iOS Segmented Glass Navigation */}
        <nav className="hidden lg:flex items-center gap-1 p-1.5 rounded-full ios-glass-subtle">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'home'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Asosiy</span>
          </button>

          <button
            onClick={() => onSelectTab('cases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'cases'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Qutilar (5)</span>
          </button>

          <button
            onClick={() => onSelectTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Sovg‘alarim</span>
            {inventoryCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'inventory' ? 'bg-slate-950 text-white' : 'bg-emerald-500 text-slate-950'
              }`}>
                {inventoryCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('rules')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'rules'
                ? 'bg-white text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            <Gem className="w-3.5 h-3.5 text-sky-400" />
            <span>Kafolat Do‘koni</span>
            {loyaltyPoints >= 45 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>
        </nav>

        {/* Right: Loyalty Points, Tickets, Stars Balance & Audio */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Loyalty Points Pill (Kafolat Ballari) */}
          <button
            onClick={() => onSelectTab('rules')}
            title="Kafolat Do'koni ballari (Sarflangan Stars evaziga 100% aniq sovg'a oling)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full ios-glass-subtle hover:border-sky-400/40 transition-all"
          >
            <Gem className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-bold text-sky-200">{loyaltyPoints}</span>
            <span className="text-[11px] text-sky-300/75 font-medium">💎</span>
          </button>

          {/* Free Tickets Pill */}
          <div
            title="Bepul quti ochish chiptalari"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full ios-glass-subtle border-indigo-400/25"
          >
            <Ticket className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-100">{tickets}</span>
            <span className="hidden sm:inline text-[11px] text-indigo-300/80 font-medium">chipta</span>
          </div>

          {/* Stars Balance Pill */}
          <button
            onClick={onAddStars}
            className="flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full ios-glass hover:border-amber-400/50 transition-all group active:scale-95"
          >
            <span className="text-amber-400 text-xs">⭐</span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
              {stars.toLocaleString()}
            </span>
            <span className="w-6 h-6 rounded-full bg-amber-400/20 group-hover:bg-amber-400 text-amber-300 group-hover:text-slate-950 flex items-center justify-center transition-colors">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              sounds.enabled = !soundEnabled;
              onToggleSound();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ios-glass-subtle hover:border-white/25 flex items-center justify-center text-slate-300 hover:text-white transition-all"
            title={soundEnabled ? "Tovushni o‘chirish" : "Tovushni yoqish"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
