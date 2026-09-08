import { useState, useEffect } from 'react';
import { useCookieConsentStore } from '../../store/useCookieConsentStore';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';

export function CookieBanner() {
  const { 
    hasConsented, 
    isBannerVisible, 
    preferences, 
    acceptAll, 
    rejectNonEssential, 
    setConsent,
    hideBanner
  } = useCookieConsentStore();

  const [showPreferences, setShowPreferences] = useState(false);
  const [localPrefs, setLocalPrefs] = useState(preferences);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  // If the user hasn't consented, the banner should be visible initially.
  // The store defaults isBannerVisible to true.
  if (!isBannerVisible) return null;

  const handleSavePreferences = () => {
    setConsent(localPrefs);
    setShowPreferences(false);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] px-4 md:px-6 lg:px-12 pb-4 md:pb-6 pointer-events-none">
      <AnimatePresence>
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-foreground text-background w-full max-w-[1200px] mx-auto p-6 md:p-8 shadow-2xl pointer-events-auto flex flex-col gap-6"
        >
          {!showPreferences ? (
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="max-w-2xl">
                <h3 className="text-lg font-medium tracking-wide uppercase mb-2">Your Privacy</h3>
                <p className="text-sm font-light text-background/80 leading-relaxed">
                  We use strictly necessary cookies to make our site work. We'd also like to set optional analytics and marketing cookies to help us improve it. We won't set optional cookies unless you enable them. 
                  Read our <Link to="/cookie-policy" className="underline underline-offset-4 hover:text-white transition-colors">Cookie Policy</Link> for more information.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => setShowPreferences(true)}
                  className="text-xs font-medium uppercase tracking-widest px-6 py-3 border border-background/20 hover:bg-background/10 transition-colors whitespace-nowrap"
                >
                  Manage
                </button>
                <button 
                  onClick={rejectNonEssential}
                  className="text-xs font-medium uppercase tracking-widest px-6 py-3 border border-background/20 hover:bg-background/10 transition-colors whitespace-nowrap"
                >
                  Reject Optional
                </button>
                <button 
                  onClick={acceptAll}
                  className="text-xs font-medium uppercase tracking-widest px-6 py-3 bg-background text-foreground hover:bg-background/90 transition-colors whitespace-nowrap"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-8"
            >
              <div className="flex justify-between items-center border-b border-background/20 pb-4">
                <h3 className="text-lg font-medium tracking-wide uppercase">Manage Preferences</h3>
                <button 
                  onClick={() => hasConsented ? hideBanner() : setShowPreferences(false)} 
                  className="text-xs font-medium tracking-widest uppercase hover:text-background/70"
                >
                  Close
                </button>
              </div>
              
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Strictly Necessary</h4>
                    <p className="text-xs font-light text-background/70 leading-relaxed">Required for the website to function (e.g., shopping cart, secure login). Cannot be disabled.</p>
                  </div>
                  <div className="text-xs font-medium uppercase tracking-widest px-2 py-1 bg-background/20 rounded">
                    Always On
                  </div>
                </div>
                
                <div className="flex justify-between items-start gap-4 border-t border-background/10 pt-6">
                  <div>
                    <h4 className="font-medium mb-1">Analytics</h4>
                    <p className="text-xs font-light text-background/70 leading-relaxed">Helps us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={localPrefs.analytics}
                      onChange={(e) => setLocalPrefs(prev => ({ ...prev, analytics: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-background/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-background/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-foreground"></div>
                  </label>
                </div>
                
                <div className="flex justify-between items-start gap-4 border-t border-background/10 pt-6">
                  <div>
                    <h4 className="font-medium mb-1">Marketing</h4>
                    <p className="text-xs font-light text-background/70 leading-relaxed">Used to track visitors across websites to display relevant advertisements.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={localPrefs.marketing}
                      onChange={(e) => setLocalPrefs(prev => ({ ...prev, marketing: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-background/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:border-background/30 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-foreground"></div>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-background/20">
                <button 
                  onClick={handleSavePreferences}
                  className="text-xs font-medium uppercase tracking-widest px-8 py-4 bg-background text-foreground hover:bg-background/90 transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
