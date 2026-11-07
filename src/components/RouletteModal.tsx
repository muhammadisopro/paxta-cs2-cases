import React, { useEffect, useState, useRef } from 'react';
import { CaseDefinition, DropReward, RARITY_CONFIG } from '../data/cases';
import { Volume2, VolumeX, FastForward, ArrowLeft, Sparkles, ShieldCheck, LockOpen } from 'lucide-react';
import { sounds } from '../utils/audio';

interface RouletteModalProps {
  caseDef: CaseDefinition;
  reel: DropReward[];
  winIndex: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onFinish: () => void;
  onClose: () => void;
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  caseDef,
  reel,
  winIndex,
  soundEnabled,
  onToggleSound,
  onFinish,
  onClose,
}) => {
  const [phase, setPhase] = useState<'unsealing' | 'spinning' | 'locked'>('unsealing');
  const [translateX, setTranslateX] = useState(0);
  const [centerIndex, setCenterIndex] = useState(2);

  const viewportRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const lastTickIndexRef = useRef<number>(-1);

  const CARD_WIDTH = 180;
  const CARD_GAP = 14;
  const TOTAL_STEP = CARD_WIDTH + CARD_GAP;

  useEffect(() => {
    sounds.playOpen();

    // Stage 1 -> Stage 2: Unseal crate for 780ms, then start CS2 precision spin
    const t1 = window.setTimeout(() => {
      setPhase('spinning');

      const t2 = window.setTimeout(() => {
        const viewportWidth = viewportRef.current?.clientWidth || 760;
        const centerOffset = viewportWidth / 2 - CARD_WIDTH / 2;
        const jitter = (Math.random() - 0.5) * 36;
        const targetX = -(winIndex * TOTAL_STEP - centerOffset + jitter);

        setTranslateX(targetX);

        // Real-time DOM position tracker so ticks & center highlight match the exact card under the laser
        const trackCenterCard = () => {
          if (stripRef.current && viewportRef.current) {
            const style = window.getComputedStyle(stripRef.current);
            const matrix = new DOMMatrixReadOnly(style.transform);
            const currentX = matrix.m41;
            const vpCenter = viewportRef.current.clientWidth / 2;
            const distanceIntoStrip = vpCenter - currentX;
            const idx = Math.max(
              0,
              Math.min(reel.length - 1, Math.floor(distanceIntoStrip / TOTAL_STEP))
            );

            if (idx !== lastTickIndexRef.current) {
              lastTickIndexRef.current = idx;
              setCenterIndex(idx);
              sounds.playTick();
            }
          }
          rafRef.current = requestAnimationFrame(trackCenterCard);
        };
        rafRef.current = requestAnimationFrame(trackCenterCard);
      }, 60);

      // Stage 2 -> Stage 3: Lock onto winner card at 5.05s
      const t3 = window.setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setCenterIndex(winIndex);
        setPhase('locked');
        sounds.playWin(reel[winIndex]?.rarity || 'restricted');
      }, 5100);

      // Stage 3 -> Finish: Transition to Result Modal at 5.85s
      const t4 = window.setTimeout(() => {
        onFinish();
      }, 5850);

      timersRef.current.push(t2, t3, t4);
    }, 780);

    timersRef.current.push(t1);

    return () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleSkip = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    onFinish();
  };

  const currentCenterReward = reel[centerIndex] || reel[winIndex];
  const centerRarityInfo = currentCenterReward
    ? RARITY_CONFIG[currentCenterReward.rarity]
    : RARITY_CONFIG['mil-spec'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#050811]/95 backdrop-blur-2xl animate-fade-in">
      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between px-4 sm:px-8 pt-6 pb-3">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2.5 text-white/80 hover:text-white transition-colors group"
        >
          <div className="w-10 h-10 rounded-full ios-glass-subtle flex items-center justify-center group-hover:bg-white/10 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-semibold text-white/45 uppercase tracking-wider">
              Rasmiy 2000001271 fondi
            </div>
            <div className="text-base font-bold text-white tracking-tight">{caseDef.name}</div>
          </div>
        </button>

        <div className="px-4 py-2 rounded-full flex items-center gap-2 text-xs font-semibold text-amber-300 border border-amber-400/25 bg-amber-500/10">
          {phase === 'locked' ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300 font-bold">Yutuq tasdiqlandi!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>
                {phase === 'unsealing'
                  ? 'Quti qulfi ochilmoqda...'
                  : 'Tasodifiy mukofot tanlanmoqda...'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center Stage */}
      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Ambient circular halo that changes color with the item currently under the laser */}
        <div
          className="w-[360px] h-[360px] sm:w-[480px] sm:h-[480px] rounded-full absolute pointer-events-none transition-colors duration-300"
          style={{
            background: `radial-gradient(circle, ${centerRarityInfo.glow} 0%, rgba(15, 23, 42, 0.4) 62%, transparent 75%)`,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        />

        {phase === 'unsealing' ? (
          /* STAGE 1: 3D Crate Unsealing Animation */
          <div className="relative z-10 flex flex-col items-center justify-center text-center animate-pop-spring">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <div
                className="w-48 h-48 rounded-full blur-2xl opacity-60 absolute animate-pulse"
                style={{ backgroundColor: caseDef.color }}
              />
              <img
                src={caseDef.crateImage}
                alt={caseDef.name}
                className="w-44 h-44 object-contain relative z-10 animate-crate-unseal drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
              />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full ios-glass text-sm font-bold text-white">
              <LockOpen className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{caseDef.name} ochilmoqda...</span>
            </div>
          </div>
        ) : (
          /* STAGE 2 & 3: CS2 Precision Horizontal Roulette */
          <div className="max-w-5xl w-full relative z-10 space-y-4 animate-pop-spring">
            {/* Live Laser Scanner Readout HUD */}
            {currentCenterReward && (
              <div className="flex items-center justify-center">
                <div className="ios-glass px-5 py-2 rounded-full flex items-center gap-3 border border-white/15 shadow-xl">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: centerRarityInfo.color,
                      boxShadow: `0 0 10px ${centerRarityInfo.color}`,
                    }}
                  />
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {currentCenterReward.name}
                  </span>
                  <span className="text-xs font-semibold text-white/50 hidden sm:inline">
                    • {currentCenterReward.subtitle}
                  </span>
                  <span className="text-xs font-extrabold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                    ⭐ {currentCenterReward.value}
                  </span>
                </div>
              </div>
            )}

            {/* Roulette Viewport Container */}
            <div
              ref={viewportRef}
              className="roulette-stage relative w-full overflow-hidden py-8 rounded-[34px]"
            >
              {/* Center Gold Laser Indicator Line */}
              <div className="roulette-indicator" />

              {/* Side vignette fades */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-40 bg-gradient-to-r from-[#060914] via-[#060914]/80 to-transparent z-20" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-40 bg-gradient-to-l from-[#060914] via-[#060914]/80 to-transparent z-20" />

              {/* Horizontal Strip */}
              <div
                ref={stripRef}
                className="flex items-center"
                style={{
                  gap: `${CARD_GAP}px`,
                  transform: `translate3d(${translateX}px, 0, 0)`,
                  transition: 'transform 4.95s cubic-bezier(0.06, 0.86, 0.12, 1)',
                  willChange: 'transform',
                }}
              >
                {reel.map((reward, idx) => {
                  const rarityInfo = RARITY_CONFIG[reward.rarity];
                  const cal = reward.calendarItem;
                  const isUnderLaser = idx === centerIndex;
                  const isWinnerLocked = phase === 'locked' && idx === winIndex;

                  return (
                    <div
                      key={`${reward.id}-${idx}`}
                      className={`shrink-0 rounded-[26px] p-3.5 flex flex-col items-center justify-between relative overflow-hidden transition-transform duration-150 rarity-bar-${reward.rarity} ${
                        isWinnerLocked
                          ? 'animate-winner-lock ring-2 ring-amber-400 z-20'
                          : isUnderLaser
                          ? 'scale-[1.05] border border-white/35 z-10'
                          : 'border border-white/10 opacity-85'
                      }`}
                      style={{
                        width: `${CARD_WIDTH}px`,
                        height: '216px',
                        background: isUnderLaser
                          ? 'linear-gradient(180deg, rgba(42, 62, 112, 0.88) 0%, rgba(17, 26, 52, 0.96) 100%)'
                          : 'linear-gradient(180deg, rgba(26, 38, 72, 0.72) 0%, rgba(12, 18, 36, 0.90) 100%)',
                      }}
                    >
                      <div className="w-full flex items-center justify-between text-[10px] font-bold">
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={{
                            background: rarityInfo.bgSoft,
                            color: rarityInfo.color,
                          }}
                        >
                          {rarityInfo.label}
                        </span>
                        <span className="text-emerald-300 font-extrabold">⭐ {reward.value}</span>
                      </div>

                      {/* Visual Icon / Calendar */}
                      <div className="my-auto flex items-center justify-center py-1">
                        {reward.type === 'nft' && cal ? (
                          <div
                            className="w-24 h-24 rounded-[22px] p-2 flex items-center justify-center relative overflow-hidden shadow-lg"
                            style={{
                              background: `radial-gradient(circle, ${cal.backdropColors.center}, ${cal.backdropColors.edge})`,
                            }}
                          >
                            <img
                              src={cal.image}
                              alt={cal.name}
                              className="w-20 h-20 object-contain drop-shadow-md"
                            />
                            <span className="absolute bottom-1 right-1.5 px-1.5 py-0.2 rounded-full bg-black/60 text-[9px] font-black text-white">
                              #{cal.number}
                            </span>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-[22px] bg-white/[0.06] border border-white/10 p-2 flex items-center justify-center shadow-lg">
                            <img
                              src={reward.image}
                              alt={reward.name}
                              className="w-16 h-16 object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <div className="w-full text-center">
                        <div className="text-xs font-bold text-white truncate">{reward.name}</div>
                        <div className="text-[10px] text-white/50 truncate">{reward.subtitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls (Sound & Skip) */}
      <div className="pb-12 pt-4 flex items-center justify-center gap-4">
        <button
          onClick={onToggleSound}
          className="w-12 h-12 rounded-full ios-glass-subtle flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Ovoz"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5 text-sky-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-white/40" />
          )}
        </button>

        <button
          onClick={handleSkip}
          className="px-8 py-3.5 rounded-full ios-glass hover:bg-white/12 text-white font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center gap-2"
        >
          <FastForward className="w-4 h-4 text-amber-400" />
          <span>Natijani darhol ko'rish</span>
        </button>
      </div>
    </div>
  );
};
