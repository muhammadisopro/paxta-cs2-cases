import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  ShieldAlert,
  Users,
  Send,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Lock,
  Plus,
  Minus,
  Trash2,
  CreditCard,
} from 'lucide-react';

interface AdminModalProps {
  initialAdminKey?: string;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ initialAdminKey = '', onClose }) => {
  const [adminKey, setAdminKey] = useState<string>(() => {
    if (initialAdminKey) return initialAdminKey;
    const tgUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser?.id === 100 || tgUser?.username === 'moon' || tgUser?.username === 'shade') {
      return 'moon2026';
    }
    return localStorage.getItem('paxtabox_admin_key') || '';
  });
  const [keyInput, setKeyInput] = useState<string>('');
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users' | 'errors' | 'payments'>(
    'withdrawals'
  );
  const [dashboard, setDashboard] = useState<any>(null);
  const [busyReceipt, setBusyReceipt] = useState<string | null>(null);
  const [customDeltaMap, setCustomDeltaMap] = useState<Record<string, string>>({});

  const fetchDashboard = useCallback(
    async (keyToUse: string) => {
      if (!keyToUse) return;
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/admin/dashboard?key=${encodeURIComponent(keyToUse)}`);
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setAuthenticated(false);
          setErrorMsg(data.error || 'Admin parol xato!');
        } else {
          setDashboard(data);
          setAuthenticated(true);
          localStorage.setItem('paxtabox_admin_key', keyToUse);
        }
      } catch {
        setErrorMsg('Server bilan aloqa xatosi');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (adminKey) {
      fetchDashboard(adminKey);
    }
  }, [adminKey, fetchDashboard]);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleRetryTransfer = async (receiptCode: string) => {
    setBusyReceipt(receiptCode);
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: adminKey,
          action: 'retry_transfer',
          receiptCode,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(data.message || 'Muvaffaqiyatli o‘tkazildi!');
      } else {
        showToast(data.error || 'O‘tkazishda xatolik!');
      }
      await fetchDashboard(adminKey);
    } catch {
      showToast('Tarmoq xatosi');
    } finally {
      setBusyReceipt(null);
    }
  };

  const handleMarkTransferred = async (receiptCode: string) => {
    setBusyReceipt(receiptCode);
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: adminKey,
          action: 'mark_transferred',
          receiptCode,
        }),
      });
      const data = await res.json();
      if (data.ok) showToast(data.message);
      await fetchDashboard(adminKey);
    } finally {
      setBusyReceipt(null);
    }
  };

  const handleAdjustBalance = async (userId: string, deltaStars: number) => {
    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: adminKey,
          action: 'adjust_balance',
          userId,
          deltaStars,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        showToast(data.message);
        await fetchDashboard(adminKey);
      }
    } catch {}
  };

  const handleClearErrors = async () => {
    try {
      await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: adminKey,
          action: 'clear_errors',
        }),
      });
      showToast('Xatoliklar jurnali tozalandi');
      await fetchDashboard(adminKey);
    } catch {}
  };

  if (!authenticated) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-[32px] ios-glass p-6 sm:p-8 relative space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full ios-glass-subtle flex items-center justify-center text-white/60 hover:text-white absolute top-5 right-5"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">PaxtaBox Admin Panel</h2>
              <p className="text-xs text-slate-400">@moon boshqaruv va nazorat tizimi</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAdminKey(keyInput.trim());
              fetchDashboard(keyInput.trim());
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Admin maxfiy paroli:
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Admin parolni kiriting..."
                className="w-full bg-black/50 rounded-2xl px-4 py-3 text-sm text-white border border-white/15 focus:outline-none focus:border-amber-400"
              />
            </div>

            {errorMsg && (
              <div className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3.5 py-2.5">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl btn-ios-gold text-sm font-extrabold"
            >
              {loading ? 'Tekshirilmoqda...' : 'Admin Panelga Kirish'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const withdrawals: any[] = dashboard?.withdrawals || [];
  const users: any[] = dashboard?.users || [];
  const errorLogs: any[] = dashboard?.errorLogs || [];
  const invoices: any[] = dashboard?.invoices || [];
  const mintedPromos: any[] = dashboard?.mintedPromos || [];
  const reserves = summary.casePoolReserves || {};

  return (
    <div className="fixed inset-0 z-50 bg-[#050811]/95 backdrop-blur-2xl overflow-y-auto animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                PaxtaBox (@CaseBot) — Admin Boshqaruv Paneli
              </h1>
              <p className="text-xs text-slate-400">
                Kim nima yutdi • Kimning balansi qancha • O‘tmay qolgan sovg‘alar va Xatoliklar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => fetchDashboard(adminKey)}
              className="px-4 py-2 rounded-full ios-glass-subtle hover:bg-white/10 text-xs font-bold text-sky-300 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Yangilash</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/35 text-xs font-bold text-rose-200 flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Yopish</span>
            </button>
          </div>
        </div>

        {/* Action Toast */}
        {actionToast && (
          <div className="rounded-2xl bg-emerald-500/20 border border-emerald-400/40 px-4 py-3 text-xs sm:text-sm font-bold text-emerald-200 flex items-center justify-between">
            <span>{actionToast}</span>
            <button onClick={() => setActionToast(null)} className="text-white/60 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="ios-glass rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 font-semibold">Foydalanuvchilar</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {summary.totalUsers || 0} ta
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Ochilgan qutilar: {summary.totalOpenedAll || 0} ta
            </div>
          </div>

          <div className="ios-glass rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 font-semibold">Sarflangan Stars</div>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              ⭐ {(summary.totalSpentAll || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5">
              Invoice to‘lov: ⭐ {(summary.totalPaidStars || 0).toLocaleString()}
            </div>
          </div>

          <div className="ios-glass rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 font-semibold">Yutilgan NFTlar</div>
            <div className="text-2xl font-extrabold text-purple-300 mt-1">
              {summary.claimedNftsCount || 0} / 199
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Qolgan: {199 - (summary.claimedNftsCount || 0)} ta NFT
            </div>
          </div>

          <div className="ios-glass rounded-2xl p-4">
            <div className="text-[11px] text-slate-400 font-semibold">Jami O‘tkazmalar</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">
              {summary.totalWithdrawals || 0} ta
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">NFT + @moon Rasmiy Gift</div>
          </div>

          <div className="ios-glass rounded-2xl p-4 border border-amber-400/30">
            <div className="text-[11px] text-amber-300 font-semibold">
              Navbat / O‘tmay qolgan
            </div>
            <div className="text-2xl font-extrabold text-amber-300 mt-1">
              {summary.pendingWithdrawalsCount || 0} ta
            </div>
            <div className="text-[10px] text-amber-200/70 mt-0.5">
              48s Trade-Ban yoki xato
            </div>
          </div>

          <div className="ios-glass rounded-2xl p-4 border border-rose-400/30">
            <div className="text-[11px] text-rose-300 font-semibold">Tizim Xatoliklari</div>
            <div className="text-2xl font-extrabold text-rose-400 mt-1">
              {summary.errorsCount || 0} ta
            </div>
            <div className="text-[10px] text-rose-200/70 mt-0.5">Jurnalda saqlangan</div>
          </div>
        </div>

        {/* Escrow Reserve Strip per Case */}
        <div className="ios-glass-subtle rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-extrabold text-white uppercase tracking-wider">
            Qutilar Sof Escrow Fondi (15% PaxtaGram komissiyasidan keyin):
          </span>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
              1. Sakura: ⭐ {reserves['kawaii-spring'] ?? 0}
            </span>
            <span className="px-3 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-400/30">
              2. Mayami: ⭐ {reserves['neon-miami'] ?? 0}
            </span>
            <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 border border-sky-400/30">
              3. Kiber: ⭐ {reserves['cyber-matrix'] ?? 0}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30">
              4. Oltin: ⭐ {reserves['golden-royale'] ?? 0}
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/25 text-purple-200 border border-purple-400/40">
              👑 5. MOON EPIC: ⭐ {reserves['moon-epic-case'] ?? 0}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'withdrawals'
                ? 'bg-amber-400 text-slate-950 shadow-lg'
                : 'ios-glass-subtle text-slate-300 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              Yutuq O‘tkazmalar va O‘tmay Qolganlar ({withdrawals.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'users'
                ? 'bg-sky-400 text-slate-950 shadow-lg'
                : 'ios-glass-subtle text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Foydalanuvchilar va Balanslar ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'errors'
                ? 'bg-rose-500 text-white shadow-lg'
                : 'ios-glass-subtle text-rose-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Xatoliklar Jurnali ({errorLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
              activeTab === 'payments'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'ios-glass-subtle text-purple-300 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>To‘lovlar ({invoices.length}) & Promokodlar ({mintedPromos.length})</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: WITHDRAWALS (Kim nima yutdi va qaysi sovg'a o'tmay qoldi)  */}
        {/* ================================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <div className="ios-glass rounded-3xl p-8 text-center text-sm text-slate-400">
                Hozircha hech qanday sovg‘a yechib olish so‘rovi tushmagan.
              </div>
            ) : (
              withdrawals.map((w) => {
                const isDone =
                  w.status === 'transferred' || w.status === 'delivered_instant';
                const isFailed = w.status === 'failed_transfer' || Boolean(w.lastError);
                return (
                  <div
                    key={w.receiptCode}
                    className={`ios-glass rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
                      isFailed
                        ? 'border-rose-500/40 bg-rose-500/5'
                        : !isDone
                        ? 'border-amber-400/40 bg-amber-500/5'
                        : 'border-emerald-400/25'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isDone ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> O‘tkazib berildi
                          </span>
                        ) : isFailed ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/25 text-rose-300 text-[11px] font-extrabold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> O‘tmay qoldi / Xato
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[11px] font-extrabold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 48-soat Trade-Ban Navbatda
                          </span>
                        )}

                        <span className="text-sm font-extrabold text-white">
                          {w.type === 'official_gift'
                            ? `🍁 Rasmiy Gift: ${w.title} (⭐ ${w.price})`
                            : `🎁 NFT: ${w.itemTitle || `Desk Calendar #${w.number}`} (${w.model || ''})`}
                        </span>

                        <span className="text-xs font-mono text-slate-400">
                          [{w.receiptCode}]
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                        <span>
                          Qabul qiluvchi:{' '}
                          <strong className="text-amber-300">@{w.targetUsername}</strong> (ID:{' '}
                          {w.targetUserId})
                        </span>
                        <span>•</span>
                        <span>Vaqt: {new Date(w.createdAt).toLocaleString()}</span>
                        {w.tradeLockedUntil && !isDone && (
                          <>
                            <span>•</span>
                            <span className="text-amber-300">
                              Trade-Ban tugashi: {new Date(w.tradeLockedUntil).toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>

                      {w.lastError && (
                        <div className="text-xs font-bold text-rose-400 mt-1">
                          ⚠️ Xatolik sababi: {w.lastError}
                        </div>
                      )}
                    </div>

                    {!isDone && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRetryTransfer(w.receiptCode)}
                          disabled={busyReceipt === w.receiptCode}
                          className="px-4 py-2 rounded-xl btn-ios-gold text-xs font-extrabold flex items-center gap-1.5"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              busyReceipt === w.receiptCode ? 'animate-spin' : ''
                            }`}
                          />
                          <span>
                            {busyReceipt === w.receiptCode
                              ? 'Yuborilmoqda...'
                              : '@moon orqali Hoziroq O‘tkazish'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleMarkTransferred(w.receiptCode)}
                          disabled={busyReceipt === w.receiptCode}
                          className="px-3 py-2 rounded-xl ios-glass-subtle hover:bg-white/10 text-xs font-bold text-emerald-300"
                        >
                          ✓ Qo‘lda berildi
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: USERS (Kimni balansi qancha va kim nima yutgan)            */}
        {/* ================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="ios-glass rounded-3xl p-8 text-center text-sm text-slate-400">
                Hozircha faol foydalanuvchilar yo‘q.
              </div>
            ) : (
              users.map((u) => (
                <div
                  key={u.userId}
                  className="ios-glass rounded-2xl p-4 sm:p-5 space-y-3 border border-white/10"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-white">
                          {u.firstName ? `${u.firstName} (@${u.username})` : u.username}
                        </span>
                        <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                          ID: {u.userId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Ochilgan qutilar: <strong className="text-white">{u.totalOpened} ta</strong> •
                        Sarflangan: <strong className="text-amber-300">⭐ {u.totalSpent}</strong> •
                        Oxirgi faollik: {u.updatedAt ? new Date(u.updatedAt).toLocaleString() : '—'}
                      </div>
                    </div>

                    {/* User Balance & Quick Admin Top-up Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/35 text-amber-300 text-sm font-extrabold">
                        Balans: ⭐ {u.stars.toLocaleString()}
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-400/30 text-indigo-200 text-xs font-bold">
                        🎟 {u.tickets} chipta • 💎 {u.loyaltyPoints}
                      </div>

                      <button
                        onClick={() => handleAdjustBalance(u.userId, 385)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> 385 ⭐
                      </button>
                      <button
                        onClick={() => handleAdjustBalance(u.userId, -385)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-300 text-xs font-extrabold flex items-center gap-1"
                      >
                        <Minus className="w-3 h-3" /> 385 ⭐
                      </button>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={customDeltaMap[u.userId] || ''}
                          onChange={(e) =>
                            setCustomDeltaMap((prev) => ({ ...prev, [u.userId]: e.target.value }))
                          }
                          placeholder="±Stars"
                          className="w-20 bg-black/45 rounded-xl px-2.5 py-1.5 text-xs text-white border border-white/15"
                        />
                        <button
                          onClick={() => {
                            const val = parseInt(customDeltaMap[u.userId] || '0', 10);
                            if (val) handleAdjustBalance(u.userId, val);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* User's Won Items Summary */}
                  {(u.inventory.length > 0 || u.wonGifts.length > 0 || u.wonPromos.length > 0) && (
                    <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2 text-xs">
                      {u.inventory.map((nft: any) => (
                        <span
                          key={nft.uid}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 font-bold"
                        >
                          🎁 {nft.item?.title || 'Kalendar'} #{nft.item?.number} (
                          {nft.withdrawn ? `Yechilgan → ${nft.withdrawnTo}` : 'Inventarda'})
                        </span>
                      ))}
                      {u.wonGifts.map((g: any) => (
                        <span
                          key={g.uid}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 font-bold"
                        >
                          🍁 {g.title} ({g.sent ? `Yuborilgan → ${g.sentTo}` : 'Inventarda'})
                        </span>
                      ))}
                      {u.wonPromos.map((p: any) => (
                        <span
                          key={p.uid}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-400/30 text-purple-200 font-bold"
                        >
                          🎟 Kod: {p.code} ({p.stars} ⭐)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: ERROR LOGS (Kimda qanday xato bo'ldi)                      */}
        {/* ================================================================= */}
        {activeTab === 'errors' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Barcha o‘tmay qolgan sovg‘alar yoki noto‘g‘ri kiritilgan @username xatoliklari shu yerda ko‘rinadi:
              </span>
              {errorLogs.length > 0 && (
                <button
                  onClick={handleClearErrors}
                  className="px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Jurnalni tozalash</span>
                </button>
              )}
            </div>

            {errorLogs.length === 0 ? (
              <div className="ios-glass rounded-3xl p-8 text-center text-sm text-emerald-300 font-semibold">
                ✅ Hozircha hech qanday xatolik qayd etilmagan! Barcha tizimlar 100% soz ishlamoqda.
              </div>
            ) : (
              errorLogs.map((err) => (
                <div
                  key={err.id}
                  className="ios-glass rounded-2xl p-4 border border-rose-500/35 bg-rose-500/5 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-rose-300 uppercase">{err.type}</span>
                    <span className="text-slate-400">
                      {new Date(err.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    Sovg‘a: {err.itemTitle || '—'} • Qabul qiluvchi:{' '}
                    <span className="text-amber-300">{err.targetUsername || '—'}</span>
                  </div>
                  <div className="text-xs text-rose-300 font-semibold">
                    Sabab: {err.error}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: PAYMENTS & PROMOCODES                                      */}
        {/* ================================================================= */}
        {activeTab === 'payments' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="ios-glass rounded-3xl p-5 space-y-3">
              <h3 className="text-base font-extrabold text-white">
                💳 @CaseBot Stars Hisob-Fakturalar ({invoices.length})
              </h3>
              {invoices.length === 0 ? (
                <p className="text-xs text-slate-400">Hozircha hisob-fakturalar yo‘q.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {invoices.map((inv: any) => (
                    <div
                      key={inv.nonce}
                      className="ios-glass-subtle rounded-xl p-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white">
                          ⭐ {inv.amount} Stars ({inv.paidBy ? `@${inv.paidBy}` : inv.slug})
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(inv.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full font-extrabold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {inv.status === 'paid' ? '✅ To‘langan' : '⏳ Kutilmoqda'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ios-glass rounded-3xl p-5 space-y-3">
              <h3 className="text-base font-extrabold text-white">
                🎟 Yaratilgan @UpgradeBot Promokodlar ({mintedPromos.length})
              </h3>
              {mintedPromos.length === 0 ? (
                <p className="text-xs text-slate-400">Hozircha promokodlar tushmagan.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {mintedPromos.map((p: any) => (
                    <div
                      key={p.code}
                      className="ios-glass-subtle rounded-xl p-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-mono font-black text-amber-300 text-sm">{p.code}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(p.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-200 font-bold">
                        ⭐ {p.stars} (1-martalik)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
