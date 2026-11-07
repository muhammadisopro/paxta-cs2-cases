import allCalendarsData from './allCalendars.json';
import moonEpicItemsData from './moonEpicItems.json';

export interface CalendarItem {
  id: string;
  giftId: number;
  channelId?: number;
  slug?: string;
  title?: string;
  number: number;
  name: string;
  model: string;
  backdrop: string;
  pattern: string;
  backdropColors: {
    center: string;
    edge: string;
    text: string;
  };
  image: string;
  link: string;
  tradeLockedUntil?: string | null;
  rarity: 'mil-spec' | 'restricted' | 'classified' | 'covert' | 'special';
  value: number; // Market / Collector Value in Stars
  buybackStars: number; // In-app exchange value in Stars
  requiredReserve?: number; // Strict escrow reserve needed before this specific NFT can drop
}

// 1. 128 Desk Calendar NFTs from Channels 2000001271 & 2000001272
export const ALL_CALENDARS: CalendarItem[] = (allCalendarsData as any[]).map((item) => {
  let marketValue = item.value;
  let buyback = 350;
  if (item.number < 100) {
    marketValue = 5000;
    buyback = 1400;
  } else if (item.number <= 110) {
    marketValue = 2500;
    buyback = 850;
  } else if (item.number <= 130) {
    marketValue = 1600;
    buyback = 600;
  } else if (item.rarity === 'classified') {
    marketValue = 1200;
    buyback = 450;
  } else if (item.rarity === 'restricted') {
    marketValue = 850;
    buyback = 360;
  } else {
    marketValue = 680;
    buyback = 300;
  }
  return {
    ...item,
    slug: item.slug || 'DeskCalendar',
    title: item.title || 'Desk Calendar',
    value: marketValue,
    buybackStars: buyback,
  };
});

// 2. 71 Exclusive NFTs from @moon Personal Profile (Strictly excluding the 4 protected NFTs!)
// Each item has a strict `requiredReserve` in the separate `moon-epic-case` escrow pool
// so total net profit across all 71 items exceeds +335,000 Stars with 0% risk of early grail loss!
export const MOON_EPIC_ITEMS: CalendarItem[] = (moonEpicItemsData as any[]).map((item) => {
  const val = Number(item.value) || 1000;
  let reqReserve = 1450;
  if (val >= 40000) {
    // Heart Locket #8 (45k) & Resistance Dog #30 (86k)
    reqReserve = Math.round(val * 0.82);
  } else if (val >= 20000) {
    // Scared Cat #20 (33.3k), Scared Cat #10 (28k), Scared Cat #99 (22k), Precious Peach #9 (20k)
    reqReserve = Math.round(val * 0.78);
  } else if (val >= 10000) {
    // Mask #5, #99, #100, Scared Cat #35, Precious Peach #36, #90, #179
    reqReserve = Math.round(val * 0.72);
  } else if (val >= 5000) {
    // Masks & Precious Peaches & 1-Digit Desk Calendars (#5, #6, #10)
    reqReserve = Math.max(3800, Math.round(val * 0.68));
  } else if (val >= 1500) {
    // Star Notepads & Low-Number Calendars (#30, #33, #54)
    reqReserve = 2400;
  } else {
    // Lol Pop & B-Day Candle & Standard Profile Calendars
    reqReserve = 1450;
  }

  return {
    ...item,
    requiredReserve: reqReserve,
  };
});

export const ALL_NFT_ITEMS: CalendarItem[] = [...MOON_EPIC_ITEMS, ...ALL_CALENDARS];

export function getNftKey(item: CalendarItem): number {
  return item.giftId || item.number;
}

export function isNftClaimed(item: CalendarItem, claimedNfts: number[]): boolean {
  return claimedNfts.includes(getNftKey(item));
}

export type RewardType = 'nft' | 'gift' | 'stars' | 'ticket' | 'promo';

