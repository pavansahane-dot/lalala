import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthStore } from '../store/authStore';

const PublicNav = () => {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, selectedLanguage, setSelectedLanguage, languages } = useLanguage();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToProtocol = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  const links = [
    { to: '/',      label: 'Home' },
    { to: '/setup', label: t.setupGuide },
  ];

  return (
    <header className="bg-[#232f3e] border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#ff9900]" />
          <span className="text-white font-black tracking-tight">
            ZeroTrace<span className="text-[#ff9900]">VPN</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                location.pathname === l.to ? 'text-[#ff9900]' : 'text-white/70 hover:text-white'
              }`}>
              {l.label}
            </Link>
          ))}
          <a href="/#protocol" onClick={scrollToProtocol}
            className="px-3 py-1.5 rounded text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer">
            Protocol Comparison
          </a>
        </nav>

        {/* Language switcher */}
        <div className="hidden md:flex items-center relative">
          <button onClick={() => setLangOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors">
            <Globe className="w-4 h-4" />
            {languages.find(l => l.code === selectedLanguage)?.name}
          </button>
          {langOpen && (
            <div className="absolute top-full right-0 mt-1 bg-[#1a2332] border border-white/10 rounded shadow-lg z-50 min-w-[120px]">
              {languages.map(l => (
                <button key={l.code}
                  onClick={() => { setSelectedLanguage(l.code as any); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    selectedLanguage === l.code ? 'text-[#ff9900]' : 'text-white/70 hover:text-white'
                  }`}>
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <Link to="/dashboard"
              className="px-4 py-1.5 bg-[#ff9900] hover:bg-[#e88b00] text-black text-sm font-bold rounded transition-all">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors px-3 py-1.5">
                {t.signin}
              </Link>
              <Link to="/signup"
                className="px-4 py-1.5 bg-[#ff9900] hover:bg-[#e88b00] text-black text-sm font-bold rounded transition-all">
                {t.signup}
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-white/70 hover:text-white" onClick={() => setOpen(o => !o)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#1a2332] border-t border-white/10 px-6 py-4 space-y-2">
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className="block text-white/70 hover:text-white text-sm py-2 font-medium">
              {l.label}
            </Link>
          ))}
          <a href="/#protocol" onClick={scrollToProtocol}
            className="block text-white/70 hover:text-white text-sm py-2 font-medium cursor-pointer">
            Protocol Comparison
          </a>
          <div className="pt-2 border-t border-white/10 flex gap-3">
            <Link to="/login" onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white text-sm font-medium py-2">
              {t.signin}
            </Link>
            <Link to="/signup" onClick={() => setOpen(false)}
              className="px-4 py-1.5 bg-[#ff9900] text-black text-sm font-bold rounded">
              {t.signup}
            </Link>
          </div>
          <div className="pt-2 border-t border-white/10">
            <p className="text-white/40 text-xs mb-2 uppercase tracking-widest">Language</p>
            <div className="flex flex-wrap gap-2">
              {languages.map(l => (
                <button key={l.code}
                  onClick={() => { setSelectedLanguage(l.code as any); setOpen(false); }}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    selectedLanguage === l.code
                      ? 'bg-[#ff9900] text-black'
                      : 'bg-white/10 text-white/70 hover:text-white'
                  }`}>
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNav;
