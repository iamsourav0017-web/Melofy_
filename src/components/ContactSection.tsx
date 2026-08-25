import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, ShieldCheck, Clock, User, Package, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { InquirySubmission, ContactContent, UserProfile } from '../types';
import { EditableText } from './EditableText';
import { premiumEase } from '../utils/motionTransitions';

interface ContactSectionProps {
  selectedPackage: string;
  content: ContactContent;
  user?: UserProfile | null;
  isEditMode?: boolean;
  onUpdateContent: (updated: Partial<ContactContent>) => void;
  onPackageChange: (pkg: string) => void;
  onOpenProfile?: () => void;
  onSubmitInquiry: (submission: Omit<InquirySubmission, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  selectedPackage,
  content,
  user = null,
  isEditMode = false,
  onUpdateContent,
  onPackageChange,
  onOpenProfile,
  onSubmitInquiry
}) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [occasion, setOccasion] = useState('Wedding');
  const [preferredGenre, setPreferredGenre] = useState('Romantic / Cinematic');
  const [language, setLanguage] = useState('Hindi / Hinglish');
  const [story, setStory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');

  // Update name & email if user logs in
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    story?: string;
  }>({});

  const occasions = [
    'Wedding',
    'Proposal',
    'Anniversary',
    'Birthday',
    'Content / Creator',
    'Brand Anthem',
    'Personal Keepsake',
    'Other'
  ];

  const genres = [
    'Romantic / Cinematic',
    'Indo-Fusion (Sitar & Beats)',
    '70s Retro Classical',
    'Dance-Pop / Synthwave',
    'Acoustic Folk / Indie',
    'Bollywood Grand Entry',
    'Composer’s Choice'
  ];

  const packages = [
    { name: 'BASIC', price: '₹2,500' },
    { name: 'STANDARD', price: '₹4,500', isPopular: true },
    { name: 'PREMIUM', price: '₹8,000' }
  ];

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      story?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Please provide your name.';
    }

    if (!email.trim()) {
      newErrors.email = 'Please provide your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!story.trim() || story.trim().length < 15) {
      newErrors.story = 'Please share a few lines about the story, person, or memories (min 15 characters).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const generatedId = `MEL-${Date.now().toString().slice(-6)}`;
      const success = await onSubmitInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        occasion,
        preferredPackage: selectedPackage || 'STANDARD',
        preferredGenre,
        language,
        story: story.trim()
      });

      if (success) {
        setSubmissionId(generatedId);
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone('');
    setStory('');
    setSubmitted(false);
    setErrors({});
  };

  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="contact"
      className="relative w-full py-24 bg-transparent border-t border-[#171A1C]/[0.08] dark:border-white/10 z-10"
      style={{
        paddingLeft: 'clamp(20px, 5vw, 80px)',
        paddingRight: 'clamp(20px, 5vw, 80px)'
      }}
    >
      <div className="max-w-[1440px] mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading & Studio Reassurance */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              <EditableText
                value={content.badge}
                onSave={(val) => onUpdateContent({ badge: val })}
                isEditingGlobal={isEditMode}
                className="font-code text-xs tracking-widest text-[var(--text-muted)] uppercase font-semibold"
                as="span"
              />
            </div>

            <h2
              id="contact-heading"
              className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[var(--text-main)] leading-[1.08] tracking-tight"
            >
              <EditableText
                value={content.headingLine1}
                onSave={(val) => onUpdateContent({ headingLine1: val })}
                isEditingGlobal={isEditMode}
                as="span"
              />
              <br />
              <EditableText
                value={content.headingAccent}
                onSave={(val) => onUpdateContent({ headingAccent: val })}
                isEditingGlobal={isEditMode}
                className="text-[var(--accent)]"
                as="span"
              />
            </h2>

            <EditableText
              value={content.subtitle}
              onSave={(val) => onUpdateContent({ subtitle: val })}
              isEditingGlobal={isEditMode}
              multiline
              className="font-body text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-md block font-normal"
              as="p"
            />

            {/* Guarantees */}
            <div className="pt-4 space-y-4 border-t border-[var(--card-border)]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <EditableText
                    value={content.guarantee1Title}
                    onSave={(val) => onUpdateContent({ guarantee1Title: val })}
                    isEditingGlobal={isEditMode}
                    className="font-display font-bold text-xs sm:text-sm text-[var(--text-main)] block"
                    as="h4"
                  />
                  <EditableText
                    value={content.guarantee1Desc}
                    onSave={(val) => onUpdateContent({ guarantee1Desc: val })}
                    isEditingGlobal={isEditMode}
                    className="font-body text-xs text-[var(--text-muted)] block"
                    as="p"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <EditableText
                    value={content.guarantee2Title}
                    onSave={(val) => onUpdateContent({ guarantee2Title: val })}
                    isEditingGlobal={isEditMode}
                    className="font-display font-bold text-xs sm:text-sm text-[var(--text-main)] block"
                    as="h4"
                  />
                  <EditableText
                    value={content.guarantee2Desc}
                    onSave={(val) => onUpdateContent({ guarantee2Desc: val })}
                    isEditingGlobal={isEditMode}
                    className="font-body text-xs text-[var(--text-muted)] block"
                    as="p"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Brief Form */}
          <div className="lg:col-span-7">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-[var(--text-main)]">
              
              {/* Google Account Sync Bar */}
              {user ? (
                <div className="mb-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <span className="font-display font-bold text-xs text-[var(--text-main)] block">
                        Ordering as {user.name}
                      </span>
                      <span className="font-body text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Google Account linked • Live order tracking will be active
                      </span>
                    </div>
                  </div>
                  {onOpenProfile && (
                    <button
                      type="button"
                      onClick={onOpenProfile}
                      className="font-code text-[11px] font-bold text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      View Hub →
                    </button>
                  )}
                </div>
              ) : (
                onOpenProfile && (
                  <div className="mb-6 p-3.5 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/25 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                      <span className="font-body text-xs text-[var(--text-main)] font-medium">
                        Have a Google account? Sign in for automatic order tracking & invoices.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenProfile}
                      className="font-body text-xs font-bold px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-[#171A1C] hover:bg-[var(--accent-hover)] transition-all cursor-pointer shrink-0 shadow-sm"
                    >
                      Sign In
                    </button>
                  </div>
                )
              )}

              {submitted ? (
                <div className="py-12 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <span className="font-code text-xs font-bold text-[var(--accent)]">
                      ORDER CODE: {submissionId}
                    </span>
                    <h3 className="font-display font-extrabold text-2xl text-[var(--text-main)]">
                      Story Received! We’re Composing.
                    </h3>
                    <p className="font-body text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                      Thank you, {name}! Our lead composer will review your brief and begin tracking your melody.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                    {onOpenProfile && (
                      <button
                        type="button"
                        onClick={onOpenProfile}
                        className="py-3 px-6 rounded-full bg-[var(--accent)] text-[#171A1C] font-body font-bold text-xs tracking-wider uppercase hover:bg-[var(--accent-hover)] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Package className="w-4 h-4" />
                        <span>Track Order in Profile Hub</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleReset}
                      className="py-3 px-6 rounded-full bg-[var(--text-main)]/10 text-[var(--text-main)] font-body font-semibold text-xs tracking-wider uppercase hover:bg-[var(--text-main)]/15 transition-all cursor-pointer"
                    >
                      Submit Another Story
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Selected Package Selector */}
                  <div>
                    <label className="font-code text-[11px] text-[var(--text-muted)] uppercase block mb-2 font-bold tracking-wider">
                      Selected Studio Package
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {packages.map((pkg) => {
                        const isSelected = (selectedPackage || 'STANDARD') === pkg.name;
                        return (
                          <button
                            key={pkg.name}
                            type="button"
                            onClick={() => onPackageChange(pkg.name)}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--text-main)] ring-2 ring-[var(--accent)] shadow-sm'
                                : 'border-[var(--card-border)] bg-[var(--bg-main)]/40 text-[var(--text-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--text-main)]'
                            }`}
                          >
                            <span className="font-display font-bold text-xs block text-[var(--text-main)]">
                              {pkg.name}
                            </span>
                            <span className="font-code text-[11px] font-bold text-[var(--accent)]">
                              {pkg.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name, Email, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="client-name" className="font-code text-[11px] text-[var(--text-muted)] uppercase block mb-1.5 font-bold tracking-wider">
                        Your Name *
                      </label>
                      <input
                        id="client-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priya & Arjun"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--card-border)] font-body text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                      />
                      {errors.name && (
                        <p className="font-body text-[11px] text-rose-500 mt-1 font-medium">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="client-email" className="font-code text-[11px] text-[var(--text-muted)] uppercase block mb-1.5 font-bold tracking-wider">
                        Email Address *
                      </label>
                      <input
                        id="client-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. priya@gmail.com"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--card-border)] font-body text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
                      />
                      {errors.email && (
                        <p className="font-body text-[11px] text-rose-500 mt-1 font-medium">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Occasion & Genre */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="client-occasion" className="font-code text-[11px] text-[var(--text-muted)] uppercase block mb-1.5 font-bold tracking-wider">
                        Occasion
                      </label>
                      <select
                        id="client-occasion"
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--card-border)] font-body text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
                      >
                        {occasions.map((occ) => (
                          <option key={occ} value={occ} className="bg-[#121418] text-white">{occ}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="client-genre" className="font-code text-[11px] text-[var(--text-muted)] uppercase block mb-1.5 font-bold tracking-wider">
                        Preferred Style / Genre
                      </label>
                      <select
                        id="client-genre"
                        value={preferredGenre}
                        onChange={(e) => setPreferredGenre(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--card-border)] font-body text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] cursor-pointer"
                      >
                        {genres.map((gn) => (
                          <option key={gn} value={gn} className="bg-[#121418] text-white">{gn}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Story Textarea */}
                  <div>
                    <label htmlFor="client-story" className="font-code text-[11px] text-[var(--text-muted)] uppercase block mb-1.5 font-bold tracking-wider">
                      Tell Us Your Story & Details *
                    </label>
                    <textarea
                      id="client-story"
                      rows={4}
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      placeholder="Share names, how you met, special dates, favorite memories, inside jokes, or the emotions you want the chords to express..."
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-main)]/70 border border-[var(--card-border)] font-body text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)]/60 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] leading-relaxed"
                    />
                    {errors.story && (
                      <p className="font-body text-[11px] text-rose-500 mt-1 font-medium">{errors.story}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    id="submit-inquiry-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full bg-[var(--accent)] text-[#171A1C] font-body font-extrabold text-xs sm:text-sm tracking-wider uppercase hover:bg-[var(--accent-hover)] active:scale-98 transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Submitting Story to Studio...</span>
                    ) : (
                      <>
                        <span>{content.formSubmitText || 'START MY SONG'}</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="font-body text-[11px] text-center text-[var(--text-muted)]">
                    No payment required right now. We review your brief and contact you within 24 hours.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
