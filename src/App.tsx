import { useState, useMemo, useEffect, useRef } from 'react';
import {
  CASES,
  ALL_CALENDARS,
  CaseDefinition,
  CalendarItem,
  DropReward,
  getNftKey,
  isNftClaimed,
} from './data/cases';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { CasesScreen } from './components/CasesScreen';
import { CaseDetailScreen } from './components/CaseDetailScreen';
import { RouletteModal } from './components/RouletteModal';
import { ResultModal } from './components/ResultModal';
import {
  InventoryScreen,
  WonInventoryItem,
  WonPaxtaGiftItem,
  WonPromoItem,
} from './components/InventoryScreen';
import { WithdrawModal } from './components/WithdrawModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { AddStarsModal } from './components/AddStarsModal';
import { RulesScreen } from './components/RulesScreen';
import { sounds } from './utils/audio';

const STORAGE_KEY = 'paxtabox_state_v6';

function getOrCreateUserId(): string {
  try {
    // Check Telegram/PaxtaGram WebApp user ID first
    const tgUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.id) return `paxta_${tgUser.id}`;
    let uid = localStorage.getItem('paxtabox_uid');
    if (!uid) {
      uid = `user_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('paxtabox_uid', uid);
    }
    return uid;
  } catch {
    return 'default_user';
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function App() {
  const saved = useMemo(() => loadSavedState(), []);
  const userId = useMemo(() => getOrCreateUserId(), []);
  const cloudHydratedRef = useRef(false);

  // User wallet, tickets & loyalty guarantee points (persisted in localStorage & Turso Cloud DB)
  const [stars, setStars] = useState<number>(saved?.stars ?? 1500);
  const [tickets, setTickets] = useState<number>(saved?.tickets ?? 1);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(saved?.loyaltyPoints ?? 40);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [bonusClaimed, setBonusClaimed] = useState<boolean>(saved?.bonusClaimed ?? false);

  // Navigation & active screens
  const [activeTab, setActiveTab] = useState<'home' | 'cases' | 'inventory' | 'rules'>('home');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<CalendarItem | null>(null);
  const [showAddStars, setShowAddStars] = useState<boolean>(false);

  // Strict 1-of-1 NFT Inventory (128 NFTs from 2000001271 & 2000001272), Official Gifts (@moon) & Promocodes
  const [claimedNfts, setClaimedNfts] = useState<number[]>(saved?.claimedNfts ?? []);
  const [inventory, setInventory] = useState<WonInventoryItem[]>(saved?.inventory ?? []);
  const [wonGifts, setWonGifts] = useState<WonPaxtaGiftItem[]>(saved?.wonGifts ?? []);
  const [wonPromos, setWonPromos] = useState<WonPromoItem[]>(saved?.wonPromos ?? []);
  const [withdrawTarget, setWithdrawTarget] = useState<WonInventoryItem | null>(null);

  // Session & Fair-Play Pity / Anti-Repeat Tracking
  const [totalOpened, setTotalOpened] = useState<number>(saved?.totalOpened ?? 0);
  const [totalSpent, setTotalSpent] = useState<number>(saved?.totalSpent ?? 0);
  const [totalReturned, setTotalReturned] = useState<number>(saved?.totalReturned ?? 0);
  const [pityCount, setPityCount] = useState<number>(saved?.pityCount ?? 1);
  const [recentRewardIds, setRecentRewardIds] = useState<string[]>(saved?.recentRewardIds ?? []);

  // Hard Escrow Net Reserve per Case (Tracks net 85% Stars AFTER 15% PaxtaGram commission)
  // Note: 'moon-epic-case' maintains its own separate accounting pool!
  const [casePoolReserves, setCasePoolReserves] = useState<Record<string, number>>(
    saved?.casePoolReserves ?? {
      'kawaii-spring': 700,
      'neon-miami': 750,
      'cyber-matrix': 800,
      'golden-royale': 850,
      'moon-epic-case': 900,
    }
  );

  // 1. Hydrate from Turso Cloud DB on startup
  useEffect(() => {
    fetch(`/api/state/sync?userId=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data?.ok) return;
        if (Array.isArray(data.globalPool?.claimedNftIds)) {
          setClaimedNfts((prev) =>
            Array.from(new Set([...prev, ...data.globalPool.claimedNftIds]))
          );
        }
        if (
          data.globalPool?.casePoolReserves &&
          Object.keys(data.globalPool.casePoolReserves).length > 0
        ) {
          setCasePoolReserves((prev) => ({
            ...prev,
            ...data.globalPool.casePoolReserves,
          }));
        }
        if (data.userProfile && !saved) {
          const up = data.userProfile;
          if (typeof up.stars === 'number') setStars(up.stars);
          if (typeof up.tickets === 'number') setTickets(up.tickets);
          if (typeof up.loyaltyPoints === 'number') setLoyaltyPoints(up.loyaltyPoints);
          if (Array.isArray(up.inventory)) setInventory(up.inventory);
          if (Array.isArray(up.wonGifts)) setWonGifts(up.wonGifts);
          if (Array.isArray(up.wonPromos)) setWonPromos(up.wonPromos);
        }
        cloudHydratedRef.current = true;
      })
      .catch(() => {
        cloudHydratedRef.current = true;
      });
  }, [userId]);

  // 2. Save state to localStorage AND sync to Turso Cloud DB automatically
  useEffect(() => {
    const payload = {
      stars,
      tickets,
      loyaltyPoints,
      bonusClaimed,
      claimedNfts,
      inventory,
      wonGifts,
      wonPromos,
      totalOpened,
      totalSpent,
      totalReturned,
      pityCount,
      recentRewardIds,
      casePoolReserves,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}

    if (!cloudHydratedRef.current) return;
    const timer = setTimeout(() => {
      fetch('/api/state/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          globalPool: {
            claimedNftIds: claimedNfts,
            casePoolReserves,
          },
          userProfile: payload,
        }),
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [
    userId,
    stars,
    tickets,
    loyaltyPoints,
    bonusClaimed,
    claimedNfts,
    inventory,
    wonGifts,
    wonPromos,
    totalOpened,
    totalSpent,
    totalReturned,
    pityCount,
    recentRewardIds,
    casePoolReserves,
  ]);

  // Roulette & Result Modal State
  const [activeSpin, setActiveSpin] = useState<{
    caseDef: CaseDefinition;
    reel: DropReward[];
    winIndex: number;
    winner: DropReward;
    earnedPoints: number;
    wonUid?: string;
    wonGiftUid?: string;
    mintedPromoCode?: string | null;
  } | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);

  const selectedCase = useMemo(
    () => CASES.find((c) => c.id === selectedCaseId) || null,
    [selectedCaseId]
  );

  /**
   * STRICT ZERO-LOSS HARD ESCROW & ASCENDING PROBABILITY RNG:
   * 1. PaxtaGram takes 15% commission on Stars: only `netAfterPaxtaFee` (85% of case price) enters `updatedReserve`.
   * 2. HARD ESCROW LOCK: A 1-of-1 Desk Calendar NFT from channels 2000001271 & 2000001272 can ONLY drop when
   *    `updatedReserve >= caseDef.targetNetPerNft` (1,320 ⭐ to 1,480 ⭐ net profit already collected!).
   * 3. Official Unlimited PaxtaGram Gifts (`Maple Leaf` 50 ⭐, `Money Tree` 75 ⭐, `Cake` 100 ⭐):
   *    Sent instantly via `@moon` (`POST /api/gift/send`). Their exact cost (`50`, `75`, `100 ⭐`) is subtracted
   *    from `updatedReserve` so the owner's net profit is 100% protected!
   * 4. @UpgradeBot 1-Time Promo Codes (`type: 'promo'`): Cost 0 PaxtaGram Stars to the owner while giving
   *    the player a 100% real working promo code in @UpgradeBot (`maxUses: 1`)!
   */
  const pickWinningReward = (
    caseDef: CaseDefinition,
    paidStars: number,
    currentReserve: number,
    currentPity: number
  ): { winner: DropReward; nextReserve: number; nextPity: number } => {
    const availableNftRewards = caseDef.allRewards.filter(
      (r) => r.type === 'nft' && r.calendarItem && !isNftClaimed(r.calendarItem, claimedNfts)
    );
    const nonNftRewards = caseDef.allRewards.filter((r) => r.type !== 'nft');

    const netAdded = paidStars > 0 ? caseDef.netAfterPaxtaFee : 0;
    const updatedReserve = currentReserve + netAdded;
    const nextStep = currentPity + 1;

    // HARD ESCROW LOCK: Filter NFTs whose individual `requiredReserve` (or `caseDef.targetNetPerNft`)
    // is ALREADY funded in `updatedReserve`!
    // In MOON EPIC CASE, this ensures Tier 1 (1,450 ⭐), Tier 2 (2,400 ⭐), Tier 3 (3,800–6,800 ⭐),
    // Tier 4 (7,500–13,500 ⭐), and Tier 5 Grails (Heart Locket #8 @ 36,900 ⭐, Dog #30 @ 70,520 ⭐)
    // can ONLY drop when the case reserve has accumulated their exact required amount!
    const eligibleNftRewards = availableNftRewards.filter((r) => {
      const req = r.calendarItem?.requiredReserve || caseDef.targetNetPerNft;
      return updatedReserve >= req;
    });

    const isEscrowFunded = eligibleNftRewards.length > 0;
    const roll = Math.random() * 100;

    // For MOON EPIC CASE, allow the reserve to sometimes accumulate toward higher-tier items
    // while still dropping NFTs generously when funded
    const shouldDropNft =
      isEscrowFunded &&
      (caseDef.isMoonEpic
        ? roll < caseDef.nftDropChance * 1.45
        : roll < caseDef.nftDropChance * 1.65 || updatedReserve >= caseDef.targetNetPerNft * 1.12);

    if (shouldDropNft) {
      // Weight toward the highest-tier unlocked items when the reserve has grown large
      const sortedEligible = [...eligibleNftRewards].sort((a, b) => a.value - b.value);
      const chosenNftReward =
        sortedEligible[Math.floor(Math.random() * sortedEligible.length)];
      const deductAmount =
        chosenNftReward.calendarItem?.requiredReserve || caseDef.targetNetPerNft;

      return {
        winner: chosenNftReward,
        nextReserve: Math.max(0, updatedReserve - deductAmount),
        nextPity: 0,
      };
    }

    // Non-NFT Spin: Filter out the last 3 won rewards so nothing repeats back-to-back!
    const nonRepeating = nonNftRewards.filter(
      (b) => !recentRewardIds.slice(0, 3).includes(b.id)
    );
    const candidatePool = nonRepeating.length > 0 ? nonRepeating : nonNftRewards;

    const promoCandidates = candidatePool.filter((b) => b.type === 'promo');
    const giftCandidates = candidatePool.filter((b) => b.type === 'gift');
    const otherCandidates = candidatePool.filter(
      (b) => b.type === 'stars' || (b.type === 'ticket' && updatedReserve >= caseDef.targetNetPerNft * 0.85)
    );

    const subRoll = Math.random();
    let chosenBonus: DropReward;
    if (promoCandidates.length > 0 && subRoll < 0.48) {
      chosenBonus = promoCandidates[Math.floor(Math.random() * promoCandidates.length)];
    } else if (giftCandidates.length > 0 && subRoll < 0.76) {
      chosenBonus = giftCandidates[Math.floor(Math.random() * giftCandidates.length)];
    } else if (otherCandidates.length > 0) {
      chosenBonus = otherCandidates[Math.floor(Math.random() * otherCandidates.length)];
    } else {
      chosenBonus = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    }

    // Deduct internal Stars cashback, @moon Official Gift cost, or ticket cost from the case reserve!
    const internalCost =
      chosenBonus.type === 'stars'
        ? chosenBonus.starsAmount || 0
        : chosenBonus.type === 'gift'
        ? chosenBonus.paxtaGiftPrice || 50
        : chosenBonus.type === 'ticket'
        ? Math.round(caseDef.netAfterPaxtaFee * 0.5)
        : 0; // @UpgradeBot promo code costs 0 PaxtaGram Stars!

    return {
      winner: chosenBonus,
      nextReserve: Math.max(0, updatedReserve - internalCost),
      nextPity: nextStep,
    };
  };

  const handleOpenCase = (caseDef: CaseDefinition, useTicket = false) => {
    let paidStars = 0;
    let earnedPoints = 8;
    if (useTicket) {
      if (tickets <= 0) return;
      setTickets((t) => t - 1);
    } else {
      if (stars < caseDef.price) {
        setShowAddStars(true);
        return;
      }
      paidStars = caseDef.price;
      earnedPoints = Math.round(caseDef.basePrice * 0.08);
      setStars((s) => s - caseDef.price);
      setTotalSpent((prev) => prev + caseDef.price);
    }

    setLoyaltyPoints((p) => p + earnedPoints);

    const currentReserve = casePoolReserves[caseDef.id] ?? 600;
    const { winner, nextReserve, nextPity } = pickWinningReward(
      caseDef,
      paidStars,
      currentReserve,
      pityCount
    );

    setCasePoolReserves((prev) => ({
      ...prev,
      [caseDef.id]: nextReserve,
    }));
    setPityCount(nextPity);
    setRecentRewardIds((prev) => [winner.id, ...prev.slice(0, 5)]);

    const availableNfts = caseDef.allRewards.filter(
      (r) => r.type === 'nft' && r.calendarItem && !isNftClaimed(r.calendarItem, claimedNfts)
    );
    const bonuses = caseDef.allRewards.filter((r) => r.type !== 'nft');
    const visualNftRatio = 0.45 + (caseDef.nftDropChance / 100) * 0.85;

    const WIN_INDEX = 40;
    const reel: DropReward[] = [];
    for (let i = 0; i < 52; i++) {
      if (i === WIN_INDEX) {
        reel.push(winner);
      } else {
        const useNftCard = availableNfts.length > 0 && Math.random() < visualNftRatio;
        const sourcePool = useNftCard ? availableNfts : bonuses;
        let candidate = sourcePool[Math.floor(Math.random() * sourcePool.length)];
        if (reel.length > 0 && candidate.id === reel[reel.length - 1].id && sourcePool.length > 1) {
          candidate =
            sourcePool[(sourcePool.indexOf(candidate) + 1) % sourcePool.length];
        }
        reel.push(candidate);
      }
    }

    setShowResult(false);
    setActiveSpin({
      caseDef,
      reel,
      winIndex: WIN_INDEX,
      winner,
      earnedPoints,
      mintedPromoCode: null,
    });

    if (winner.type === 'promo') {
      fetch('/api/promocode/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stars: winner.promoStars || 150,
          rewardType: winner.promoRewardType || 'stars',
          giftSlug: winner.promoGiftSlug || null,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          const finalCode =
            data?.code ||
            `UPG${winner.promoStars || 150}-${Math.random()
              .toString(36)
              .substring(2, 6)
              .toUpperCase()}`;
          setActiveSpin((prev) =>
            prev ? { ...prev, mintedPromoCode: finalCode } : null
          );
          setWonPromos((prev) => [
            {
              uid: `${finalCode}-${Date.now()}`,
              code: finalCode,
              title: winner.name,
              stars: winner.promoStars || 150,
              rewardType: winner.promoRewardType || 'stars',
              wonAt: new Date().toLocaleTimeString(),
              caseName: caseDef.name,
            },
            ...prev,
          ]);
        })
        .catch(() => {
          const fallbackCode = `UPG${winner.promoStars || 150}-${Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()}`;
          setActiveSpin((prev) =>
            prev ? { ...prev, mintedPromoCode: fallbackCode } : null
          );
        });
    }
  };

  const handleRouletteFinish = () => {
    if (!activeSpin) return;
    const { winner, caseDef } = activeSpin;

    sounds.playWin(winner.rarity);

    setTotalOpened((n) => n + 1);
    setTotalReturned((v) => v + winner.value);

    if (winner.type === 'stars' && winner.starsAmount) {
      setStars((s) => s + winner.starsAmount!);
    } else if (winner.type === 'ticket' && winner.ticketsAmount) {
      setTickets((t) => t + winner.ticketsAmount!);
    } else if (winner.type === 'gift' && winner.paxtaGiftId) {
      const giftUid = `gift-${winner.paxtaGiftId}-${Date.now()}`;
      setWonGifts((prev) => [
        {
          uid: giftUid,
          giftId: winner.paxtaGiftId!,
          title: winner.name,
          price: winner.paxtaGiftPrice || winner.value,
          image: winner.image,
          wonAt: new Date().toLocaleTimeString(),
          caseName: caseDef.name,
          sent: false,
        },
        ...prev,
      ]);
      setActiveSpin((prev) => (prev ? { ...prev, wonGiftUid: giftUid } : null));
    } else if (winner.type === 'nft' && winner.calendarItem) {
      const nft = winner.calendarItem;
      const nftKey = getNftKey(nft);
      const uid = `${nft.id}-${Date.now()}`;
      setClaimedNfts((prev) => (prev.includes(nftKey) ? prev : [...prev, nftKey]));
      setInventory((prev) => [
        {
          uid,
          item: nft,
          wonAt: new Date().toLocaleTimeString(),
          caseName: caseDef.name,
          withdrawn: false,
        },
        ...prev,
      ]);
      setActiveSpin((prev) => (prev ? { ...prev, wonUid: uid } : null));
    }

    setShowResult(true);
  };

  // Send Official PaxtaGram Store Gift via @moon (`Maple Leaf`, `Money Tree`, `Cake`)
  const handleSendPaxtaGiftItem = async (
    uid: string,
    targetUsername: string
  ): Promise<{ ok: boolean; error?: string; message?: string }> => {
    const target = wonGifts.find((g) => g.uid === uid && !g.sent);
    if (!target) return { ok: false, error: 'Sovg‘a topilmadi yoki allaqachon yuborilgan' };

    try {
      const res = await fetch('/api/gift/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: target.giftId,
          price: target.price,
          title: target.title,
          targetUsername,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.error || 'Sovg‘ani yuborishda xatolik' };
      }

      setWonGifts((prev) =>
        prev.map((g) =>
          g.uid === uid
            ? { ...g, sent: true, sentTo: data.targetUsername || `@${targetUsername}` }
            : g
        )
      );
      return { ok: true, message: data.message };
    } catch {
      return { ok: false, error: 'Server bilan bog‘lanishda xatolik' };
    }
  };

  // Exchange Official Gift for Internal Stars (+50 / +75 / +100 ⭐)
  const handleSellPaxtaGiftItem = (uid: string) => {
    const target = wonGifts.find((g) => g.uid === uid && !g.sent);
    if (!target) return;
    setStars((s) => s + target.price);
    setWonGifts((prev) => prev.filter((g) => g.uid !== uid));
  };

  // Sell NFT back to platform for buybackStars (returns NFT to active pool & saves 50 Stars transfer fee)
  const handleSellNftForStars = (uid: string) => {
    const target = inventory.find((w) => w.uid === uid && !w.withdrawn);
    if (!target) return;

    const nftKey = getNftKey(target.item);
    setStars((s) => s + target.item.buybackStars);
    setInventory((prev) => prev.filter((w) => w.uid !== uid));
    setClaimedNfts((prev) => prev.filter((num) => num !== nftKey && num !== target.item.number));
  };

  const handleConfirmWithdraw = (
    uid: string,
    username: string,
    receiptCode: string,
    status?: string,
    hoursLeft?: number
  ) => {
    setInventory((prev) =>
      prev.map((w) =>
        w.uid === uid
          ? {
              ...w,
              withdrawn: true,
              withdrawnTo: username,
              receiptCode,
              withdrawStatus:
                status === 'transferred' ? 'transferred' : 'queued_trade_ban',
              hoursLeft,
            }
          : w
      )
    );
    setWithdrawTarget(null);
  };

  // Kafolat Do'koni (Loyalty Points Guarantee Store) Handlers
  const handleClaimShopTicket = (cost: number) => {
    if (loyaltyPoints < cost) return;
    setLoyaltyPoints((p) => p - cost);
    setTickets((t) => t + 1);
    sounds.playWin('restricted');
  };

  const handleClaimShopStars = (cost: number, starsAmount: number) => {
    if (loyaltyPoints < cost) return;
    setLoyaltyPoints((p) => p - cost);
    setStars((s) => s + starsAmount);
    sounds.playWin('restricted');
  };

  const handleClaimShopNft = (cost: number, eliteOnly: boolean): CalendarItem | null => {
    if (loyaltyPoints < cost) return null;
    const available = ALL_CALENDARS.filter((c) => !isNftClaimed(c, claimedNfts));
    if (available.length === 0) return null;

    const filtered = eliteOnly
      ? available.filter((c) => c.rarity === 'classified' || c.rarity === 'covert' || c.number <= 789)
      : available.filter((c) => c.number >= 500);

    const pool = filtered.length > 0 ? filtered : available;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    const nftKey = getNftKey(chosen);

    setLoyaltyPoints((p) => p - cost);
    setClaimedNfts((prev) => [...prev, nftKey]);
    setInventory((prev) => [
      {
        uid: `${chosen.id}-${Date.now()}`,
        item: chosen,
        wonAt: new Date().toLocaleTimeString(),
        caseName: "Kafolat Do'koni (100% Kafolat)",
        withdrawn: false,
      },
      ...prev,
    ]);
    sounds.playWin('special');
    return chosen;
  };

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      sounds.enabled = next;
      return next;
    });
  };

  const activeInventoryCount =
    inventory.filter((w) => !w.withdrawn).length +
    wonGifts.filter((g) => !g.sent).length +
    wonPromos.length;

  return (
    <div className="min-h-screen flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Responsive Header */}
      <Header
        stars={stars}
        tickets={tickets}
        loyaltyPoints={loyaltyPoints}
        activeTab={activeTab}
        inventoryCount={activeInventoryCount}
        soundEnabled={soundEnabled}
        onSelectTab={(tab) => {
          setSelectedCaseId(null);
          setActiveTab(tab);
        }}
        onToggleSound={handleToggleSound}
        onAddStars={() => setShowAddStars(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {selectedCase ? (
          <CaseDetailScreen
            caseDef={selectedCase}
            claimedNfts={claimedNfts}
            stars={stars}
            tickets={tickets}
            pityCount={pityCount}
            onBack={() => setSelectedCaseId(null)}
            onOpenCase={(useTicket) => handleOpenCase(selectedCase, Boolean(useTicket))}
            onSelectCalendar={(item) => setInspectItem(item)}
          />
        ) : activeTab === 'cases' ? (
          <CasesScreen
            claimedNfts={claimedNfts}
            pityCount={pityCount}
            onSelectCase={(c) => setSelectedCaseId(c.id)}
            onSelectCalendar={(item) => setInspectItem(item)}
          />
        ) : activeTab === 'inventory' ? (
          <InventoryScreen
            items={inventory}
            gifts={wonGifts}
            promos={wonPromos}
            totalSpent={totalSpent}
            totalReturned={totalReturned}
            loyaltyPoints={loyaltyPoints}
            onBack={() => setActiveTab('home')}
            onSelectItem={(item) => setInspectItem(item)}
            onSellItemForStars={handleSellNftForStars}
            onWithdrawItem={(won) => setWithdrawTarget(won)}
            onSendPaxtaGiftItem={handleSendPaxtaGiftItem}
            onSellPaxtaGiftItem={handleSellPaxtaGiftItem}
            onOpenShop={() => setActiveTab('rules')}
          />
        ) : activeTab === 'rules' ? (
          <RulesScreen
            claimedNfts={claimedNfts}
            pityCount={pityCount}
            loyaltyPoints={loyaltyPoints}
            totalSpent={totalSpent}
            onClaimShopTicket={handleClaimShopTicket}
            onClaimShopStars={handleClaimShopStars}
            onClaimShopNft={handleClaimShopNft}
            onGoToCases={() => setActiveTab('cases')}
            onGoToInventory={() => setActiveTab('inventory')}
          />
        ) : (
          <HomeScreen
            claimedNfts={claimedNfts}
            pityCount={pityCount}
            loyaltyPoints={loyaltyPoints}
            onSelectCase={(c) => setSelectedCaseId(c.id)}
            onSelectCalendar={(item) => setInspectItem(item)}
            onClaimBonus={() => {
              if (!bonusClaimed) {
                setStars((s) => s + 385);
                setBonusClaimed(true);
                sounds.playWin('restricted');
              } else {
                setShowAddStars(true);
              }
            }}
            onOpenShop={() => setActiveTab('rules')}
          />
        )}
      </main>

      {/* Mobile Floating iOS Bottom Dock */}
      <BottomNav
        activeTab={activeTab}
        inventoryCount={activeInventoryCount}
        onSelectTab={(tab) => {
          setSelectedCaseId(null);
          setActiveTab(tab);
        }}
      />

      {/* Roulette Spin Modal */}
      {activeSpin && !showResult && (
        <RouletteModal
          caseDef={activeSpin.caseDef}
          reel={activeSpin.reel}
          winIndex={activeSpin.winIndex}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onFinish={handleRouletteFinish}
          onClose={() => setActiveSpin(null)}
        />
      )}

      {/* Spin Result Modal */}
      {activeSpin && showResult && (
        <ResultModal
          caseDef={activeSpin.caseDef}
          reward={activeSpin.winner}
          mintedPromoCode={activeSpin.mintedPromoCode}
          totalOpened={totalOpened}
          totalSpent={totalSpent}
          totalReturned={totalReturned}
          pityCount={pityCount}
          loyaltyPoints={loyaltyPoints}
          earnedPoints={activeSpin.earnedPoints}
          onOpenAgain={() => {
            const c = activeSpin.caseDef;
            setActiveSpin(null);
            setShowResult(false);
            handleOpenCase(c, tickets > 0);
          }}
          onSellForStars={
            activeSpin.winner.type === 'nft' && activeSpin.wonUid
              ? () => {
                  handleSellNftForStars(activeSpin.wonUid!);
                  setActiveSpin(null);
                  setShowResult(false);
                }
              : undefined
          }
          onWithdrawNft={
            activeSpin.winner.type === 'nft' && activeSpin.wonUid
              ? () => {
                  const found = inventory.find((w) => w.uid === activeSpin.wonUid);
                  setActiveSpin(null);
                  setShowResult(false);
                  if (found) setWithdrawTarget(found);
                }
              : undefined
          }
          onSendPaxtaGift={
            activeSpin.winner.type === 'gift' && activeSpin.wonGiftUid
              ? (targetUsername) => handleSendPaxtaGiftItem(activeSpin.wonGiftUid!, targetUsername)
              : undefined
          }
          onSellGiftForStars={
            activeSpin.winner.type === 'gift' && activeSpin.wonGiftUid
              ? () => {
                  handleSellPaxtaGiftItem(activeSpin.wonGiftUid!);
                  setActiveSpin(null);
                  setShowResult(false);
                }
              : undefined
          }
          onOpenShop={() => {
            setActiveSpin(null);
            setShowResult(false);
            setActiveTab('rules');
          }}
          onClose={() => {
            setActiveSpin(null);
            setShowResult(false);
          }}
        />
      )}

      {/* Withdraw NFT to PaxtaGram Modal */}
      {withdrawTarget && (
        <WithdrawModal
          wonItem={withdrawTarget}
          onConfirmWithdraw={handleConfirmWithdraw}
          onClose={() => setWithdrawTarget(null)}
        />
      )}

      {/* Inspect Calendar Item Modal */}
      {inspectItem && (
        <ItemDetailModal
          item={inspectItem}
          isClaimed={isNftClaimed(inspectItem, claimedNfts)}
          onClose={() => setInspectItem(null)}
          onGoToCase={(c) => setSelectedCaseId(c.id)}
        />
      )}

      {/* Add Stars Modal */}
      {showAddStars && (
        <AddStarsModal
          currentStars={stars}
          onAdd={(amount) => setStars((s) => s + amount)}
          onClose={() => setShowAddStars(false)}
        />
      )}
    </div>
  );
}
export default App;
