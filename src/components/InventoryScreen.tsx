import React, { useState } from 'react';
import {
  CalendarItem,
  RARITY_CONFIG,
  UPGRADE_BOT_PAXTA_URL,
  openUpgradeBotInPaxta,
} from '../data/cases';
import {
  ArrowLeft,
  Search,
  Send,
  Coins,
  Sparkles,
  CheckCircle2,
  PackageOpen,
  ShieldCheck,
  Gem,
  Copy,
  Check,
  ExternalLink,
  Ticket,
  Gift,
  Clock,
} from 'lucide-react';

export interface WonInventoryItem {
  uid: string;
  item: CalendarItem;
  wonAt: string;
  caseName: string;
  withdrawn: boolean;
  withdrawnTo?: string;
  receiptCode?: string;
  withdrawStatus?: 'transferred' | 'queued_trade_ban';
  hoursLeft?: number;
}

export interface WonPaxtaGiftItem {
  uid: string;
  giftId: number;
  title: string;
  price: number;
  image: string;
  wonAt: string;
  caseName: string;
  sent: boolean;
  sentTo?: string;
}

export interface WonPromoItem {
  uid: string;
  code: string;
  title: string;
  stars: number;
  rewardType: 'stars' | 'gift';
  wonAt: string;
  caseName: string;
}

