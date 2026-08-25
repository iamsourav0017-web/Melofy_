import React, { useState, useEffect } from 'react';
import { ArrowRight, Volume2, VolumeX, User } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SiteBrandConfig, UserProfile } from '../types';
import { premiumEase } from '../utils/motionTransitions';
import { MelofyLogo } from './MelofyLogo';

interface NavbarProps {
  activeSection: string;
  isPlaying?: boolean;
  isMuted?: boolean;
  brandConfig?: SiteBrandConfig;
  user?: UserProfile | null;
  onToggleMute?: () => void;
  onTogglePlay?: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  isPlaying = false,
  isMuted = false,
  brandConfig,
  user = null,
  onToggleMute,
  onOpenProfile
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNavId, setHoveredNavId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 920 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'hero', label: 'HOME', href: '#hero' },
    { id: 'about', label: 'ABOUT', href: '#about' },
    { id: 'portfolio', label: 'WORK', href: '#portfolio' },
    { id: 'pricing', label: 'PRICING', href: '#pricing' },
    { id: 'contact', label: 'CONTACT', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
    if (href === '#contact') {
      setTimeout(() => {
        const input = document.getElementById('client-name');
        if (input) input.focus();
      }, 400);
    }
  };

  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <motion.header
        id="main-navbar"
        initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: premiumEase }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'apple-glass py-3 shadow-xl'
            : 'bg-transparent border-b border-transparent py-4 sm:py-5'
        }`}
        style={{
          paddingLeft: 'clamp(20px, 5vw, 80px)',
          paddingRight: 'clamp(20px, 5vw, 80px)'
        }}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          
          {/* Logo / Brand Identity */}
          <a
            href="#hero"
            onClick={(e) => handleNavClick(e, '#hero')}
            id="nav-logo-link"
            className="group flex items-center transition-all cursor-pointer select-none"
            aria-label="Melofy Home"
          >
            <MelofyLogo brandConfig={brandConfig} size="md" showTagline={true} />
          </a>

          {/* Desktop Navigation Links: Apple/Spotify Sleek Capsule */}
          <nav
            id="desktop-nav"
            className="hidden min-[920px]:flex items-center gap-1 p-1.5 rounded-full apple-glass shadow-md"
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              const isHovered = hoveredNavId === link.id;

              return (
                <a
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  onMouseEnter={() => setHoveredNavId(link.id)}
                  onMouseLeave={() => setHoveredNavId(null)}
                  className={`font-body text-xs font-semibold tracking-wider transition-all duration-200 relative px-4 py-2 rounded-full cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[var(--accent)] text-[#090A0C] font-bold shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/10'
                  }`}
                  style={{
                    transform: isHovered && !isActive ? 'translateY(-1px)' : 'none'
                  }}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#090A0C] animate-pulse" />
                  )}
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Action Group: Mute Controller, Google Account Profile & CTA */}
          <div className="hidden min-[920px]:flex items-center gap-2.5">
            
            {/* Desktop Convenient Mute Toggle Button */}
            {onToggleMute && (
              <button
                id="navbar-mute-toggle-btn"
                type="button"
                onClick={onToggleMute}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer apple-glass ${
                  isMuted
                    ? 'text-rose-400 border-rose-500/40 hover:bg-rose-500/10'
                    : 'text-[var(--text-main)] border-[var(--glass-border)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span className="font-code text-[10px] uppercase font-bold">UNMUTE</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" />
                    {isPlaying && (
                      <div className="flex items-end gap-0.5 h-2.5">
                        <span className="w-0.5 bg-[var(--accent)] rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]" />
                        <span className="w-0.5 bg-[var(--accent)] rounded-full animate-[equalizer_0.6s_ease-in-out_infinite_0.2s]" />
                        <span className="w-0.5 bg-[var(--accent)] rounded-full animate-[equalizer_0.9s_ease-in-out_infinite_0.4s]" />
                      </div>
                    )}
                    <span className="font-code text-[10px] uppercase">MUTE</span>
                  </>
                )}
              </button>
            )}

            {/* Google User Profile Button */}
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full apple-glass hover:border-[var(--accent)] transition-all cursor-pointer text-xs font-semibold text-[var(--text-main)]"
              >
                {user ? (
                  <>
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                      alt={user.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
                    <span>Sign In</span>
                  </>
                )}
              </button>
            )}

            {/* Primary CTA Button */}
            <a
              id="nav-cta-button"
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="group font-body text-xs font-bold px-5 py-2.5 rounded-full bg-[var(--accent)] text-[#090A0C] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all duration-200 shadow-md cursor-pointer inline-flex items-center gap-1.5 tracking-wide"
            >
              <span>GET A SONG</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex min-[920px]:hidden items-center gap-2">
            {onToggleMute && (
              <button
                id="mobile-nav-mute-btn"
                type="button"
                onClick={onToggleMute}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer apple-glass ${
                  isMuted
                    ? 'text-rose-400 border-rose-500/40'
                    : 'text-[var(--accent)] border-[var(--glass-border)]'
                }`}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[var(--accent)]" />
                )}
              </button>
            )}

            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="w-9 h-9 rounded-full flex items-center justify-center apple-glass text-[var(--text-main)] cursor-pointer"
              >
                {user ? (
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                    alt={user.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-[var(--accent)]" />
                )}
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="relative w-10 h-10 rounded-full flex items-center justify-center z-50 transition-all cursor-pointer apple-glass"
            >
              <div className="w-4 h-3.5 flex flex-col justify-between items-center pointer-events-none">
                <span
                  className="w-full h-[2px] rounded-full transition-transform origin-center bg-[var(--text-main)]"
                  style={{
                    transitionDuration: '0.3s',
                    transform: mobileMenuOpen ? 'translateY(6px) rotate(45deg)' : 'none'
                  }}
                />
                <span
                  className="w-full h-[2px] rounded-full transition-all origin-center bg-[var(--text-main)]"
                  style={{
                    transitionDuration: '0.3s',
                    opacity: mobileMenuOpen ? 0 : 1,
                    transform: mobileMenuOpen ? 'scaleX(0)' : 'scaleX(1)'
                  }}
                />
                <span
                  className="w-full h-[2px] rounded-full transition-transform origin-center bg-[var(--text-main)]"
                  style={{
                    transitionDuration: '0.3s',
                    transform: mobileMenuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none'
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Fullscreen Menu Overlay */}
      <div
        id="mobile-menu-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className="fixed inset-0 z-50 flex flex-col justify-center items-center px-6 min-[920px]:hidden overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-main)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          opacity: mobileMenuOpen ? 1 : 0,
          pointerEvents: mobileMenuOpen ? 'auto' : 'none',
          transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-6 right-6 w-10 h-10 rounded-full apple-glass flex items-center justify-center text-[var(--text-main)] transition-colors z-20 cursor-pointer"
          aria-label="Close menu"
        >
          <span className="font-display font-bold text-sm">✕</span>
        </button>

        <div
          className="w-full max-w-sm flex flex-col items-center space-y-5 text-center relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <MelofyLogo brandConfig={brandConfig} size="lg" layout="vertical" />

          <div className="w-full space-y-2 pt-3">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`block py-3.5 px-6 rounded-2xl font-display font-bold text-lg tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent)] text-[#090A0C] shadow-lg'
                      : 'text-[var(--text-main)] hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          <div className="pt-4 w-full">
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="w-full py-4 rounded-full bg-[var(--accent)] text-[#090A0C] font-body font-bold text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <span>COMMISSION A SONG</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
