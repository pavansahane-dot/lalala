import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#232f3e] border-t border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-5 h-5 text-[#ff9900] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/80 leading-relaxed">
            <p className="mb-2">
              We use essential cookies to provide authentication and session management. 
              We do not use tracking or advertising cookies.
            </p>
            <Link to="/privacy-policy" className="text-[#ff9900] hover:underline text-xs">
              Learn more in our Privacy Policy
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={declineCookies}
            className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="px-6 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black text-sm font-bold rounded transition-all"
          >
            Accept
          </button>
          <button
            onClick={declineCookies}
            className="p-2 text-white/40 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
