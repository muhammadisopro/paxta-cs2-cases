import React from 'react';
import { CalendarItem, RARITY_CONFIG, CASES, CaseDefinition } from '../data/cases';
import { X, Sparkles, Box, ShieldCheck } from 'lucide-react';

interface ItemDetailModalProps {
  item: CalendarItem;
  isClaimed: boolean;
  onClose: () => void;
  onGoToCase: (c: CaseDefinition) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isClaimed,
  onClose,
  onGoToCase,
}) => {
  const rarityInfo = RARITY_CONFIG[item.rarity];
  const parentCase = CASES.find((c) => c.nftItems.some((n) => n.id === item.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[34px] ios-glass p-6 sm:p-7 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="-top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none absolute"
          style={{ background: rarityInfo.color }}
        />

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full ios-glass-subtle flex items-center justify-center text-white/60 hover:text-white absolute top-5 right-5 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <div
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold"
              style={{
                background: rarityInfo.bgSoft,
                color: rarityInfo.color,
                border: `1px solid ${rarityInfo.borderSoft}`,
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{rarityInfo.label} daraja</span>
            </div>
            {item.crafted && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/25 text-amber-300 border border-amber-400/45">
                ⚒️ CRAFT (Maxsus Yasama NFT)
              </span>
            )}
            {item.isBlackBackdrop && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-black/85 text-white border border-white/45">
                🖤 {item.backdrop.toUpperCase()} FON (O‘ta Noyob)
              </span>
            )}
          </div>

          <div
            className="w-44 h-44 rounded-[36px] p-4 flex items-center justify-center relative overflow-hidden shadow-2xl"
            style={{
              background: `radial-gradient(circle, ${item.backdropColors.center}, ${item.backdropColors.edge})`,
              border: '1px solid rgba(255,255,255,0.28)',
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-36 h-36 object-contain drop-shadow-2xl"
            />
            <span className="absolute bottom-2.5 right-3 px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-xs font-extrabold text-white">
              #{item.number}
            </span>
          </div>

          <h3 className="text-2xl font-extrabold text-white mt-4 tracking-tight">
            {item.name || `${item.title || 'Desk Calendar'} #${item.number}`}
          </h3>
          <p className="text-xs text-white/55 mt-0.5">
            {item.channelId === 100
              ? '@moon shaxsiy kolleksiyasidagi yagona nusxadagi NFT'
              : `PaxtaGram ${item.channelId || 2000001271} kanalidagi yagona nusxadagi NFT`}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-extrabold text-sm">
              Qiymati: ⭐ {item.value.toLocaleString()}
            </span>
            <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 font-bold text-xs">
              Almashuv: +{item.buybackStars} ⭐
            </span>
          </div>

          {/* Attributes Grid */}
          <div className="w-full grid grid-cols-3 gap-2.5 mt-5 text-left">
            <div className="ios-glass-subtle rounded-2xl p-3">
              <div className="text-[10px] text-white/45 font-semibold uppercase">Model</div>
              <div className="text-xs font-extrabold text-amber-300 truncate mt-0.5">
                {item.model}
              </div>
            </div>
            <div className="ios-glass-subtle rounded-2xl p-3">
              <div className="text-[10px] text-white/45 font-semibold uppercase">Orqa fon</div>
              <div className="text-xs font-extrabold text-sky-300 truncate mt-0.5">
                {item.backdrop}
              </div>
            </div>
            <div className="ios-glass-subtle rounded-2xl p-3">
              <div className="text-[10px] text-white/45 font-semibold uppercase">Naqsh</div>
              <div className="text-xs font-extrabold text-purple-300 truncate mt-0.5">
                {item.pattern}
              </div>
            </div>
          </div>

          <div className="w-full ios-glass-subtle rounded-2xl p-3.5 mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-white/75">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Holati:</span>
            </div>
            {isClaimed ? (
              <span className="font-bold text-rose-400">Yutib olingan (Qutidan chiqqan)</span>
            ) : (
              <span className="font-bold text-emerald-300">Mavjud (1 ta nusxa)</span>
            )}
          </div>

          {parentCase && !isClaimed && (
            <button
              onClick={() => {
                onClose();
                onGoToCase(parentCase);
              }}
              className="w-full mt-5 py-4 rounded-2xl btn-ios-gold font-extrabold text-sm flex items-center justify-center gap-2"
            >
              <Box className="w-4 h-4" />
              <span>
                {parentCase.name} ichidan ochish (⭐ {parentCase.price})
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