interface InventoryScreenProps {
  items: WonInventoryItem[];
  gifts: WonPaxtaGiftItem[];
  promos: WonPromoItem[];
  totalSpent: number;
  totalReturned: number;
  loyaltyPoints: number;
  onBack: () => void;
  onSelectItem: (item: CalendarItem) => void;
  onSellItemForStars: (uid: string) => void;
  onWithdrawItem: (won: WonInventoryItem) => void;
  onSendPaxtaGiftItem: (
    uid: string,
    targetUsername: string
  ) => Promise<{ ok: boolean; error?: string; message?: string }>;
  onSellPaxtaGiftItem: (uid: string) => void;
  onOpenShop: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  items,
  gifts,
  promos,
  loyaltyPoints,
  onBack,
  onSelectItem,
  onSellItemForStars,
  onWithdrawItem,
  onSendPaxtaGiftItem,
  onSellPaxtaGiftItem,
  onOpenShop,
}) => {
  const [search, setSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [giftUserMap, setGiftUserMap] = useState<Record<string, string>>({});
  const [giftLoadingUid, setGiftLoadingUid] = useState<string | null>(null);
  const [giftErrorMap, setGiftErrorMap] = useState<Record<string, string>>({});

  const activeItems = items.filter((w) => !w.withdrawn);
  const activeGifts = gifts.filter((g) => !g.sent);
  const totalNftValue = activeItems.reduce((acc, w) => acc + w.item.value, 0);
  const totalBuybackValue = activeItems.reduce((acc, w) => acc + w.item.buybackStars, 0);

  const filtered = items.filter(
    (w) =>
      w.item.model.toLowerCase().includes(search.toLowerCase()) ||
      String(w.item.number).includes(search) ||
      w.item.backdrop.toLowerCase().includes(search.toLowerCase())
  );

  const sellAllActive = () => {
    activeItems.forEach((w) => onSellItemForStars(w.uid));
  };

  const copyPromo = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSendGift = async (uid: string) => {
    const raw = (giftUserMap[uid] || '').replace(/^@/, '').trim();
    if (raw.length < 2) {
      setGiftErrorMap((prev) => ({ ...prev, [uid]: '@username kiriting!' }));
      return;
    }
    setGiftLoadingUid(uid);
    setGiftErrorMap((prev) => ({ ...prev, [uid]: '' }));
    const res = await onSendPaxtaGiftItem(uid, raw);
    setGiftLoadingUid(null);
    if (!res.ok) {
      setGiftErrorMap((prev) => ({ ...prev, [uid]: res.error || 'Xatolik' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4 space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full ios-glass-subtle flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Mening Sovg'alarim va Promokodlarim
            </h1>
            <p className="text-xs text-white/55">
              Desk Calendar NFTlar, @moon Rasmiy Giftlar hamda @UpgradeBot 1-martalik promokodlar
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenShop}
            className="px-4 py-2.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/35 text-sky-300 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Gem className="w-3.5 h-3.5 text-sky-400" />
            <span>Kafolat Do'koni ({loyaltyPoints} 💎)</span>
          </button>

          {activeItems.length > 0 && (
            <button
              onClick={sellAllActive}
              className="px-4 py-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Barchasini Starsga sotish (+{totalBuybackValue.toLocaleString()} ⭐)</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Glass Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="ios-glass rounded-[24px] p-5">
          <div className="text-xs text-white/55 font-medium mb-1">Faol NFT sovg'alar</div>
          <div className="text-2xl font-extrabold text-white">{activeItems.length} ta</div>
          <div className="text-[11px] text-white/40 mt-1">Jami yutilgan: {items.length} ta</div>
        </div>

        <div className="ios-glass rounded-[24px] p-5">
          <div className="text-xs text-white/55 font-medium mb-1">@moon Rasmiy Giftlar</div>
          <div className="text-2xl font-extrabold text-emerald-300">{activeGifts.length} ta</div>
          <div className="text-[11px] text-emerald-300/70 mt-1">1 soniyada profilga boradi</div>
        </div>

        <div className="ios-glass rounded-[24px] p-5">
          <div className="text-xs text-white/55 font-medium mb-1">@UpgradeBot Promokodlar</div>
          <div className="text-2xl font-extrabold text-purple-300">{promos.length} ta</div>
          <div className="text-[11px] text-purple-300/70 mt-1">1-martalik shaxsiy kodlar</div>
        </div>

        <div className="ios-glass rounded-[24px] p-5">
          <div className="text-xs text-white/55 font-medium mb-1">Sovg'alar bozor qiymati</div>
          <div className="text-2xl font-extrabold text-amber-400">
            ⭐ {totalNftValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-300/70 mt-1">50 ⭐ transfer bepul</div>
        </div>
      </div>

      {/* Official PaxtaGram Store Gifts (@moon Instant Delivery) Section */}
      {gifts.length > 0 && (
        <div className="ios-glass rounded-[28px] p-5 sm:p-6 space-y-4 border border-emerald-400/25">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              <span>Yutilgan Rasmiy PaxtaGram Giftlar ({gifts.length} ta)</span>
            </h2>
            <p className="text-xs text-white/55 mt-0.5">
              Ushbu sovg'alarda 48 soatlik Trade-Ban yo'q — <strong>@moon</strong> akauntimiz orqali 1 soniyada PaxtaGram profilingizga yuboriladi!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gifts.map((g) => (
              <div
                key={g.uid}
                className="ios-glass-subtle rounded-2xl p-4 flex flex-col justify-between gap-3 border border-emerald-400/20"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 p-2 flex items-center justify-center shrink-0">
                    <img src={g.image} alt={g.title} className="w-12 h-12 object-contain" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white">{g.title}</div>
                    <div className="text-xs font-bold text-amber-300">Qiymati: ⭐ {g.price}</div>
                    <div className="text-[10px] text-white/45 mt-0.5">
                      {g.caseName} • {g.wonAt}
                    </div>
                  </div>
                </div>

                {g.sent ? (
                  <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>@moon orqali yuborildi: {g.sentTo}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={giftUserMap[g.uid] ?? '@'}
                        onChange={(e) =>
                          setGiftUserMap((prev) => ({ ...prev, [g.uid]: e.target.value }))
                        }
                        placeholder="@username"
                        className="flex-1 bg-black/40 rounded-xl px-3 py-2 text-xs text-white font-semibold border border-white/15 focus:outline-none focus:border-emerald-400"
                      />
                      <button
                        onClick={() => handleSendGift(g.uid)}
                        disabled={giftLoadingUid === g.uid}
                        className="px-3 py-2 rounded-xl btn-ios-green text-xs font-extrabold flex items-center gap-1 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{giftLoadingUid === g.uid ? '...' : 'Yuborish'}</span>
                      </button>
                    </div>
                    {giftErrorMap[g.uid] && (
                      <div className="text-[11px] text-rose-400 font-semibold">
                        {giftErrorMap[g.uid]}
                      </div>
                    )}
                    <button
                      onClick={() => onSellPaxtaGiftItem(g.uid)}
                      className="w-full py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Starsga almashtirish (+{g.price} ⭐)</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* @UpgradeBot Promocodes Section (if any won) */}
      {promos.length > 0 && (
        <div className="ios-glass rounded-[28px] p-5 sm:p-6 space-y-4 border border-purple-400/25">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                <span>Yutilgan @UpgradeBot Promokodlar ({promos.length} ta)</span>
              </h2>
              <p className="text-xs text-white/55 mt-0.5">
                Har bir promokod haqiqiy <strong>@UpgradeBot</strong> tizimiga ulangan va faqat 1 marta amal qiladi
              </p>
            </div>
            <a
              href={UPGRADE_BOT_PAXTA_URL}
              onClick={(e) => openUpgradeBotInPaxta(e)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/35 text-purple-200 text-xs font-extrabold flex items-center gap-1.5"
            >
              <span>@UpgradeBot ni ochish (PaxtaGram)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {promos.map((p) => (
              <div
                key={p.uid}
                className="ios-glass-subtle rounded-2xl p-4 flex items-center justify-between gap-3 border border-purple-400/20"
              >
                <div>
                  <div className="text-xs font-bold text-purple-300">{p.title}</div>
                  <div className="font-mono text-base font-black text-amber-300 mt-0.5 select-all">
                    {p.code}
                  </div>
                  <div className="text-[10px] text-white/45 mt-0.5">
                    {p.caseName} • {p.wonAt}
                  </div>
                </div>
                <button
                  onClick={() => copyPromo(p.code)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  {copiedCode === p.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Olindi</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxa</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="NFT raqami yoki model bo'yicha qidirish..."
          className="w-full ios-glass-subtle rounded-full pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-sky-400/50 transition-all"
        />
      </div>

      {/* Inventory Grid */}
      {filtered.length === 0 ? (
        <div className="ios-glass rounded-[32px] p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <PackageOpen className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">NFT sovg'alar qutisi bo'sh</h3>
          <p className="text-xs text-white/55 leading-relaxed mb-6">
            Qutilarni oching yoki yig'ilgan{' '}
            <span className="text-sky-300 font-bold">{loyaltyPoints} 💎 Kafolat Ballaringiz</span>{' '}
            evaziga Kafolat Do'konidan 100% aniq NFT oling!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-full btn-ios-gold text-xs font-extrabold"
            >
              Qutilarni ko'rish
            </button>
            <button
              onClick={onOpenShop}
              className="px-6 py-3 rounded-full ios-glass-subtle hover:bg-white/10 text-sky-300 text-xs font-bold"
            >
              Kafolat Do'koni ({loyaltyPoints} 💎)
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((won) => {
            const rarityInfo = RARITY_CONFIG[won.item.rarity];
            return (
              <div
                key={won.uid}
                className={`ios-glass-card rounded-[28px] p-5 flex flex-col justify-between rarity-bar-${won.item.rarity}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: rarityInfo.bgSoft,
                        color: rarityInfo.color,
                      }}
                    >
                      {rarityInfo.label}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                      ⭐ {won.item.value.toLocaleString()}
                    </span>
                  </div>

                  <div
                    onClick={() => onSelectItem(won.item)}
                    className="flex items-center justify-center py-2 cursor-pointer"
                  >
                    <div
                      className="w-32 h-32 rounded-[26px] p-3 flex items-center justify-center relative overflow-hidden shadow-lg"
                      style={{
                        background: `radial-gradient(circle, ${won.item.backdropColors.center}, ${won.item.backdropColors.edge})`,
                      }}
                    >
                      <img
                        src={won.item.image}
                        alt={won.item.name}
                        className="w-24 h-24 object-contain drop-shadow-lg"
                      />
                      <span className="absolute bottom-2 right-2.5 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-extrabold text-white">
                        #{won.item.number}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-base font-extrabold text-white">
                      {won.item.name || `${won.item.title || 'Desk Calendar'} #${won.item.number}`}
                    </div>
                    <div className="text-xs text-white/55 mt-0.5">
                      {won.item.model} • {won.item.backdrop}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-white/10">
                  {won.withdrawn ? (
                    <div className="space-y-1.5">
                      {won.withdrawStatus === 'queued_trade_ban' ? (
                        <div className="w-full py-2 px-3 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-200 text-[11px] font-bold flex items-center justify-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">
                            Avto-Transfer ({won.withdrawnTo}) • 48s Trade-Ban
                          </span>
                        </div>
                      ) : (
                        <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span className="truncate">Yuborildi: {won.withdrawnTo}</span>
                        </div>
                      )}
                      {won.receiptCode && (
                        <div className="text-[10px] text-center text-white/45 font-mono flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>Check: {won.receiptCode}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => onWithdrawItem(won)}
                        className="w-full py-2.5 px-3 rounded-xl btn-ios-green text-xs font-extrabold flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>PaxtaGramga olish (@moon)</span>
                      </button>
                      <button
                        onClick={() => onSellItemForStars(won.uid)}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>Starsga almashtirish (+{won.item.buybackStars} ⭐)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
