import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldCheck, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';

interface AddStarsModalProps {
  currentStars: number;
  onAdd: (amount: number) => void;
  onClose: () => void;
}

const PACKAGES = [
  {
    amount: 385,
    label: "1-Quti Paketi (333 + 15%)",
    bonus: "Bahoriy Sakura qutisini ochish uchun",
    popular: false,
  },
  {
    amount: 575,
    label: "Oltin Qirollik Paketi (500 + 15%)",
    bonus: "VIP Oltin Qirollik qutisini ochish uchun",
    popular: true,
  },
  {
    amount: 1560,
    label: "3x Quti Kombo Paketi",
    bonus: "Ketma-ket 3-4 marta quti ochish uchun",
    popular: false,
  },
  {
    amount: 2875,
    label: "5x VIP Qirollik Paketi",
    bonus: "Kafolatli NFT shkalasini to'liq yopish uchun",
    popular: false,
  },
];

export const AddStarsModal: React.FC<AddStarsModalProps> = ({
  currentStars,
  onAdd,
  onClose,
}) => {
  const [loadingPkg, setLoadingPkg] = useState<number | null>(null);
  const [invoiceData, setInvoiceData] = useState<{
    nonce: string;
    amount: number;
    invoiceLink: string;
    webInvoiceUrl: string;
  } | null>(null);
  const [paidSuccess, setPaidSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Poll invoice status when an invoice is active
  useEffect(() => {
    if (!invoiceData || paidSuccess) return;

    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/stars/status/${invoiceData.nonce}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.ok && data.status === 'paid') {
          setPaidSuccess(true);
          onAdd(invoiceData.amount);
          setTimeout(() => {
            onClose();
          }, 1400);
        }
      } catch {
        // Ignore network poll error
      }
    }, 1600);

    return () => clearInterval(timer);
  }, [invoiceData, paidSuccess]);

  const handleCreateInvoice = async (amount: number) => {
    setLoadingPkg(amount);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/stars/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data.error || "PaxtaGram Stars hisob-fakturasini yaratishda xatolik");
        setLoadingPkg(null);
        return;
      }

      setInvoiceData({
        nonce: data.nonce,
        amount: data.amount,
        invoiceLink: data.invoiceLink,
        webInvoiceUrl: data.webInvoiceUrl,
      });

      // Try native PaxtaGram / Telegram WebApp invoice modal first
      const tgWebApp = (window as any).Telegram?.WebApp;
      if (tgWebApp && typeof tgWebApp.openInvoice === 'function') {
        tgWebApp.openInvoice(data.invoiceLink, (status: string) => {
          if (status === 'paid') {
            setPaidSuccess(true);
            onAdd(data.amount);
            setTimeout(() => onClose(), 1200);
          }
        });
      } else {
        window.open(data.webInvoiceUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setErrorMsg("Server bilan bog'lanishda xatolik yuz berdi");
    } finally {
      setLoadingPkg(null);
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

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rasmiy PaxtaGram Stars To'lov (@CaseBot)</span>
        </div>

        <h3 className="text-xl font-extrabold text-white tracking-tight">
          Haqiqiy Stars Hisobni To'ldirish
        </h3>
        <p className="text-xs text-white/55 mt-1">
          Joriy balansingiz:{' '}
          <span className="text-amber-300 font-bold">⭐ {currentStars.toLocaleString()}</span>
        </p>

        {paidSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-extrabold text-white">To'lov Tasdiqlandi!</h4>
            <p className="text-xs text-emerald-300 font-bold">
              +{invoiceData?.amount} ⭐ haqiqiy Stars balansingizga qo'shildi!
            </p>
          </div>
        ) : invoiceData ? (
          <div className="my-5 space-y-4">
            <div className="ios-glass-subtle rounded-2xl p-4 text-center space-y-2 border border-amber-400/30">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin mx-auto" />
              <div className="text-sm font-extrabold text-white">
                ⭐ {invoiceData.amount} Stars to'lovi kutilmoqda...
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                PaxtaGram oynasida to'lovni tasdiqlang. To'lov amalga oshishi bilan Stars avtomatik ravishda hisobingizga tushadi.
              </p>
            </div>

            <a
              href={invoiceData.webInvoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-2xl btn-ios-gold font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>PaxtaGram To'lov Oynasini Ochish</span>
            </a>

            <button
              onClick={() => setInvoiceData(null)}
              className="w-full py-2.5 rounded-xl ios-glass-subtle text-xs font-bold text-white/65 hover:text-white"
            >
              Boshqa paket tanlash
            </button>
          </div>
        ) : (
          <div className="space-y-2.5 my-5">
            {PACKAGES.map((pkg) => {
              const isCreating = loadingPkg === pkg.amount;
              return (
                <button
                  key={pkg.amount}
                  disabled={loadingPkg !== null}
                  onClick={() => handleCreateInvoice(pkg.amount)}
                  className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all text-left ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-amber-500/20 to-sky-500/15 border border-amber-400/45 shadow-lg'
                      : 'ios-glass-subtle hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">{pkg.label}</span>
                      {pkg.popular && (
                        <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                          VIP
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/55 mt-0.5">{pkg.bonus}</div>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl btn-ios-gold text-xs font-extrabold flex items-center gap-1.5 shrink-0">
                    {isCreating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>⭐ {pkg.amount.toLocaleString()}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-400/30 text-xs text-rose-300 font-semibold">
            {errorMsg}
          </div>
        )}

        <div className="ios-glass-subtle rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-white/65">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            To'lov rasmiy PaxtaGram <strong>@CaseBot</strong> hisob-fakturasi (`XTR`) orqali xavfsiz yechiladi.
          </span>
        </div>
      </div>
    </div>
  );
};