export interface DropReward {
  id: string;
  type: RewardType;
  name: string;
  subtitle: string;
  image: string;
  rarity: 'mil-spec' | 'restricted' | 'classified' | 'covert' | 'special';
  value: number; // Display value in Stars
  starsAmount?: number;
  ticketsAmount?: number;
  promoStars?: number;
  promoRewardType?: 'stars' | 'gift';
  promoGiftSlug?: string;
  paxtaGiftId?: number; // Official PaxtaGram Store Gift ID (1=Maple Leaf, 2=Money Tree, 6=Cake)
  paxtaGiftPrice?: number; // Cost in Stars on PaxtaGram Store (50, 75, 100)
  paxtaGiftTitle?: string;
  calendarItem?: CalendarItem;
}

export interface CaseDefinition {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  isMoonEpic?: boolean; // Separate accounting & @moon profile vault
  basePrice: number;
  price: number;
  netAfterPaxtaFee: number;
  nftDropChance: number;
  targetNetPerNft: number;
  pityLimit: number;
  color: string;
  accentGlow: string;
  crateImage: string;
  description: string;
  dropRates: {
    milSpec: number;
    restricted: number;
    classified: number;
    covert: number;
    special: number;
  };
  nftItems: CalendarItem[];
  allRewards: DropReward[];
}

function nftToReward(c: CalendarItem): DropReward {
  const shortTitle = c.title && c.title !== 'Desk Calendar' ? c.title : 'Kalendar';
  return {
    id: `nft-${c.id}`,
    type: 'nft',
    name: `${shortTitle} #${c.number}`,
    subtitle: `${c.model} · ${c.backdrop}`,
    image: c.image,
    rarity: c.rarity,
    value: c.value,
    calendarItem: c,
  };
}

function createPaxtaGiftReward(
  idSuffix: string,
  paxtaGiftId: number,
  paxtaGiftTitle: string,
  paxtaGiftPrice: number,
  image: string,
  rarity: DropReward['rarity'],
  name: string,
  subtitle: string
): DropReward {
  return {
    id: `reward-gift-${idSuffix}-${paxtaGiftId}`,
    type: 'gift',
    name,
    subtitle,
    image,
    rarity,
    value: paxtaGiftPrice,
    paxtaGiftId,
    paxtaGiftPrice,
    paxtaGiftTitle,
  };
}

function createStarsReward(
  idSuffix: string,
  amount: number,
  rarity: DropReward['rarity'],
  name: string,
  subtitle: string
): DropReward {
  return {
    id: `reward-stars-${idSuffix}-${amount}`,
    type: 'stars',
    name,
    subtitle,
    image: '/prizes/stars-pack.svg',
    rarity,
    value: amount,
    starsAmount: amount,
  };
}

function createPromoReward(
  idSuffix: string,
  promoStars: number,
  rarity: DropReward['rarity'],
  name: string,
  subtitle: string,
  promoRewardType: 'stars' | 'gift' = 'stars',
  promoGiftSlug?: string
): DropReward {
  return {
    id: `reward-promo-${idSuffix}-${promoStars}`,
    type: 'promo',
    name,
    subtitle,
    image: '/prizes/promo-code.svg',
    rarity,
    value: promoStars,
    promoStars,
    promoRewardType,
    promoGiftSlug,
  };
}

function createTicketReward(
  idSuffix: string,
  count: number,
  worth: number,
  rarity: DropReward['rarity'],
  name: string,
  subtitle: string
): DropReward {
  return {
    id: `reward-ticket-${idSuffix}-${count}`,
    type: 'ticket',
    name,
    subtitle,
    image: '/prizes/ticket.svg',
    rarity,
    value: worth,
    ticketsAmount: count,
  };
}

const goldenKeywords = ['Gold', 'Amber', 'Hodler', 'Fund', 'Durov', 'Satin', 'Caramel', 'Platinum'];
const cyberKeywords = [
  'Blueprint',
  'Sherlock',
  'Black',
  'Dark',
  'Monochrome',
  'Deep',
  'Sapphire',
  'Onyx',
  'Azure',
  'Electric Indigo',
  'Silver',
];
const neonKeywords = [
  'Miami',
  'Beach',
  'Burning',
  'Highlighter',
  'Coral',
  'Orange',
  'Carrot',
  'Fandango',
  'Neon',
  'Red',
  'Purple',
];

