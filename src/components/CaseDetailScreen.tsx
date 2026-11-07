import React from 'react';
import { ArrowLeft, Sparkles, ChevronRight, Ticket, Lock, ShieldCheck, RefreshCw } from 'lucide-react';
import { CaseDefinition, RARITY_CONFIG, CalendarItem, isNftClaimed } from '../data/cases';

interface CaseDetailScreenProps {
  caseDef: CaseDefinition;
  stars: number;
  tickets: number;
  pityCount: number;
  claimedNfts: number[];
  onBack: () => void;
  onOpenCase: (useTicket?: boolean) => void;
  onSelectCalendar: (item: CalendarItem) => void;
}

export const CaseDetailScreen: React.FC<CaseDetailScreenProps> = ({
  caseDef,
  tickets,
  pityCount,
  claimedNfts,
  onBack,
  onOpenCase,
  onSelectCalendar
}) => {
  const availableNftsCount = caseDef.nftItems.filter((i) => !isNftClaimed(i, claimedNfts)).length;
  const bonusRewards = caseDef.allRewards.filter(r => r.type !== 'nft');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-36 space-y-10">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white ios-glass-subtle hover:bg-white/[0.1] px-4 py-2 rounded-full transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Orqaga</span>
          </button>
          <span className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5">
            <span>Qutilar</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-semibold">{caseDef.name}</span>
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4" />
          <span>Bir marta tushgan NFT qayta tushmaydi</span>
        </div>
      </div>

      {/* Main Split Grid: Case Hero (Left) + Drop Rates (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left 7 Cols: Case Overview & Open Controls */}
        <div className="lg:col-span-7 ios-glass rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none"
            style={{ backgroundColor: caseDef.color }}
          />

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
            <div className="space-y-3 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
                  style={{
                    backgroundColor: `${caseDef.color}20`,
                    color: caseDef.color,
                    border: `1px solid ${caseDef.color}40`
                  }}
                >
                  {caseDef.tag}
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/[0.07] text-slate-200 border border-white/[0.1]">
                  Zaxira: {availableNftsCount} / {caseDef.nftItems.length} NFT qoldi
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {caseDef.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {caseDef.description}
              </p>

              <div className="pt-1 flex items-center justify-center sm:justify-start gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 block">Ochish narxi:</span>
                  <span className="text-xl sm:text-2xl font-extrabold text-amber-400">
                    ⭐ {caseDef.price} Stars
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <span className="text-[11px] text-slate-400 block">Kafolatli NFT muhrlari:</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-400">
                    {pityCount % caseDef.pityLimit} / {caseDef.pityLimit} muhr (Har 3 tadan 1 tasi NFT)
                  </span>
                </div>
              </div>
            </div>

            {/* 3D Crate Visual */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center shrink-0">
              <div
                className="absolute inset-0 rounded-full blur-2xl opacity-35"
                style={{ backgroundColor: caseDef.color }}
              />
              <img
                src={caseDef.crateImage}
                alt={caseDef.name}
                className="w-32 sm:w-40 h-auto object-contain relative z-10 animate-float drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Open Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 pt-6 border-t border-white/[0.08] relative z-10">
            <button
              onClick={() => onOpenCase(false)}
              className="btn-ios-gold py-4 px-6 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Qutini Ochish (⭐ {caseDef.price})</span>
            </button>

            {tickets > 0 ? (
              <button
                onClick={() => onOpenCase(true)}
                className="btn-ios-green py-4 px-6 text-sm font-bold flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Chipta bilan Bepul Ochish ({tickets} ta)</span>
              </button>
            ) : (
              <div className="ios-glass-subtle rounded-full py-3.5 px-5 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                <Ticket className="w-4 h-4 text-indigo-400" />
                <span>Bepul chiptalar quti ichidan tushadi</span>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Transparent Drop Rates Breakdown */}
        <div className="lg:col-span-5 ios-glass rounded-[32px] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Tushish Ehtimolliklari
              </h3>
              <span className="text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                100% Shaffof
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Har bir ochishda quyidagi 5 ta darajadan biri tasodifiy va kafolatlangan muhr asosida tushadi:
            </p>

            <div className="space-y-4">
              {[
                { key: 'mil-spec' as const, rate: caseDef.dropRates.milSpec },
                { key: 'restricted' as const, rate: caseDef.dropRates.restricted },
                { key: 'classified' as const, rate: caseDef.dropRates.classified },
                { key: 'covert' as const, rate: caseDef.dropRates.covert },
                { key: 'special' as const, rate: caseDef.dropRates.special }
              ].map(({ key, rate }) => {
                const cfg = RARITY_CONFIG[key];
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cfg.color, boxShadow: `0 0 8px ${cfg.color}` }}
                        />
                        <span className="font-bold text-white">{cfg.label}</span>
                        <span className="text-slate-400 text-[11px]">· {cfg.desc}</span>
                      </div>
                      <span className="font-bold" style={{ color: cfg.color }}>
                        {rate}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, rate)}%`,
                          backgroundColor: cfg.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              Yutilgan NFTni Starsga qayta sotish:
            </span>
            <span className="text-white font-semibold">Mavjud (Darhol)</span>
          </div>
        </div>
      </div>

      {/* Section 1: In-Game Cashback & Free Tickets in this Case */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Keshbek Paketlar va Bepul Chiptalar ({bonusRewards.length} xil)
          </h2>
          <p className="text-xs text-slate-400">
            NFT tushmagan taqdirda ham balansingizga Stars keshbek yoki qayta ochish chiptasi tushadi
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {bonusRewards.map((bonus) => {
            const rarity = RARITY_CONFIG[bonus.rarity];
            return (
              <div
                key={bonus.id}
                className="ios-glass-card p-4 flex flex-col justify-between items-center text-center"
              >
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start"
                  style={{
                    backgroundColor: rarity.bgSoft,
                    color: rarity.color,
                    border: `1px solid ${rarity.borderSoft}`
                  }}
                >
                  {rarity.label}
                </span>

                <div className="my-3 relative h-20 flex items-center justify-center">
                  <img
                    src={bonus.image}
                    alt={bonus.name}
                    className="h-16 w-auto object-contain drop-shadow-lg"
                  />
                </div>

                <div className="w-full">
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {bonus.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {bonus.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Unique NFTs in this Case */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {caseDef.isMoonEpic
                ? `@moon Shaxsiy Fondidagi Original NFT’lar (${caseDef.nftItems.length} ta)`
                : `Qutidagi Original Desk Calendar NFT’lar (${caseDef.nftItems.length} ta)`}
            </h2>
            <p className="text-xs text-slate-400">
              Har bir NFT faqat 1 donadan mavjud — yutib olingach o‘yindan chiqadi
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            {availableNftsCount} ta mavjud
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {caseDef.nftItems.map((item) => {
            const isClaimed = isNftClaimed(item, claimedNfts);
            const rarity = RARITY_CONFIG[item.rarity];
            return (
              <div
                key={item.id}
                onClick={() => onSelectCalendar(item)}
                className={`ios-glass-card p-4 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                  isClaimed ? 'opacity-45 grayscale-[70%]' : ''
                }`}
              >
                {isClaimed && (
                  <div className="absolute inset-0 z-20 bg-slate-950/70 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                    <Lock className="w-5 h-5 text-rose-400 mb-1" />
                    <span className="text-[11px] font-bold text-rose-300">
                      Yutib olingan
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Boshqa tushmaydi
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-1 z-10">
                  <div className="flex items-center gap-1">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: rarity.bgSoft,
                        color: rarity.color,
                        border: `1px solid ${rarity.borderSoft}`
                      }}
                    >
                      {rarity.label}
                    </span>
                    {item.crafted && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/25 text-amber-300 border border-amber-400/40">
                        ⚒️ CRAFT
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    #{item.number}
                  </span>
                </div>

                <div className="my-4 relative h-28 sm:h-32 flex items-center justify-center rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div
                    className="absolute w-24 h-24 rounded-full blur-xl opacity-35 group-hover:opacity-60 transition-opacity"
                    style={{ backgroundColor: item.backdropColors.center }}
                  />
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-24 sm:h-28 w-auto object-contain relative z-10 rounded-xl group-hover:scale-108 transition-transform duration-300 drop-shadow-lg"
                  />
                </div>

                <div className="space-y-1 z-10">
                  <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider truncate">
                    {item.title || 'Desk Calendar'} #{item.number}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {item.model}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Fon: {item.backdrop}
                  </p>
                  <div className="pt-2 mt-2 border-t border-white/[0.07] flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Qiymati:</span>
                    <span className="font-bold text-emerald-400">⭐ {item.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
