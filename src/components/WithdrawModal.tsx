import React, { useState } from 'react';
import { WonInventoryItem } from './InventoryScreen';
import { X, Send, ShieldCheck, CheckCircle2, Sparkles, AlertCircle, Clock } from 'lucide-react';

interface WithdrawModalProps {
  wonItem: WonInventoryItem;
  onConfirmWithdraw: (
    uid: string,
    username: string,
    receiptCode: string,
    status?: string,
    hoursLeft?: number
  ) => void;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  wonItem,
  onConfirmWithdraw,
  onClose,
}) => {
  const [username, setUsername] = useState('@');
  const [confirmStep, setConfirmStep] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [receiptCode, setReceiptCode] = useState('');
  const [serverMsg, setServerMsg] = useState('');
  const [transferStatus, setTransferStatus] = useState<'transferred' | 'queued_trade_ban'>('queued_trade_ban');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cleanUser = username.trim().startsWith('@')
    ? username.trim()
    : `@${username.trim()}`;

  const itemTitle = wonItem.item.name || `${wonItem.item.title || 'Desk Calendar'} #${wonItem.item.number}`;
  const tradeLockedUntil = wonItem.item.tradeLockedUntil || null;
  const unlockMs = tradeLockedUntil ? Date.parse(tradeLockedUntil) : 0;
  const isTradeLocked = unlockMs > Date.now();
  const hoursRemaining = isTradeLocked
    ? Math.max(1, Math.ceil((unlockMs - Date.now()) / (1000 * 60 * 60)))
    : 0;

  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = username.replace('@', '').trim();
    if (raw.length < 2) {
      setErrorMsg("Iltimos, to'g'ri PaxtaGram @username kiriting.");
      return;
    }
    setErrorMsg(null);
    setConfirmStep(true);
  };

  const handleFinalSend = async () => {
    setSending(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/nft/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: wonItem.item.number,
          giftId: wonItem.item.giftId,
          slug: wonItem.item.slug || 'DeskCalendar',
          title: wonItem.item.title || 'Desk Calendar',
          model: wonItem.item.model,
          backdrop: wonItem.item.backdrop,
          pattern: wonItem.item.pattern,
          targetUsername: cleanUser,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSending(false);
        setConfirmStep(false);
        setErrorMsg(data.error || "PaxtaGram foydalanuvchisini tekshirishda xatolik yuz berdi.");
        return;
      }

      const code = data.receiptCode || `PX-#${wonItem.item.number}`;
      setReceiptCode(code);
      setServerMsg(data.message || '');
      setTransferStatus(data.status === 'transferred' ? 'transferred' : 'queued_trade_ban');
      setSending(false);
      setDone(true);

      setTimeout(() => {
        onConfirmWithdraw(
          wonItem.uid,
          data.targetUsername || cleanUser,
          code,
          data.status,
          data.hoursLeft
        );
      }, 2200);
    } catch {
      setSending(false);
      setErrorMsg("Server bilan bog'lanishda xatolik. Qayta urinib ko'ring.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xl p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[34px] ios-glass p-6 sm:p-7 relative overflow-hidden animate-pop-spring"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full ios-glass-subtle flex items-center justify-center text-white/60 hover:text-white absolute top-5 right-5"
        >
          <X className="w-4 h-4" />
        </button>

        {done ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-extrabold text-white">
              {transferStatus === 'transferred'
                ? "Darhol @moon Orqali O'tkazildi!"
                : "Rasman Band Qilindi (Avto-Transfer)!"}
            </h3>
            <p className="text-xs text-white/75 max-w-sm mx-auto leading-relaxed">
              {serverMsg ||
                `${itemTitle} NFT sovg'asi ${cleanUser} profiliga biriktirildi!`}
            </p>
            <div className="ios-glass-subtle rounded-2xl p-3 text-xs font-mono text-emerald-300">
              Rasmiy Kvitansiya: {receiptCode}
            </div>
          </div>
        ) : (
          <>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>@moon Avtomatik PaxtaGram Transfer</span>
            </div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              NFT Sovg'ani qabul qilish
            </h3>
            <p className="text-xs text-white/55 mt-1">
              PaxtaGram @username haqiqiyligi tekshirilib, @moon orqali o'tkaziladi
            </p>

            <div className="my-4 flex items-center gap-4 ios-glass-subtle rounded-2xl p-3.5">
              <div
                className="w-20 h-20 rounded-2xl p-2 flex items-center justify-center shrink-0 shadow-md"
                style={{
                  background: `radial-gradient(circle, ${wonItem.item.backdropColors.center}, ${wonItem.item.backdropColors.edge})`,
                }}
              >
                <img
                  src={wonItem.item.image}
                  alt={wonItem.item.name}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">
                  {itemTitle}
                </div>
                <div className="text-xs text-amber-300 font-semibold mt-0.5">
                  Model: {wonItem.item.model}
                </div>
                <div className="text-xs text-white/55 mt-0.5">
                  Orqa fon: {wonItem.item.backdrop} • Naqsh: {wonItem.item.pattern}
                </div>
                <div className="mt-1.5 inline-block text-[11px] font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full">
                  Qiymati: ⭐ {wonItem.item.value.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 48-Hour Trade Ban Notice */}
            {isTradeLocked && (
              <div className="rounded-2xl bg-amber-500/15 border border-amber-400/35 p-3.5 mb-3 flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-100/90 leading-relaxed">
                  <strong className="text-amber-300">PaxtaGram 48 soatlik Trade-Ban:</strong> Ushbu kalendar yaqinda NFT qilingani uchun PaxtaGram tizimida yana{' '}
                  <strong className="text-white">~{hoursRemaining} soat</strong> xavfsizlik muddati bor. Username kiritsangiz, NFT hoziroq sizning nomingizga band qilinadi va muddat tugashi bilan{' '}
                  <strong className="text-emerald-300">@moon</strong> tomonidan avtomatik profilingizga o'tkaziladi!
                </div>
              </div>
            )}

            <div className="ios-glass-subtle rounded-2xl p-3.5 mb-4 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-white/75 leading-relaxed">
                PaxtaGram tarmog'idagi <span className="text-white font-bold">50 ⭐ NFT o'tkazish to'lovi</span> platforma (@moon) tomonidan to'liq qoplangan.
              </div>
            </div>

            {!confirmStep ? (
              <form onSubmit={handleProceedToConfirm} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5">
                    PaxtaGram @username kiriting
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="@username"
                    required
                    className="w-full ios-glass-subtle rounded-2xl px-4 py-3.5 text-sm text-white font-semibold focus:outline-none focus:border-sky-400"
                  />
                  {errorMsg && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl btn-ios-green font-extrabold text-sm tracking-wide flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Manzilni tekshirish va davom etish</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="rounded-2xl bg-amber-500/15 border border-amber-400/35 p-4 text-left space-y-1">
                  <div className="text-xs font-extrabold text-amber-300">
                    Xato ketmasligi uchun tasdiqlang:
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Haqiqatan ham <span className="text-white font-bold">{itemTitle}</span> sovg'asini{' '}
                    <span className="text-sky-300 font-extrabold underline">{cleanUser}</span> profiliga yuborishni tasdiqlaysizmi?
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => setConfirmStep(false)}
                    className="px-4 py-3.5 rounded-2xl ios-glass-subtle text-xs font-bold text-white/75 hover:text-white"
                  >
                    O'zgartirish
                  </button>
                  <button
                    type="button"
                    disabled={sending}
                    onClick={handleFinalSend}
                    className="flex-1 py-3.5 px-4 rounded-2xl btn-ios-green font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {sending ? "@moon orqali tekshirilmoqda..." : "Ha, 100% tasdiqlayman"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
