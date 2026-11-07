import React, { useState } from 'react';
import {
  CaseDefinition,
  DropReward,
  RARITY_CONFIG,
  UPGRADE_BOT_PAXTA_URL,
  openUpgradeBotInPaxta,
} from '../data/cases';
import {
  ArrowLeft,
  RotateCcw,
  Send,
  Sparkles,
  Coins,
  CheckCircle2,
  ShieldCheck,
  Gem,
  Copy,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';

interface ResultModalProps {
  caseDef: CaseDefinition;
  reward: DropReward;
  mintedPromoCode?: string | null;
  totalOpened: number;
  totalSpent: number;
  totalReturned: number;
  pityCount: number;
  loyaltyPoints: number;
  earnedPoints: number;
  onOpenAgain: () => void;
  onSellForStars?: () => void;
  onWithdrawNft?: () => void;
  onSendPaxtaGift?: (targetUsername: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  onSellGiftForStars?: () => void;
  onOpenShop?: () => void;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  caseDef,
  reward,
  mintedPromoCode,
  totalOpened,
  totalSpent,
  totalReturned,
  pityCount,
  loyaltyPoints,
  earnedPoints,
  onOpenAgain,
  onSellForStars,
  onWithdrawNft,
  onSendPaxtaGift,
  onSellGiftForStars,
  onOpenShop,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [giftUsername, setGiftUsername] = useState('@');
  const [giftSending, setGiftSending] = useState(false);
  const [giftSentMsg, setGiftSentMsg] = useState<string | null>(null);
  const [giftError, setGiftError] = useState<string | null>(null);

  const rarityInfo = RARITY_CONFIG[reward.rarity];
  const returnPercent = totalSpent > 0 ? Math.round((totalReturned / totalSpent) * 100) : 100;
  const cal = reward.calendarItem;
  const buybackAmount = cal?.buybackStars || 350;

  const handleCopyPromo = () => {
    if (!mintedPromoCode) return;
    navigator.clipboard.writeText(mintedPromoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendOfficialGift = async () => {
    if (!onSendPaxtaGift) return;
    const raw = giftUsername.replace(/^@/, '').trim();
    if (raw.length < 2) {
      setGiftError("PaxtaGram @username kiriting!");
      return;
    }
    setGiftSending(true);
    setGiftError(null);
    const res = await onSendPaxtaGift(raw);
    setGiftSending(false);
    if (res.ok) {
      setGiftSentMsg(res.message || `🎁 Sovg'a @moon orqali @${raw} profiliga yuborildi!`);
    } else {
      setGiftError(res.error || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#050811]/95 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between px-4 sm:px-8 pt-6 pb-2">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2.5 text-white/80 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-full ios-glass-subtle flex items-center justify-center group-hover:bg-white/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">{caseDef.name}</span>
        </button>

        <div className="px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 border border-emerald-400/25 bg-emerald-500/10 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Rasmiy Tasdiqlandi</span>
        </div>
      </div>

      {/* Main Result Card */}
      <div className="max-w-xl w-full mx-auto px-4 py-4 my-auto">
        <div className="ios-glass rounded-[36px] p-6 sm:p-8 text-center relative overflow-hidden animate-pop-spring">
          {/* Ambient Rotating Glow */}
          <div
            className="-top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-40 pointer-events-none absolute"
            style={{ background: rarityInfo.color }}
          />

          {/* Rarity Badge */}
          <div
            className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{
              background: rarityInfo.bgSoft,
              color: rarityInfo.color,
              border: `1px solid ${rarityInfo.borderSoft}`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{rarityInfo.label} darajali yutuq</span>
          </div>

          {/* Reward Centerpiece */}
          <div className="relative z-10 flex items-center justify-center my-2">
            {reward.type === 'nft' && cal ? (
              <div
                className="w-44 h-44 rounded-[36px] p-4 flex items-center justify-center relative overflow-hidden shadow-2xl animate-float"
                style={{
                  background: `radial-gradient(circle, ${cal.backdropColors.center}, ${cal.backdropColors.edge})`,
                  border: '2px solid rgba(255,255,255,0.32)',
                }}
              >
                <img
                  src={cal.image}
                  alt={cal.name}
                  className="w-36 h-36 object-contain drop-shadow-2xl"
                />
                <span className="absolute bottom-2.5 right-3 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-xs font-extrabold text-white">
                  #{cal.number}
                </span>
              </div>
            ) : (
              <div className="w-40 h-40 rounded-[34px] ios-glass-subtle p-5 flex flex-col items-center justify-center shadow-2xl animate-float">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-28 h-28 object-contain"
                />
              </div>
            )}
          </div>

          {/* Title & Value */}
          <div className="relative z-10 mt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {reward.name}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-300 mt-1.5 font-semibold flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              {reward.type === 'nft' && cal
                ? `"Sovg'alarim" bo'limiga xavfsiz saqlandi (ID: PX-#${cal.number})`
                : reward.type === 'gift'
                ? `Rasmiy PaxtaGram Gift — @moon orqali 1 soniyada profilingizga yuboriladi!`
                : reward.type === 'promo'
                ? `@UpgradeBot uchun 1-martalik shaxsiy promokod yaratildi va "Sovg'alarim"da saqlandi!`
                : reward.type === 'ticket'
                ? `Bepul chipta darhol hisobingizga qo'shildi!`
                : `+${reward.starsAmount} ⭐ keshbek darhol balansingizga qo'shildi!`}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-extrabold text-base">
                {reward.type === 'nft' && cal
                  ? `Bozor qiymati: ⭐ ${cal.value.toLocaleString()}`
                  : reward.type === 'gift'
                  ? `Rasmiy Gift Qiymati: ⭐ ${reward.paxtaGiftPrice || reward.value}`
                  : reward.type === 'promo'
                  ? `@UpgradeBot Qiymati: ⭐ ${reward.value}`
                  : reward.type === 'ticket'
                  ? `Qiymati: ⭐ ${reward.value} (Bepul ochish)`
                  : `+${reward.starsAmount} ⭐ Balansga tushdi`}
              </span>

              {earnedPoints > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-bold text-xs">
                  <Gem className="w-3.5 h-3.5 text-sky-400" />
                  <span>+{earnedPoints} 💎 Kafolat Balli</span>
                </span>
              )}
            </div>
          </div>

          {/* Special Official PaxtaGram Gift (@moon Instant Delivery) Box */}
          {reward.type === 'gift' && (
            <div className="mt-5 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-amber-500/15 border border-emerald-400/35 p-4 text-left space-y-3">
              {giftSentMsg ? (
                <div className="flex items-center gap-2.5 text-emerald-300 text-xs sm:text-sm font-bold py-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{giftSentMsg}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider">
                      @moon Orqali 1 Soniyada Profilga Olish:
                    </span>
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                      Trade-Ban yo'q • Darhol
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={giftUsername}
                      onChange={(e) => {
                        setGiftUsername(e.target.value);
                        setGiftError(null);
                      }}
                      placeholder="@username kiriting"
                      className="flex-1 bg-black/45 rounded-2xl px-4 py-3 text-sm text-white font-semibold border border-white/15 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      onClick={handleSendOfficialGift}
                      disabled={giftSending}
                      className="px-4 py-3 rounded-2xl btn-ios-green text-xs font-extrabold flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{giftSending ? 'Yuborilmoqda...' : 'Profilga Yuborish'}</span>
                    </button>
                  </div>

                  {giftError && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{giftError}</span>
                    </div>
                  )}

                  {onSellGiftForStars && (
                    <button
                      onClick={onSellGiftForStars}
                      className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Yoki ichki Starsga almashtirish (+{reward.paxtaGiftPrice || reward.value} ⭐)</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Special @UpgradeBot Promo Code Voucher Box */}
          {reward.type === 'promo' && (
            <div className="mt-5 rounded-3xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-pink-500/20 border border-purple-400/40 p-4 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-purple-200 uppercase tracking-wider">
                  @UpgradeBot 1-Martalik Shaxsiy Kod:
                </span>
                <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Faqat 1 marta ishlaydi
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-black/45 rounded-2xl px-4 py-3 border border-white/15">
                <span className="font-mono text-lg sm:text-xl font-black text-amber-300 tracking-wider select-all">
                  {mintedPromoCode || 'YARATILMOQDA...'}
                </span>
                <button
                  onClick={handleCopyPromo}
                  disabled={!mintedPromoCode}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Nusxalandi</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Nusxalash</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-white/65">
                  Kodni PaxtaGram ichidagi <strong>@UpgradeBot</strong> Promokod bo'limiga kiriting.
                </span>
                <a
                  href={UPGRADE_BOT_PAXTA_URL}
                  onClick={(e) => openUpgradeBotInPaxta(e)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-300 hover:text-amber-200 shrink-0"
                >
                  <span>@UpgradeBot ga o'tish</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Clean iOS Attribute Pills (For NFT) or Pity + Loyalty Progress (For Bonus) */}
          {reward.type === 'nft' && cal ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 text-left">
              <div className="ios-glass-subtle rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-white/45 uppercase">Raqami</div>
                <div className="text-sm font-extrabold text-white mt-0.5">#{cal.number}</div>
              </div>
              <div className="ios-glass-subtle rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-white/45 uppercase">Model</div>
                <div className="text-sm font-extrabold text-amber-300 truncate mt-0.5">
                  {cal.model}
                </div>
              </div>
              <div className="ios-glass-subtle rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-white/45 uppercase">Orqa fon</div>
                <div className="text-sm font-extrabold text-sky-300 truncate mt-0.5">
                  {cal.backdrop}
                </div>
              </div>
              <div className="ios-glass-subtle rounded-2xl p-3">
                <div className="text-[10px] font-semibold text-white/45 uppercase">Naqsh</div>
                <div className="text-sm font-extrabold text-purple-300 truncate mt-0.5">
                  {cal.pattern}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2.5 text-left">
              {/* Pity Bar */}
              <div className="ios-glass-subtle rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-amber-300">Kafolat muhri (+1 qo'shildi)</span>
                  <span className="text-white">
                    {pityCount % caseDef.pityLimit} / {caseDef.pityLimit} muhr
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                    style={{
                      width: `${Math.max(15, ((pityCount % caseDef.pityLimit) / caseDef.pityLimit) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Spent Stars Guarantee Points Bar */}
              <div className="ios-glass-subtle rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                    <Gem className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Kafolat Do'koni: <span className="text-sky-300">{loyaltyPoints} 💎</span>
                    </div>
                    <div className="text-[11px] text-white/55">
                      Ballarni do'konda 100% aniq Kalendar NFT ga almashtiring!
                    </div>
                  </div>
                </div>
                {onOpenShop && (
                  <button
                    onClick={onOpenShop}
                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/35 text-sky-200 text-[11px] font-bold shrink-0"
                  >
                    Do'kon →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Session Transparency Stats */}
          <div className="mt-4 ios-glass-subtle rounded-2xl px-4 py-3 grid grid-cols-3 divide-x divide-white/10 text-left">
            <div className="pr-3">
              <div className="text-sm font-extrabold text-white">{totalOpened} ta</div>
              <div className="text-[11px] text-white/45 font-medium">Jami ochildi</div>
            </div>
            <div className="px-3">
              <div className="text-sm font-extrabold text-amber-300">
                ⭐ {totalReturned.toLocaleString()}
              </div>
              <div className="text-[11px] text-white/45 font-medium">Jami yutuq qiymati</div>
            </div>
            <div className="pl-3">
              <div className="text-sm font-extrabold text-emerald-400">{returnPercent}%</div>
              <div className="text-[11px] text-white/45 font-medium">Qaytim ko'rsatkichi</div>
            </div>
          </div>

          {/* Action Buttons for NFT (Sell for Stars OR Withdraw to PaxtaGram) */}
          {reward.type === 'nft' && cal && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {onWithdrawNft && (
                <button
                  onClick={onWithdrawNft}
                  className="w-full py-3.5 px-4 rounded-2xl btn-ios-green font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>PaxtaGramga olish (50 ⭐ bepul)</span>
                </button>
              )}
              {onSellForStars && (
                <button
                  onClick={onSellForStars}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Starsga almashtirish (+{buybackAmount} ⭐)</span>
                </button>
              )}
            </div>
          )}

          {/* Primary Open Again Button */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-4 rounded-2xl ios-glass-subtle hover:bg-white/10 text-white/80 font-bold text-sm transition-all"
            >
              Yopish
            </button>
            <button
              onClick={onOpenAgain}
              className="flex-1 py-4 px-6 rounded-2xl btn-ios-gold font-extrabold text-sm tracking-wide flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yana quti ochish (⭐ {caseDef.price})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
};
