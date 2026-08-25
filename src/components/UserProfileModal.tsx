import React, { useState } from 'react';
import {
  X, User, Package, Clock, CheckCircle2, FileText, Download,
  Music, Play, Pause, CreditCard, Shield, ExternalLink, LogOut,
  Sparkles, CheckCircle, ChevronRight, AlertCircle
} from 'lucide-react';
import { UserProfile, UserOrder } from '../types';
import { studioAudio } from '../utils/audioEngine';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  orders: UserOrder[];
  onLoginWithGoogle: (customData?: Partial<UserProfile>) => void;
  onLogout: () => void;
  onSelectOrder?: (order: UserOrder) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  onLoginWithGoogle,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'billing' | 'account'>('orders');
  const [playingSnippetOrderId, setPlayingSnippetOrderId] = useState<string | null>(null);
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = (nameVal?: string, emailVal?: string) => {
    setGoogleAuthLoading(true);
    setTimeout(() => {
      onLoginWithGoogle({
        name: nameVal || customName || 'Aarav Sharma',
        email: emailVal || customEmail || 'aarav.sharma@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'
      });
      setGoogleAuthLoading(false);
    }, 600);
  };

  const handlePlaySnippet = (order: UserOrder) => {
    if (playingSnippetOrderId === order.id) {
      studioAudio.pause();
      setPlayingSnippetOrderId(null);
    } else {
      studioAudio.playTrack({
        id: `demo-${order.id}`,
        synthPreset: 'romantic_piano',
        duration: 30
      });
      setPlayingSnippetOrderId(order.id);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: UserOrder['status']) => {
    switch (status) {
      case 'brief_received':
        return { label: 'Brief Received', color: 'bg-amber-500/10 text-amber-600 border-amber-500/30' };
      case 'composition':
        return { label: 'In Composition', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30' };
      case 'tracking_vocals':
        return { label: 'Vocal Tracking', color: 'bg-purple-500/10 text-purple-600 border-purple-500/30' };
      case 'mixing_mastering':
        return { label: 'Mixing & Mastering', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30' };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' };
      default:
        return { label: 'In Progress', color: 'bg-gray-500/10 text-gray-600 border-gray-500/30' };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white dark:bg-[#13181F] text-[#171A1C] dark:text-white border border-[#171A1C]/10 dark:border-white/10 rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-[#F2F1F0]/70 dark:bg-[#1B2129] border-b border-[#171A1C]/[0.08] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user ? (
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                alt={user.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-[var(--accent)]"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center font-bold">
                <User className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg">
                  {user ? user.name : 'Melofy Account & Order Hub'}
                </h2>
                {user && (
                  <span className="font-code text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Google Verified
                  </span>
                )}
              </div>
              <p className="font-body text-xs text-[#6B6F72] dark:text-[#9CA3AF]">
                {user ? user.email : 'Sign in with your Google account to track orders & billing.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={onLogout}
                className="font-body text-xs font-semibold px-3 py-1.5 rounded-full bg-[#171A1C]/[0.06] dark:bg-white/10 hover:bg-rose-500/15 hover:text-rose-500 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Sign out of Melofy"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#6B6F72] dark:text-[#9CA3AF] hover:text-[#171A1C] dark:hover:text-white rounded-full hover:bg-[#171A1C]/[0.06] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Not Logged In Screen */}
        {!user ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shadow-inner">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-2xl text-[#171A1C] dark:text-white">
                Log in to Place & Track Orders
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#6B6F72] dark:text-[#9CA3AF] leading-relaxed">
                Log in with your Google account to track real-time song composition, listen to private audio drafts, view invoices, and collaborate directly with composers.
              </p>
            </div>

            <div className="w-full space-y-3 pt-2">
              {/* Quick Google Sign In Button */}
              <button
                type="button"
                disabled={googleAuthLoading}
                onClick={() => handleGoogleSignIn()}
                className="w-full py-3.5 px-6 rounded-full bg-white dark:bg-[#1B2129] border border-[#171A1C]/20 dark:border-white/20 font-body font-semibold text-sm text-[#171A1C] dark:text-white hover:bg-[#F2F1F0] dark:hover:bg-[#232B36] transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer active:scale-98"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleAuthLoading ? 'Authenticating with Google...' : 'Continue with Google Account'}</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#171A1C]/10 dark:border-white/10" />
                <span className="flex-shrink mx-4 font-code text-[11px] text-[#6B6F72] dark:text-[#9CA3AF] uppercase">
                  or custom Google identity
                </span>
                <div className="flex-grow border-t border-[#171A1C]/10 dark:border-white/10" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F2F1F0] dark:bg-[#1B2129] border border-[#171A1C]/10 dark:border-white/10 font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="email"
                  placeholder="Google Email (e.g. you@gmail.com)"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F2F1F0] dark:bg-[#1B2129] border border-[#171A1C]/10 dark:border-white/10 font-body text-xs focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              {customName && customEmail && (
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(customName, customEmail)}
                  className="w-full py-2.5 rounded-full bg-[var(--accent)] text-[#171A1C] font-body font-semibold text-xs cursor-pointer hover:bg-[var(--accent-hover)] transition-all"
                >
                  Sign in as {customName}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-[#6B6F72] dark:text-[#9CA3AF] font-body text-xs pt-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>256-bit encrypted session • Official Google OAuth Protocol</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="px-6 pt-3 bg-[#F2F1F0]/50 dark:bg-[#181E26] border-b border-[#171A1C]/[0.08] dark:border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`font-body text-xs font-semibold px-4 py-2.5 rounded-t-xl transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-[var(--accent)] text-[#171A1C] dark:text-white bg-white dark:bg-[#13181F]'
                    : 'border-transparent text-[#6B6F72] dark:text-[#9CA3AF] hover:text-[#171A1C] dark:hover:text-white'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>My Song Orders & Live Tracking ({orders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('billing')}
                className={`font-body text-xs font-semibold px-4 py-2.5 rounded-t-xl transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'billing'
                    ? 'border-[var(--accent)] text-[#171A1C] dark:text-white bg-white dark:bg-[#13181F]'
                    : 'border-transparent text-[#6B6F72] dark:text-[#9CA3AF] hover:text-[#171A1C] dark:hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Billing & Tax Invoices</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`font-body text-xs font-semibold px-4 py-2.5 rounded-t-xl transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
                  activeTab === 'account'
                    ? 'border-[var(--accent)] text-[#171A1C] dark:text-white bg-white dark:bg-[#13181F]'
                    : 'border-transparent text-[#6B6F72] dark:text-[#9CA3AF] hover:text-[#171A1C] dark:hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Account Profile</span>
              </button>
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: ORDERS & TRACKING */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-[#171A1C]/15 dark:border-white/15 rounded-2xl space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center mx-auto">
                        <Music className="w-6 h-6" />
                      </div>
                      <h4 className="font-display font-bold text-base text-[#171A1C] dark:text-white">
                        No Active Orders Yet
                      </h4>
                      <p className="font-body text-xs text-[#6B6F72] dark:text-[#9CA3AF] max-w-sm mx-auto">
                        Ready to turn your personal story into a song? Head to the Contact form or select a package to begin.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="font-body text-xs font-semibold px-5 py-2 rounded-full bg-[var(--accent)] text-[#171A1C] hover:bg-[var(--accent-hover)] transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>Start a Custom Song</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => {
                        const statusBadge = getStatusBadge(order.status);
                        return (
                          <div
                            key={order.id}
                            className="bg-white dark:bg-[#171D25] border border-[#171A1C]/10 dark:border-white/10 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs"
                          >
                            {/* Order Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#171A1C]/[0.08] dark:border-white/10 pb-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-code text-xs font-bold text-[var(--accent)]">
                                    {order.id}
                                  </span>
                                  <span className={`font-code text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}>
                                    {statusBadge.label}
                                  </span>
                                </div>
                                <h3 className="font-display font-bold text-lg text-[#171A1C] dark:text-white mt-1">
                                  {order.packageTier} Package — {order.occasion} Song
                                </h3>
                              </div>

                              <div className="text-right">
                                <span className="font-display font-extrabold text-lg text-[#171A1C] dark:text-white block">
                                  {formatCurrency(order.amount, order.currency)}
                                </span>
                                <span className="font-code text-[10px] text-[#6B6F72] dark:text-[#9CA3AF]">
                                  Est. Delivery: {order.estimatedDeliveryDate}
                                </span>
                              </div>
                            </div>

                            {/* 4-Stage Live Production Timeline */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs font-code text-[#6B6F72] dark:text-[#9CA3AF]">
                                <span className="font-semibold text-[#171A1C] dark:text-white">
                                  Production Timeline & Studio Milestones
                                </span>
                                <span>{order.statusProgress}% Completed</span>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full h-2 rounded-full bg-[#F2F1F0] dark:bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
                                  style={{ width: `${order.statusProgress}%` }}
                                />
                              </div>

                              {/* Timeline Event Steps */}
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                                {order.timelineEvents.map((evt, idx) => (
                                  <div
                                    key={idx}
                                    className={`p-3 rounded-xl border transition-all ${
                                      evt.completed
                                        ? 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/15'
                                        : evt.current
                                        ? 'bg-[var(--accent)]/15 border-[var(--accent)] dark:bg-[var(--accent)]/20'
                                        : 'bg-[#F2F1F0]/50 dark:bg-white/5 border-transparent opacity-60'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 mb-1">
                                      {evt.completed ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      ) : evt.current ? (
                                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-ping" />
                                      ) : (
                                        <Clock className="w-3.5 h-3.5 text-[#6B6F72]" />
                                      )}
                                      <span className="font-display font-bold text-xs">
                                        Step 0{idx + 1}
                                      </span>
                                    </div>
                                    <p className="font-display font-semibold text-xs text-[#171A1C] dark:text-white leading-tight">
                                      {evt.title}
                                    </p>
                                    <p className="font-body text-[11px] text-[#6B6F72] dark:text-[#9CA3AF] mt-1 leading-snug">
                                      {evt.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Story Brief & Audio Preview */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-xl bg-[#F2F1F0]/70 dark:bg-[#12161C] border border-[#171A1C]/[0.06] dark:border-white/5">
                              <div className="sm:col-span-8 space-y-1">
                                <span className="font-code text-[10px] uppercase text-[#6B6F72] dark:text-[#9CA3AF] block">
                                  Story Brief & Instructions
                                </span>
                                <p className="font-body text-xs text-[#464B4F] dark:text-[#D1D5DB] line-clamp-2 italic">
                                  "{order.storyBrief}"
                                </p>
                                <div className="flex items-center gap-2 pt-1 font-code text-[10px] text-[#6B6F72] dark:text-[#9CA3AF]">
                                  <span>Genre: <strong className="text-[#171A1C] dark:text-white">{order.genre}</strong></span>
                                  <span>•</span>
                                  <span>Revisions Remaining: <strong className="text-[var(--accent)]">{order.revisionsRemaining}</strong></span>
                                </div>
                              </div>

                              <div className="sm:col-span-4 flex flex-col justify-center items-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handlePlaySnippet(order)}
                                  className="w-full py-2 px-3 rounded-lg bg-[var(--accent)] text-[#171A1C] font-body font-semibold text-xs hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  {playingSnippetOrderId === order.id ? (
                                    <>
                                      <Pause className="w-3.5 h-3.5 fill-current" />
                                      <span>Pause Studio Snippet</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3.5 h-3.5 fill-current" />
                                      <span>Listen In-Progress Audio</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BILLING & INVOICES */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-[var(--accent)]" />
                      <div>
                        <h4 className="font-display font-bold text-sm text-[#171A1C] dark:text-white">
                          Verified Payment & GST Invoices
                        </h4>
                        <p className="font-body text-xs text-[#6B6F72] dark:text-[#9CA3AF]">
                          All transactions are securely processed with 100% money-back revision guarantee.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#171D25] border border-[#171A1C]/10 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-[#171A1C]/[0.08] dark:border-white/10 font-display font-bold text-sm text-[#171A1C] dark:text-white">
                      Invoice History
                    </div>

                    <div className="divide-y divide-[#171A1C]/[0.06] dark:divide-white/5">
                      {orders.map((order) => (
                        <div key={order.invoiceNumber} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-code text-xs font-bold text-[#171A1C] dark:text-white">
                                {order.invoiceNumber}
                              </span>
                              <span className="font-code text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                                PAID
                              </span>
                            </div>
                            <p className="font-body text-xs text-[#6B6F72] dark:text-[#9CA3AF]">
                              {order.packageTier} Package ({order.occasion}) • Billed on {order.orderDate}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="font-display font-extrabold text-sm text-[#171A1C] dark:text-white">
                              {formatCurrency(order.amount, order.currency)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Downloading official PDF tax receipt for ${order.invoiceNumber}...`);
                              }}
                              className="p-2 rounded-lg bg-[#F2F1F0] dark:bg-white/10 text-[#171A1C] dark:text-white hover:bg-[var(--accent)] hover:text-[#171A1C] transition-colors cursor-pointer"
                              title="Download Invoice PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {orders.length === 0 && (
                        <div className="p-8 text-center font-body text-xs text-[#6B6F72] dark:text-[#9CA3AF]">
                          No invoices generated yet. Invoices appear here once you place a song order.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ACCOUNT PROFILE */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-[#171D25] border border-[#171A1C]/10 dark:border-white/10 rounded-2xl p-6 space-y-5 shadow-xs">
                    <h4 className="font-display font-bold text-sm text-[#171A1C] dark:text-white border-b border-[#171A1C]/[0.08] dark:border-white/10 pb-3">
                      Google Account Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-code text-[11px] text-[#6B6F72] dark:text-[#9CA3AF] uppercase block mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={user.name}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F2F1F0] dark:bg-white/5 font-body text-xs text-[#171A1C] dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#6B6F72] dark:text-[#9CA3AF] uppercase block mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          readOnly
                          value={user.email}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F2F1F0] dark:bg-white/5 font-body text-xs text-[#171A1C] dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#6B6F72] dark:text-[#9CA3AF] uppercase block mb-1">
                          Authentication Provider
                        </label>
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F2F1F0] dark:bg-white/5 font-body text-xs text-[#171A1C] dark:text-white">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Google Sign-In (OAuth 2.0)</span>
                        </div>
                      </div>

                      <div>
                        <label className="font-code text-[11px] text-[#6B6F72] dark:text-[#9CA3AF] uppercase block mb-1">
                          Account Created
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={user.createdAt || 'March 2026'}
                          className="w-full px-3.5 py-2 rounded-xl bg-[#F2F1F0] dark:bg-white/5 font-body text-xs text-[#171A1C] dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#171A1C]/[0.08] dark:border-white/10 flex items-center justify-between">
                      <span className="font-body text-xs text-[#6B6F72] dark:text-[#9CA3AF]">
                        Want to switch Google accounts?
                      </span>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="font-body text-xs font-semibold px-4 py-2 rounded-full bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      >
                        Sign Out of this Device
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