const case1Nfts = ALL_CALENDARS.filter(
  (p) =>
    p.number === 98 ||
    goldenKeywords.some((k) => p.model.includes(k) || p.backdrop.includes(k))
);
const case2Nfts = ALL_CALENDARS.filter(
  (p) =>
    !case1Nfts.includes(p) &&
    cyberKeywords.some((k) => p.model.includes(k) || p.backdrop.includes(k))
);
const case3Nfts = ALL_CALENDARS.filter(
  (p) =>
    !case1Nfts.includes(p) &&
    !case2Nfts.includes(p) &&
    neonKeywords.some((k) => p.model.includes(k) || p.backdrop.includes(k))
);
const case4Nfts = ALL_CALENDARS.filter(
  (p) => !case1Nfts.includes(p) && !case2Nfts.includes(p) && !case3Nfts.includes(p)
);

export const CASES: CaseDefinition[] = [
  {
    id: 'kawaii-spring',
    name: '1. Bahoriy Sakura',
    subtitle: 'Pastel, Kawaii & 500+ ⭐ Promokodlar (19% NFT Ehtimoli)',
    tag: '1-QUTI · START',
    basePrice: 333,
    price: 385,
    netAfterPaxtaFee: 327,
    nftDropChance: 19,
    targetNetPerNft: 1320,
    pityLimit: 5,
    color: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.35)',
    crateImage: '/crates/crate-spring.svg',
    description:
      `Hamyonbop boshlang‘ich quti (333 ⭐ + 15% komissiya = 385 ⭐). Ichida ${case4Nfts.length} ta Desk Calendar NFT, @UpgradeBot uchun kamida 500 ⭐ va 650 ⭐ lik 1-martalik promokodlar hamda @moon Rasmiy Giftlari bor!`,
    dropRates: {
      milSpec: 35.0,
      restricted: 35.0,
      classified: 20.0,
      covert: 7.0,
      special: 3.0,
    },
    nftItems: case4Nfts,
    allRewards: [
      ...case4Nfts.map(nftToReward),
      createPromoReward('spring-p500', 500, 'restricted', '500 ⭐ @UpgradeBot Promokod', '1-martalik shaxsiy kod (500 ⭐)'),
      createPromoReward('spring-p650', 650, 'classified', '650 ⭐ @UpgradeBot Promokod', '1-martalik VIP kod (650 ⭐)'),
      createPromoReward('spring-pgift', 500, 'classified', 'CoinFlip Sovg‘a Promokod', '@UpgradeBot da NFT sovg‘a beradi', 'gift', 'coinflip'),
      createPaxtaGiftReward('spring-maple', 1, 'Maple Leaf', 50, '/prizes/gift-maple.svg', 'restricted', 'Oltin Yaproq (Maple Leaf)', '@moon orqali darhol profilga Gift'),
      createPaxtaGiftReward('spring-tree', 2, 'Money Tree', 75, '/prizes/gift-tree.svg', 'classified', 'Boylik Daraxti (Money Tree)', '@moon orqali darhol profilga Gift'),
      createStarsReward('spring-s70', 70, 'mil-spec', 'Shabnam Bonus (+70 ⭐)', 'Ichki balans keshbeki'),
      createStarsReward('spring-s110', 110, 'restricted', 'Zumrad Fond (+110 ⭐)', 'Ichki balans keshbeki'),
      createTicketReward('spring-t1', 1, 385, 'classified', 'Sakura Chiptasi (1x)', 'Qutini bepul ochish huquqi'),
    ],
  },
  {
    id: 'neon-miami',
    name: '2. Neon Mayami',
    subtitle: 'Yorqin Neon & 550–750 ⭐ Promokodlar (23% NFT Ehtimoli)',
    tag: '2-QUTI · OMMABOP',
    basePrice: 400,
    price: 460,
    netAfterPaxtaFee: 391,
    nftDropChance: 23,
    targetNetPerNft: 1360,
    pityLimit: 5,
    color: '#EC4899',
    accentGlow: 'rgba(236, 72, 153, 0.35)',
    crateImage: '/crates/crate-neon.svg',
    description:
      `Ommabop neon quti (400 ⭐ + 15% komissiya = 460 ⭐). Ichida ${case3Nfts.length} ta Desk Calendar NFT (23% ehtimol), 550 ⭐ va 750 ⭐ @UpgradeBot promokodlar hamda @moon Rasmiy Giftlar!`,
    dropRates: {
      milSpec: 32.0,
      restricted: 34.0,
      classified: 22.0,
      covert: 8.5,
      special: 3.5,
    },
    nftItems: case3Nfts,
    allRewards: [
      ...case3Nfts.map(nftToReward),
      createPromoReward('neon-p550', 550, 'restricted', '550 ⭐ @UpgradeBot Promokod', '1-martalik shaxsiy kod (550 ⭐)'),
      createPromoReward('neon-p750', 750, 'classified', '750 ⭐ @UpgradeBot Promokod', '1-martalik VIP kod (750 ⭐)'),
      createPromoReward('neon-pgift', 550, 'classified', 'CoinFlip Sovg‘a Promokod', '@UpgradeBot da NFT sovg‘a beradi', 'gift', 'coinflip'),
      createPaxtaGiftReward('neon-maple', 1, 'Maple Leaf', 50, '/prizes/gift-maple.svg', 'restricted', 'Oltin Yaproq (Maple Leaf)', '@moon orqali darhol profilga Gift'),
      createPaxtaGiftReward('neon-tree', 2, 'Money Tree', 75, '/prizes/gift-tree.svg', 'classified', 'Boylik Daraxti (Money Tree)', '@moon orqali darhol profilga Gift'),
      createPaxtaGiftReward('neon-cake', 6, 'Cake', 100, '/prizes/gift-cake.svg', 'classified', 'Bayram Torti (Cake Gift)', '@moon orqali darhol profilga Gift'),
      createStarsReward('neon-s85', 85, 'mil-spec', 'Pushti Uchqun (+85 ⭐)', 'Ichki balans keshbeki'),
      createStarsReward('neon-s125', 125, 'restricted', 'Tropik Fond (+125 ⭐)', 'Ichki balans keshbeki'),
      createTicketReward('neon-t1', 1, 460, 'classified', 'Neon Chipta (1x)', 'Qutini bepul ochish huquqi'),
    ],
  },
  {
    id: 'cyber-matrix',
    name: '3. Kiber Matritsa',
    subtitle: 'Past Raqamlar & 650–900 ⭐ Promokodlar (27% NFT Ehtimoli)',
    tag: '3-QUTI · NOYOB',
    basePrice: 450,
    price: 520,
    netAfterPaxtaFee: 442,
    nftDropChance: 27,
    targetNetPerNft: 1420,
    pityLimit: 4,
    color: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.35)',
    crateImage: '/crates/crate-cyber.svg',
    description:
      `Kiber-uslubdagi eksklyuziv quti (450 ⭐ + 15% komissiya = 520 ⭐). Ichida ${case2Nfts.length} ta Desk Calendar NFT (27% ehtimol), 650 ⭐ va 900 ⭐ @UpgradeBot promokodlar hamda Cake Giftlar!`,
    dropRates: {
      milSpec: 28.0,
      restricted: 33.0,
      classified: 24.0,
      covert: 10.5,
      special: 4.5,
    },
    nftItems: case2Nfts,
    allRewards: [
      ...case2Nfts.map(nftToReward),
      createPromoReward('cyber-p650', 650, 'restricted', '650 ⭐ @UpgradeBot Promokod', '1-martalik shaxsiy kod (650 ⭐)'),
      createPromoReward('cyber-p900', 900, 'classified', '900 ⭐ @UpgradeBot Promokod', '1-martalik VIP kod (900 ⭐)'),
      createPromoReward('cyber-pgift', 650, 'classified', 'ImperialCrown Sovg‘a Kod', '@UpgradeBot da Crown sovg‘a beradi', 'gift', 'imperialcrown'),
      createPaxtaGiftReward('cyber-tree', 2, 'Money Tree', 75, '/prizes/gift-tree.svg', 'restricted', 'Boylik Daraxti (Money Tree)', '@moon orqali darhol profilga Gift'),
      createPaxtaGiftReward('cyber-cake', 6, 'Cake', 100, '/prizes/gift-cake.svg', 'classified', 'Bayram Torti (Cake Gift)', '@moon orqali darhol profilga Gift'),
      createStarsReward('cyber-s95', 95, 'mil-spec', 'Impuls Bonus (+95 ⭐)', 'Ichki balans keshbeki'),
      createStarsReward('cyber-s140', 140, 'restricted', 'Sapfir Fond (+140 ⭐)', 'Ichki balans keshbeki'),
      createTicketReward('cyber-t1', 1, 520, 'classified', 'Kiber Chipta (1x)', 'Qutini bepul ochish huquqi'),
    ],
  },
  {
    id: 'golden-royale',
    name: '4. Oltin Qirollik',
    subtitle: 'Sub-100 #98 & 750–1,200 ⭐ Promokodlar (32% NFT Ehtimoli)',
    tag: '4-QUTI · VIP ELITA',
    basePrice: 500,
    price: 575,
    netAfterPaxtaFee: 489,
    nftDropChance: 32,
    targetNetPerNft: 1480,
    pityLimit: 4,
    color: '#F59E0B',
    accentGlow: 'rgba(245, 158, 11, 0.35)',
    crateImage: '/crates/crate-gold.svg',
    description:
      `Yuqori NFT ehtimoliga (32%) ega VIP quti (500 ⭐ + 15% komissiya = 575 ⭐). Ichida ${case1Nfts.length} ta Desk Calendar NFT (#98 Sub-100, Golden Touch, Durov Day), 750 ⭐ va 1,200 ⭐ @UpgradeBot promokodlar!`,
    dropRates: {
      milSpec: 24.0,
      restricted: 31.0,
      classified: 26.0,
      covert: 13.0,
      special: 6.0,
    },
    nftItems: case1Nfts,
    allRewards: [
      ...case1Nfts.map(nftToReward),
      createPromoReward('gold-p750', 750, 'restricted', '750 ⭐ @UpgradeBot Promokod', '1-martalik shaxsiy kod (750 ⭐)'),
      createPromoReward('gold-p1200', 1200, 'classified', '1,200 ⭐ @UpgradeBot Promokod', '1-martalik VIP kod (1,200 ⭐)'),
      createPromoReward('gold-pgift', 750, 'classified', 'ImperialCrown Sovg‘a Kod', '@UpgradeBot da Crown sovg‘a beradi', 'gift', 'imperialcrown'),
      createPaxtaGiftReward('gold-tree', 2, 'Money Tree', 75, '/prizes/gift-tree.svg', 'restricted', 'Boylik Daraxti (Money Tree)', '@moon orqali darhol profilga Gift'),
      createPaxtaGiftReward('gold-cake', 6, 'Cake', 100, '/prizes/gift-cake.svg', 'classified', 'Bayram Torti (Cake Gift)', '@moon orqali darhol profilga Gift'),
      createStarsReward('gold-s110', 110, 'mil-spec', 'Oltin Uchqun (+110 ⭐)', 'Ichki balans keshbeki'),
      createStarsReward('gold-s155', 155, 'restricted', 'Yulduzlar Qopchasi (+155 ⭐)', 'Ichki balans keshbeki'),
      createTicketReward('gold-t1', 1, 575, 'classified', 'VIP Quti Chiptasi (1x)', 'Qutini bepul ochish huquqi'),
    ],
  },
  {
    id: 'moon-epic-case',
    name: '5. MOON EPIC CASE',
    subtitle: '@moon Shaxsiy Fondi: Heart Locket #8, Resistance Dog #30, Scared Cat #10/#20',
    tag: '👑 MOON EPIC · 556,000+ ⭐ FOND',
    isMoonEpic: true,
    basePrice: 860,
    price: 990,
    netAfterPaxtaFee: 842,
    nftDropChance: 38,
    targetNetPerNft: 1450, // Entry tier unlock; high-tier grails use their individual `requiredReserve`!
    pityLimit: 3,
    color: '#A855F7',
    accentGlow: 'rgba(168, 85, 247, 0.45)',
    crateImage: '/crates/crate-moon-epic.svg',
    description:
      `@moon shaxsiy kolleksiyasidagi 71 ta super-noyob aktivlar qutisi (860 ⭐ + 15% = 990 ⭐)! Ichida Resistance Dog #30 (86k ⭐), Heart Locket #8 (45k ⭐), Scared Cat #20 (33k ⭐), #10 (28k ⭐), Precious Peach #9 (20k ⭐), Mask #5, Desk Calendar #5, #6, #10 hamda 1,000–2,500 ⭐ @UpgradeBot VIP promokodlar bor!`,
    dropRates: {
      milSpec: 18.0,
      restricted: 28.0,
      classified: 28.0,
      covert: 17.0,
      special: 9.0,
    },
    nftItems: MOON_EPIC_ITEMS,
    allRewards: [
      ...MOON_EPIC_ITEMS.map(nftToReward),
      createPromoReward('epic-p1000', 1000, 'restricted', '1,000 ⭐ @UpgradeBot VIP Kod', '1-martalik shaxsiy kod (1,000 ⭐)'),
      createPromoReward('epic-p1500', 1500, 'classified', '1,500 ⭐ @UpgradeBot Royal Kod', '1-martalik shaxsiy kod (1,500 ⭐)'),
      createPromoReward('epic-p2500', 2500, 'covert', '2,500 ⭐ @UpgradeBot Epic Kod', '1-martalik Mega kod (2,500 ⭐)'),
      createPromoReward('epic-pgift', 1000, 'classified', 'ImperialCrown NFT Promokod', '@UpgradeBot da Crown sovg‘a beradi', 'gift', 'imperialcrown'),
      createPaxtaGiftReward('epic-tree', 2, 'Money Tree', 75, '/prizes/gift-tree.svg', 'restricted', 'Boylik Daraxti (Money Tree)', '@moon orqali darhol profilga Gift'),
      createPaxtaGiftReward('epic-cake', 6, 'Cake', 100, '/prizes/gift-cake.svg', 'classified', 'Bayram Torti (Cake Gift)', '@moon orqali darhol profilga Gift'),
      createStarsReward('epic-s180', 180, 'mil-spec', 'Kosmik Keshbek (+180 ⭐)', 'Ichki balans keshbeki'),
      createStarsReward('epic-s260', 260, 'restricted', 'Moon Kristall (+260 ⭐)', 'Ichki balans keshbeki'),
      createTicketReward('epic-t1', 1, 990, 'covert', 'Moon Epic Chiptasi (1x)', '990 ⭐ lik qutini bepul ochish'),
    ],
  },
];

