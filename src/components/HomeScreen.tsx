import React, { useState } from 'react';
import { Sparkles, Search, ShieldCheck, ArrowRight, Lock, CheckCircle2, Gift, Gem, Crown } from 'lucide-react';
import {
  CASES,
  CaseDefinition,
  ALL_CALENDARS,
  MOON_EPIC_ITEMS,
  ALL_NFT_ITEMS,
  RARITY_CONFIG,
  CalendarItem,
  isNftClaimed,
} from '../data/cases';

interface HomeScreenProps {
  claimedNfts: number[];
  pityCount: number;
  loyaltyPoints: number;
  onSelectCase: (c: CaseDefinition) => void;
  onSelectCalendar: (c: CalendarItem) => void;
  onClaimBonus: () => void;
  onOpenShop: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  claimedNfts,
  pityCount,
  loyaltyPoints,
  onSelectCase,
  onSelectCalendar,
  onClaimBonus,
  onOpenShop
}) => {
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'moon-epic' | 'crafted' | 'calendars'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'claimed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const moonEpicCase = CASES.find((c) => c.id === 'moon-epic-case') || CASES[CASES.length - 1];
  const goldenCase = CASES.find((c) => c.id === 'golden-royale') || CASES[3];
  const totalAvailable = ALL_NFT_ITEMS.filter((i) => !isNftClaimed(i, claimedNfts)).length;
  const craftedItems = ALL_NFT_ITEMS.filter((i) => i.crafted);

  // 4 Hero Showcase NFTs (Heart Locket #8, Resistance Dog #30, Scared Cat #20, Desk Calendar #98)
  const heroNfts = [
    MOON_EPIC_ITEMS.find((c) => c.slug === 'HeartLocket' && c.number === 8) || MOON_EPIC_ITEMS[1] || ALL_CALENDARS[0],
    MOON_EPIC_ITEMS.find((c) => c.slug === 'ResistanceDog' && c.number === 30) || MOON_EPIC_ITEMS[0] || ALL_CALENDARS[1],
    MOON_EPIC_ITEMS.find((c) => c.slug === 'ScaredCat' && c.number === 20) || MOON_EPIC_ITEMS[2] || ALL_CALENDARS[2],
    ALL_CALENDARS.find((c) => c.number === 98) || ALL_CALENDARS[0]
  ];

  // Filtered Catalog across 199 NFTs (71 @moon Profile Epic + 128 Channel Calendars)
  const sourceItems =
    sourceFilter === 'moon-epic'
      ? MOON_EPIC_ITEMS
      : sourceFilter === 'crafted'
      ? craftedItems
      : sourceFilter === 'calendars'
      ? ALL_CALENDARS
      : ALL_NFT_ITEMS;

  const filteredCalendars = sourceItems.filter((item) => {
    const isClaimed = isNftClaimed(item, claimedNfts);
    if (stockFilter === 'available' && isClaimed) return false;
    if (stockFilter === 'claimed' && !isClaimed) return false;
    if (selectedRarity !== 'all' && item.rarity !== selectedRarity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = String(item.number).includes(q);
      const matchName = item.name.toLowerCase().includes(q);
      const matchModel = item.model.toLowerCase().includes(q);
      const matchBackdrop = item.backdrop.toLowerCase().includes(q);
      return matchNum || matchName || matchModel || matchBackdrop;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-32 space-y-10 sm:space-y-14">
      {/* =================================================================== */}
      {/* 0. LIVE VERIFIED TRUST STRIP (Ishonch va Kafolat Lentasi)           */}
      {/* =================================================================== */}
      <div className="ios-glass-subtle rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 border border-emerald-400/20">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-white/85">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>
            <strong className="text-emerald-300">100% Rasmiy Kafolat:</strong> Barcha 128 ta Desk Calendar NFT (
            <span className="text-amber-300 font-bold">2000001271 & 2000001272</span>) va rasmiy Giftlar <span className="text-sky-300 font-bold">@moon</span> orqali egasiga yuboriladi.
          </span>
        </div>

        <button
          onClick={onOpenShop}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-sky-200 bg-sky-500/15 border border-sky-400/30 px-3 py-1 rounded-full transition-all"
        >
          <Gem className="w-3.5 h-3.5 text-sky-400" />
          <span>Kafolat Do‘koni: {loyaltyPoints} 💎 ballingiz bor →</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 1. HERO SHOWCASE (iOS 18 / visionOS Split Glass Card)               */}
      {/* =================================================================== */}
      <section className="ios-glass rounded-[32px] p-6 sm:p-8 lg:p-10 relative overflow-hidden">
        {/* Ambient Aura Blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          {/* Left Column: Typography, Pity Tracker & Actions */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ios-glass-subtle border-amber-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-200 tracking-tight">
                @moon Shaxsiy Fondi (71 NFT) + 2000001271/1272 (128 NFT) · {totalAvailable} / {ALL_NFT_ITEMS.length} ta NFT mavjud
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white leading-[1.15]">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-purple-400">Desk Calendar</span> va <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300">Moon Epic</span> NFT’larini yutib oling
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Har bir qutida yutqazish yo‘q: 199 ta original NFT (Heart Locket #8, Resistance Dog #30, Scared Cat #20, Desk Calendar #98), @moon orqali 1 soniyada profilga boradigan Rasmiy Giftlar hamda kamida <strong>500 ⭐ – 2,500 ⭐</strong> lik @UpgradeBot promokodlar!
            </p>

            {/* Guaranteed Pity Progress Bar */}
            <div className="ios-glass-subtle rounded-2xl p-4 max-w-xl">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Kafolatlangan NFT Tushish Shkalasi:
                </span>
                <span className="text-amber-300 font-bold">
                  {pityCount % 3} / 3 muhr
                </span>
              </div>
              <div className="w-full h-2.5 bg-white/[0.07] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.max(15, ((pityCount % 3) / 3) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                @UpgradeBot promokodlari kamida 500 ⭐ dan boshlanadi!
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onSelectCase(moonEpicCase)}
                className="btn-ios-gold px-6 py-3.5 text-sm font-bold flex items-center gap-2.5"
              >
                <Crown className="w-4 h-4" />
                <span>MOON EPIC CASE (⭐ {moonEpicCase.price})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectCase(goldenCase)}
                className="ios-glass hover:bg-white/[0.12] px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-amber-200 border border-amber-400/30 flex items-center gap-2 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Oltin Quti (⭐ {goldenCase.price})</span>
              </button>

              <button
                onClick={onOpenShop}
                className="ios-glass hover:bg-white/[0.12] px-5 py-3.5 rounded-full text-xs sm:text-sm font-semibold text-sky-200 border border-sky-400/30 flex items-center gap-2 transition-all active:scale-95"
              >
                <Gem className="w-4 h-4 text-sky-400" />
                <span>Kafolat Do‘koni ({loyaltyPoints} 💎)</span>
              </button>

              <button
                onClick={onClaimBonus}
                className="ios-glass-subtle hover:bg-white/[0.10] px-4 py-3.5 rounded-full text-xs font-semibold text-amber-200 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span>⭐ Balansni To‘ldirish</span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean 3D Glass Stage with 4 Showcase NFTs */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-4">
            <div
              onClick={() => onSelectCase(moonEpicCase)}
              className="cursor-pointer relative group flex items-center justify-center"
            >
              <div className="absolute w-56 h-56 rounded-full bg-purple-500/25 blur-3xl group-hover:bg-amber-400/35 transition-all" />
              <img
                src="/crates/crate-moon-epic.svg"
                alt="MOON EPIC CASE"
                className="w-48 sm:w-56 h-auto object-contain relative z-10 animate-float drop-shadow-2xl"
              />
            </div>

            {/* 4 Clean Glass Pills showing Top NFTs */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-md mt-4">
              {heroNfts.map((nft) => (
                <div
                  key={nft.id}
                  onClick={() => onSelectCalendar(nft)}
                  className="ios-glass-card p-2 rounded-2xl cursor-pointer flex flex-col items-center text-center group"
                >
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                    <div
                      className="absolute inset-1 rounded-full blur-md opacity-40"
                      style={{ backgroundColor: nft.backdropColors.center }}
                    />
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 object-contain relative z-10 rounded-xl group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white mt-1 truncate w-full">
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
      </section>

      {/* =================================================================== */}
      {/* 2. FIVE CASES GRID (4 Desk Calendar Cases + 5. MOON EPIC CASE)      */}
      {/* =================================================================== */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Maxsus NFT Qutilar (5 xil)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              4 ta Desk Calendar qutisi + @moon shaxsiy kolleksiyasidagi <strong>5. MOON EPIC CASE</strong> (556,453 ⭐ fond)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Kamida 500 ⭐ @UpgradeBot promokodlar + 50 ⭐ bepul transfer</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {CASES.map((cs) => {
            const remaining = cs.nftItems.filter((i) => !isNftClaimed(i, claimedNfts)).length;
            return (
              <div
                key={cs.id}
                onClick={() => onSelectCase(cs)}
                className={`ios-glass-card p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                  cs.isMoonEpic ? 'border-2 border-purple-400/50 shadow-xl shadow-purple-500/15' : ''
                }`}
              >
                {/* Subtle Top Corner Glow */}
                <div
                  className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-2xl opacity-25 group-hover:opacity-45 transition-opacity pointer-events-none"
                  style={{ backgroundColor: cs.color }}
                />

                {/* Card Top Header */}
                <div className="flex items-center justify-between gap-2 z-10">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"
                    style={{
                      backgroundColor: `${cs.color}20`,
                      color: cs.color,
                      border: `1px solid ${cs.color}40`
                    }}
                  >
                    {cs.tag}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-300 bg-white/[0.06] px-2.5 py-1 rounded-full border border-white/[0.08]">
                    {remaining} / {cs.nftItems.length} NFT qoldi
                  </span>
                </div>

                {/* 3D Crate Visual */}
                <div className="my-6 relative h-36 flex items-center justify-center">
                  <div
                    className="absolute w-28 h-28 rounded-full blur-2xl opacity-30 group-hover:opacity-55 transition-opacity"
                    style={{ backgroundColor: cs.color }}
                  />
                  <img
                    src={cs.crateImage}
                    alt={cs.name}
                    className="h-32 w-auto object-contain relative z-10 group-hover:scale-108 transition-transform duration-300 drop-shadow-xl"
                  />
                </div>

                {/* Case Info */}
                <div className="space-y-1.5 z-10">
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-amber-200 transition-colors">
                    {cs.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cs.description}
                  </p>
                </div>

                {/* Price & Action Footer */}
                <div className="pt-5 mt-5 border-t border-white/[0.08] flex items-center justify-between z-10">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Ochish narxi</span>
                    <span className="text-base font-extrabold text-amber-400">
                      ⭐ {cs.price}
                    </span>
                  </div>

                  <span
                    className="px-4 py-2 rounded-full text-xs font-bold text-slate-950 flex items-center gap-1.5 shadow-md group-hover:translate-x-0.5 transition-transform"
                    style={{ backgroundColor: cs.color }}
                  >
                    <span>Ochish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. ALL 199 NFTs CATALOG (71 Moon Epic + 128 Channel Calendars)      */}
      {/* =================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Barcha Original NFT Sovg‘alar Zaxirasi ({filteredCalendars.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              @moon shaxsiy fondidagi 71 ta noyob aktiv (Heart Locket #8, Resistance Dog #30, Scared Cat #20) va 128 ta Desk Calendar NFT
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Heart Locket, #8, #98 yoki model..."
              className="w-full ios-glass-subtle rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 outline-none focus:border-white/30 transition-all"
            />
          </div>
        </div>

        {/* Source Collection Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              sourceFilter === 'all'
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md'
                : 'ios-glass-subtle text-slate-300 hover:text-white'
            }`}
          >
            Barcha NFTlar ({ALL_NFT_ITEMS.length})
          </button>
          <button
            onClick={() => setSourceFilter('moon-epic')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              sourceFilter === 'moon-epic'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'ios-glass-subtle text-purple-300 hover:text-white border border-purple-400/30'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>5. MOON EPIC Fondi ({MOON_EPIC_ITEMS.length} ta · 560k ⭐)</span>
          </button>
          <button
            onClick={() => setSourceFilter('crafted')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              sourceFilter === 'crafted'
                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 shadow-md'
                : 'ios-glass-subtle text-amber-300 hover:text-white border border-amber-400/30'
            }`}
          >
            <span>⚒️ Craft NFTlar ({craftedItems.length} ta · 1,250+ ⭐)</span>
          </button>
          <button
            onClick={() => setSourceFilter('calendars')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              sourceFilter === 'calendars'
                ? 'bg-sky-400 text-slate-950 shadow-md'
                : 'ios-glass-subtle text-sky-300 hover:text-white'
            }`}
          >
            Desk Calendar Kanallari ({ALL_CALENDARS.length} ta)
          </button>
        </div>

        {/* Filter Bar: Stock & Rarity */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Stock status tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-full ios-glass-subtle">
            <button
              onClick={() => setStockFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                stockFilter === 'all' ? 'bg-white text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Barchasi ({ALL_NFT_ITEMS.length})
            </button>
            <button
              onClick={() => setStockFilter('available')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                stockFilter === 'available' ? 'bg-emerald-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Mavjud ({totalAvailable})
            </button>
            <button
              onClick={() => setStockFilter('claimed')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                stockFilter === 'claimed' ? 'bg-rose-500 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              Yutib olingan ({ALL_NFT_ITEMS.length - totalAvailable})
            </button>
          </div>

          {/* Rarity Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedRarity('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedRarity === 'all'
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'ios-glass-subtle text-slate-300 hover:text-white'
              }`}
            >
              Barcha darajalar
            </button>
            {Object.entries(RARITY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSelectedRarity(key)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap"
                style={{
                  backgroundColor: selectedRarity === key ? cfg.bgSoft : 'rgba(255,255,255,0.03)',
                  borderColor: selectedRarity === key ? cfg.color : 'rgba(255,255,255,0.08)',
                  color: cfg.color
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Responsive Apple Grid (2 cols mobile, 3 tablet, 4-5 desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {filteredCalendars.map((item) => {
            const isClaimed = isNftClaimed(item, claimedNfts);
            const rarity = RARITY_CONFIG[item.rarity];
            return (
              <div
                key={item.id}
                onClick={() => onSelectCalendar(item)}
                className={`ios-glass-card p-4 flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                  isClaimed ? 'opacity-50 grayscale-[60%]' : ''
                }`}
              >
                {/* Claimed Overlay Pill */}
                {isClaimed && (
                  <div className="absolute inset-0 z-20 bg-slate-950/65 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Yutib olingan
                    </span>
                  </div>
                )}

                {/* Top Row: Rarity, Craft Badge & Number */}
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
                    {item.isBlackBackdrop && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-black/80 text-white border border-white/40">
                        🖤 BLACK
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    #{item.number}
                  </span>
                </div>

                {/* Rounded Squircle Image Stage */}
                <div className="my-4 relative h-28 sm:h-32 flex items-center justify-center rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.05]">
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

                {/* Details Footer */}
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
