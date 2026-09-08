import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

type CookieConsentState = {
  hasConsented: boolean;
  preferences: CookiePreferences;
  isBannerVisible: boolean;
  setConsent: (prefs: Partial<CookiePreferences>) => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  showBanner: () => void;
  hideBanner: () => void;
};

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set) => ({
      hasConsented: false,
      preferences: { necessary: true, analytics: false, marketing: false },
      isBannerVisible: true,
      
      setConsent: (prefs) => set((state) => ({
        hasConsented: true,
        preferences: { ...state.preferences, ...prefs, necessary: true }, // necessary is always true
        isBannerVisible: false
      })),
      
      acceptAll: () => set({
        hasConsented: true,
        preferences: { necessary: true, analytics: true, marketing: true },
        isBannerVisible: false
      }),
      
      rejectNonEssential: () => set({
        hasConsented: true,
        preferences: { necessary: true, analytics: false, marketing: false },
        isBannerVisible: false
      }),
      
      showBanner: () => set({ isBannerVisible: true }),
      hideBanner: () => set({ isBannerVisible: false })
    }),
    {
      name: 'vancy-cookie-consent',
    }
  )
);
