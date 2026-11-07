import React, { useState } from 'react';
import { CASES, ALL_CALENDARS, ALL_NFT_ITEMS, CalendarItem, isNftClaimed } from '../data/cases';
import {
  ShieldCheck,
  Sparkles,
  Send,
  Award,
  RefreshCw,
  Lock,
  Gem,
  Ticket,
  CheckCircle2,
  Gift,
  Crown,
} from 'lucide-react';

interface RulesScreenProps {
  claimedNfts: number[];
  pityCount: number;
  loyaltyPoints: number;
  totalSpent: number;
  onClaimShopTicket: (cost: number) => void;
  onClaimShopStars: (cost: number, starsAmount: number) => void;
  onClaimShopNft: (cost: number, eliteOnly: boolean) => CalendarItem | null;
  onGoToCases: () => void;
  onGoToInventory: () => void;
}

export const RulesScreen: React.FC<RulesScreenProps> = ({
  claimedNfts,
  pityCount,
  loyaltyPoints,
  totalSpent,
  onClaimShopTicket,
  onClaimShopStars,
  onClaimShopNft,
  onGoToCases,
  onGoToInventory,
}) => {
  const [notice, setNotice] = useState<string | null>(null);
  const remainingCount = ALL_NFT_ITEMS.filter((i) => !isNftClaimed(i, claimedNfts)).length;

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4 space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {notice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full ios-glass border border-emerald-400/40 bg-emerald-950/90 text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl animate-pop-spring">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. KAFOLAT DO'KONI (SPENT STARS LOYALTY GUARANTEE SHOP)             */}
      {/* =================================================================== */}
      <div className="ios-glass rounded-[36px] p-6 sm:p-10 relative overflow-hidden">
        <div className="-top-24 -right-24 w-96 h-96 rounded-full bg-sky-500/15 blur-3xl pointer-events-none absolute" />
        <div className="-bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none absolute" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-bold">
              <Gem className="w-4 h-4 text-sky-400" />
              <span>Sarflangan Stars Himoyasi · 100% Ishonchli Tizim</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Kafolat Do'koni va Qoidalar
            </h1>
            <p className="text-sm sm:text-base text-white/65 leading-relaxed">
              Bizda sarflagan Starsingiz hech qachon kuymaydi! Har bir ochilgan quti uchun sizga{' '}
              <span className="text-sky-300 font-bold">💎 Kafolat Ballari</span> yig'iladi. Bu ballarga omadga bog'liq bo'lmagan holda{' '}
              <span className="text-white font-semibold">100% aniq Desk Calendar NFT, Bepul Chipta yoki Stars</span> xarid qilishingiz mumkin.
            </p>
          </div>

          {/* User Loyalty Balance Card */}
          <div className="ios-glass-subtle rounded-[28px] p-5 sm:p-6 min-w-[270px] border border-sky-400/25">
            <div className="text-xs font-semibold text-white/55">Sizning Kafolat Ballaringiz:</div>
            <div className="text-3xl sm:text-4xl font-black text-sky-300 mt-1 flex items-center gap-2">
              <Gem className="w-7 h-7 text-sky-400" />
              <span>{loyaltyPoints.toLocaleString()} 💎</span>
            </div>
            <div className="text-[11px] text-white/45 mt-2">
              Jami sarflangan: ⭐ {totalSpent.toLocaleString()} • Har 100 ⭐ = +15 💎
            </div>
          </div>
        </div>

        {/* 4 Guaranteed Shop Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-7">
          {/* Item 1: Free Case Ticket */}
          <div className="ios-glass-card rounded-[26px] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[11px] font-bold">
                  Tezkor Bonus
                </span>
                <span className="text-xs font-extrabold text-sky-300">45 💎</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center my-3 mx-auto">
                <Ticket className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-base font-extrabold text-white text-center">
                1x Bepul Quti Chiptasi
              </h3>
              <p className="text-xs text-white/55 text-center mt-1">
                Istalgan qutini Stars sarflamasdan bepul ochish huquqi
              </p>
            </div>
            <button
              disabled={loyaltyPoints < 45}
              onClick={() => {
                onClaimShopTicket(45);
                triggerNotice("1 ta Bepul Quti Chiptasi hisobingizga qo'shildi!");
              }}
              className={`w-full mt-5 py-3 rounded-2xl font-extrabold text-xs transition-all ${
                loyaltyPoints >= 45
                  ? 'btn-ios-green'
                  : 'bg-white/5 text-white/35 border border-white/10 cursor-not-allowed'
              }`}
            >
              {loyaltyPoints >= 45 ? '45 💎 evaziga olish' : `Yana ${45 - loyaltyPoints} 💎 kerak`}
            </button>
          </div>

          {/* Item 2: Instant 250 Stars Cashback */}
          <div className="ios-glass-card rounded-[26px] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold">
                  Naqd Stars
                </span>
                <span className="text-xs font-extrabold text-sky-300">60 💎</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center my-3 mx-auto text-2xl">
                ⭐
              </div>
              <h3 className="text-base font-extrabold text-white text-center">
                +250 Stars Balansga
              </h3>
              <p className="text-xs text-white/55 text-center mt-1">
                Darhol asosiy Stars hamyoningizga 250 ⭐ qo'shiladi
              </p>
            </div>
            <button
              disabled={loyaltyPoints < 60}
              onClick={() => {
                onClaimShopStars(60, 250);
                triggerNotice("+250 ⭐ Stars balansingizga muvaffaqiyatli qo'shildi!");
              }}
              className={`w-full mt-5 py-3 rounded-2xl font-extrabold text-xs transition-all ${
                loyaltyPoints >= 60
                  ? 'btn-ios-gold'
                  : 'bg-white/5 text-white/35 border border-white/10 cursor-not-allowed'
              }`}
            >
              {loyaltyPoints >= 60 ? '60 💎 evaziga olish' : `Yana ${60 - loyaltyPoints} 💎 kerak`}
            </button>
          </div>

          {/* Item 3: Guaranteed Standard Desk Calendar NFT */}
          <div className="ios-glass-card rounded-[26px] p-5 flex flex-col justify-between border border-emerald-400/25">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-bold">
                  100% Aniq NFT
                </span>
                <span className="text-xs font-extrabold text-sky-300">210 💎</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center my-3 mx-auto">
                <Gift className="w-8 h-8 text-emerald-300" />
              </div>
              <h3 className="text-base font-extrabold text-white text-center">
                Kafolatli Desk Calendar NFT
              </h3>
              <p className="text-xs text-white/55 text-center mt-1">
                2000001271 kanalidan mavjud original NFT to'g'ridan-to'g'ri "Sovg'alarim"ga tushadi
              </p>
            </div>
            <button
              disabled={loyaltyPoints < 210 || remainingCount === 0}
              onClick={() => {
                const won = onClaimShopNft(210, false);
                if (won) {
                  triggerNotice(`Tabriklaymiz! Desk Calendar #${won.number} Sovg'alarim bo'limiga qo'shildi!`);
                  setTimeout(() => onGoToInventory(), 1200);
                }
              }}
              className={`w-full mt-5 py-3 rounded-2xl font-extrabold text-xs transition-all ${
                loyaltyPoints >= 210 && remainingCount > 0
                  ? 'btn-ios-green'
                  : 'bg-white/5 text-white/35 border border-white/10 cursor-not-allowed'
              }`}
            >
              {loyaltyPoints >= 210 ? '210 💎 ga NFT olish' : `Yana ${210 - loyaltyPoints} 💎 kerak`}
            </button>
          </div>

          {/* Item 4: Guaranteed Elite Low-Number / Rare Model NFT */}
          <div className="ios-glass-card rounded-[26px] p-5 flex flex-col justify-between border border-amber-400/30">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                  VIP Kolleksiya
                </span>
                <span className="text-xs font-extrabold text-sky-300">330 💎</span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center my-3 mx-auto">
                <Crown className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-base font-extrabold text-white text-center">
                Elita / Kamyob Model NFT
              </h3>
              <p className="text-xs text-white/55 text-center mt-1">
                Past raqamli yoki noyob modelli Desk Calendar NFT 100% kafolat bilan beriladi
              </p>
            </div>
            <button
              disabled={loyaltyPoints < 330 || remainingCount === 0}
              onClick={() => {
                const won = onClaimShopNft(330, true);
                if (won) {
                  triggerNotice(`VIP Yutuq! Desk Calendar #${won.number} Sovg'alarim bo'limiga qo'shildi!`);
                  setTimeout(() => onGoToInventory(), 1200);
                }
              }}
              className={`w-full mt-5 py-3 rounded-2xl font-extrabold text-xs transition-all ${
                loyaltyPoints >= 330 && remainingCount > 0
                  ? 'btn-ios-gold'
                  : 'bg-white/5 text-white/35 border border-white/10 cursor-not-allowed'
              }`}
            >
              {loyaltyPoints >= 330 ? '330 💎 ga VIP NFT olish' : `Yana ${330 - loyaltyPoints} 💎 kerak`}
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. 4 CORE GUARANTEES (ZERO FEAR / ZERO CONFUSION)                   */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="ios-glass rounded-[28px] p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">1. 3-Qadam NFT Kafolati</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Har 3 ta quti ochilganda <span className="text-white font-semibold">kamida 1 marta 100% haqiqiy Desk Calendar NFT</span> chiqishi kafolatlangan. Joriy muhringiz: <span className="text-amber-300 font-bold">{pityCount % 3}/3</span>.
          </p>
        </div>

        <div className="ios-glass rounded-[28px] p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">2. Yagona Nusxa (1-of-1)</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            <span className="text-white font-semibold">2000001271 va 2000001272</span> kanallaridagi jami {ALL_CALENDARS.length} ta NFTning har biri faqat 1 marta tushadi. Yutib olingan NFT darhol qutidan chiqariladi (Hozir qolgan: <span className="text-emerald-300 font-bold">{remainingCount}/{ALL_CALENDARS.length}</span>).
          </p>
        </div>

        <div className="ios-glass rounded-[28px] p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-purple-300">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">3. @moon Rasmiy Gift & Stars</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Yutgan rasmiy Giftlaringiz (<span className="text-amber-300 font-semibold">Maple Leaf, Money Tree, Cake</span>) <span className="text-sky-300 font-bold">@moon</span> orqali 1 soniyada profilingizga yuboriladi yoki ichki Starsga almashtiriladi.
          </p>
        </div>

        <div className="ios-glass rounded-[28px] p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">4. 48s Trade-Ban & Bepul Transfer</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Yangi NFT kalendarlarda PaxtaGram <span className="text-amber-300 font-semibold">48 soatlik Trade-Ban</span> mavjud. Muddati tugaganlari darhol, qolganlari 48 soat to'lishi bilan avtomatik <span className="text-white font-semibold">@moon</span> orqali (50 ⭐ bepul) o'tkaziladi!
          </p>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. CASE BREAKDOWN TABLE                                             */}
      {/* =================================================================== */}
      <div className="ios-glass rounded-[32px] p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-white">5 Xil Quti va Sovg'alar Taqsimoti</h2>
          <p className="text-xs text-white/55 mt-1">
            @moon shaxsiy fondidagi 71 ta noyob aktiv (MOON EPIC CASE) hamda 2000001271 va 2000001272 kanallaridagi {ALL_CALENDARS.length} ta Desk Calendar NFT 5 ta qutiga bo'lingan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CASES.map((c) => {
            const avail = c.nftItems.filter((n) => !isNftClaimed(n, claimedNfts)).length;
            return (
              <div
                key={c.id}
                className="ios-glass-subtle rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={c.crateImage}
                    alt={c.name}
                    className="w-16 h-16 object-contain shrink-0"
                  />
                  <div>
                    <div className="text-base font-extrabold text-white">{c.name}</div>
                    <div className="text-xs text-white/55 mt-0.5">{c.subtitle}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white/85">
                        Qoldi: {avail}/{c.nftItems.length} NFT
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300">
                        +{Math.round(c.price * 0.15)} 💎 Kafolat balli
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-extrabold text-amber-300">⭐ {c.price}</div>
                  <div className="text-[11px] text-white/45">1 marta ochish</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onGoToCases}
            className="px-6 py-3.5 rounded-full btn-ios-gold font-extrabold text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Qutilarni ochishni boshlash</span>
          </button>
        </div>
      </div>
    </div>
  );
};