export const RARITY_CONFIG = {
  'mil-spec': {
    label: 'Oddiy',
    desc: 'Stars Keshbek & Start NFT',
    color: '#38BDF8',
    bgSoft: 'rgba(56, 189, 248, 0.12)',
    borderSoft: 'rgba(56, 189, 248, 0.3)',
    glow: 'rgba(56, 189, 248, 0.35)',
  },
  restricted: {
    label: 'Noyob',
    desc: '500–1,000 ⭐ Kod, Gift & NFT',
    color: '#A855F7',
    bgSoft: 'rgba(168, 85, 247, 0.12)',
    borderSoft: 'rgba(168, 85, 247, 0.3)',
    glow: 'rgba(168, 85, 247, 0.35)',
  },
  classified: {
    label: 'Kamyob',
    desc: 'Mask, Peach, Notepad & VIP Kod',
    color: '#EC4899',
    bgSoft: 'rgba(236, 72, 153, 0.12)',
    borderSoft: 'rgba(236, 72, 153, 0.3)',
    glow: 'rgba(236, 72, 153, 0.35)',
  },
  covert: {
    label: 'Elita',
    desc: 'Mask #5, Peach #90, Cat #35 (9k–19k ⭐)',
    color: '#F43F5E',
    bgSoft: 'rgba(244, 63, 94, 0.14)',
    borderSoft: 'rgba(244, 63, 94, 0.35)',
    glow: 'rgba(244, 63, 94, 0.4)',
  },
  special: {
    label: '★ Afsonaviy',
    desc: 'Heart Locket #8, Dog #30, Cat #10/#20',
    color: '#FBBF24',
    bgSoft: 'rgba(251, 191, 36, 0.15)',
    borderSoft: 'rgba(251, 191, 36, 0.45)',
    glow: 'rgba(251, 191, 36, 0.5)',
  },
};
