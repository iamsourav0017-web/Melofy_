/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Premium easing curve: cubic-bezier(0.22, 1, 0.36, 1)
export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: customDelay,
      ease: premiumEase
    }
  })
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.85,
      delay: customDelay,
      ease: premiumEase
    }
  })
};

export const lineReveal = {
  hidden: { opacity: 0, y: 24, clipPath: 'inset(0 0 100% 0)' },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    clipPath: 'inset(0 0 0% 0)',
    transition: {
      duration: 0.8,
      delay: customDelay,
      ease: premiumEase
    }
  })
};

export const defaultViewport = {
  once: true,
  amount: 0.2
} as const;
