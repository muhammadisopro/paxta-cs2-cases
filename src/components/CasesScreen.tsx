import React from 'react';
import { CASES, CaseDefinition, CalendarItem, isNftClaimed } from '../data/cases';
import { Sparkles, ShieldCheck, ArrowRight, Package, CheckCircle2, Ticket, Crown } from 'lucide-react';

interface CasesScreenProps {
  claimedNfts: number[];
  pityCount: number;
  onSelectCase: (c: CaseDefinition) => void;
  onSelectCalendar: (c: CalendarItem) => void;
}

export const CasesScreen: React.FC<CasesScreenProps> = ({
  claimedNfts,
  pityCount,
  onSelectCase,
  onSelectCalendar,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-32 space-y-8 animate-fade-in">
      {/* Top Header Strip for Cases Only */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>5 Xil Quti: @moon Shaxsiy Fondi (556,453 ⭐) + 128 ta Desk Calendar + 500+ ⭐ Kodlar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Maxsus NFT Qutilar (5 xil)
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Quti narxi oshgan sari NFT tushish ehtimoli oshib boradi (19% → 23% → 27% → 32% → 38% MOON EPIC)
          </p>
        </div>

        {/* Live Pity Pill */}
        <div className="ios-glass-subtle rounded-2xl px-4 py-3 flex items-center gap-3 border border-emerald-400/25 shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white">
              Kafolat Muhrlari:{' '}
              <span className="text-amber-300">{pityCount % 5} / 5 muhr</span>
            </div>
            <div className="text-[11px] text-white/55">
              Kamida 500 ⭐ – 2,500 ⭐ @UpgradeBot promokodlar
            </div>
          </div>
        </div>
      </div>

      {/* Focused Grid of All 5 Cases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {CASES.map((c) => {
          const availableNfts = c.nftItems.filter((i) => !isNftClaimed(i, claimedNfts));
          const previewNfts = availableNfts.slice(0, 4);

          return (
            <div
              key={c.id}
              onClick={() => onSelectCase(c)}
              className={`ios-glass-card rounded-[32px] p-6 sm:p-7 flex flex-col justify-between cursor-pointer relative overflow-hidden group ${
                c.isMoonEpic ? 'md:col-span-2 border-2 border-purple-400/50 shadow-2xl shadow-purple-500/20' : ''
              }`}
            >
              {/* Subtle Ambient Case Glow */}
              <div
                className="w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none absolute -top-20 -right-20 group-hover:opacity-35 transition-opacity"
                style={{ backgroundColor: c.color }}
              />

              <div>
                {/* Top Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 relative z-10">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${c.color}22`,
                      color: c.color,
                      border: `1px solid ${c.color}45`,
                    }}
                  >
                    {c.tag}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-300 border border-amber-400/30">
                      NFT Ehtimoli: {c.nftDropChance}%
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {availableNfts.length}/{c.nftItems.length} NFT
                      </span>
                    </span>
                  </div>
                </div>

                {/* Center Crate + Title Split */}
                <div className="flex flex-col sm:flex-row items-center gap-5 my-2 relative z-10">
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <div
                      className="w-28 h-28 rounded-full blur-2xl opacity-35 absolute"
                      style={{ backgroundColor: c.color }}
                    />
                    <img
                      src={c.crateImage}
                      alt={c.name}
                      className="w-32 h-32 object-contain relative z-10 group-hover:scale-108 transition-transform duration-300 drop-shadow-2xl"
                    />
                  </div>

                  <div className="text-center sm:text-left space-y-2">
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">
                      {c.name}
                    </h2>
                    <p className="text-xs text-white/65 leading-relaxed">{c.description}</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-200 bg-purple-500/15 border border-purple-400/30 px-2.5 py-1 rounded-full">
                        <Ticket className="w-3 h-3 text-purple-300" />
                        <span>@UpgradeBot 1-martalik promokodlar</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-400/25 px-2.5 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        <span>{c.nftDropChance}% Kalendar NFT</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top 4 NFTs inside this case */}
                <div className="mt-5 pt-4 border-t border-white/10 relative z-10">
                  <div className="text-[11px] font-semibold text-white/50 mb-2.5 flex items-center gap-1.5">
                    {c.isMoonEpic && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    <span>
                      {c.isMoonEpic
                        ? '@moon Shaxsiy Fondidagi Top Aktivlar (Heart Locket #8, Resistance Dog #30, Scared Cat #20):'
                        : 'Quti ichidagi original Desk Calendar NFTlar:'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5">
                    {previewNfts.map((nft) => (
                      <div
                        key={nft.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCalendar(nft);
                        }}
                        className="ios-glass-subtle rounded-2xl p-2 flex flex-col items-center text-center hover:border-white/30 transition-all"
                      >
                        <div
                          className="w-12 h-12 rounded-xl p-1 flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle, ${nft.backdropColors.center}, ${nft.backdropColors.edge})`,
                          }}
                        >
                          <img
                            src={nft.image}
                            alt={nft.name}
                            className="w-10 h-10 object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-white mt-1 truncate w-full">
                          {nft.title || 'Kalendar'} #{nft.number}
                        </span>
                        <span className="text-[9px] text-amber-300 font-bold truncate w-full">
                          ⭐ {nft.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Open Button & Price */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4 relative z-10">
                <div>
                  <span className="text-[11px] text-white/45 block">
                    Asl narxi: {c.basePrice} ⭐ + 15% komissiya
                  </span>
                  <span className="text-xl font-extrabold text-amber-300">
                    ⭐ {c.price} Stars
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCase(c);
                  }}
                  className="px-6 py-3.5 rounded-full btn-ios-gold text-xs sm:text-sm font-extrabold flex items-center gap-2"
                >
                  <span>Qutini Ochish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
