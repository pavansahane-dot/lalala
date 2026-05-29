import { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Zap, Globe, Lock, Eye, Users, Clock,
  CheckCircle, ArrowRight, Download, QrCode, ChevronRight,
  Heart, MapPin, ExternalLink
} from 'lucide-react';
import PublicNav from '../components/PublicNav';
import { useLanguage } from '../context/LanguageContext';

// ── Public footer ─────────────────────────────────────────────────────────────
const PublicFooter = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#232f3e] text-white/60 mt-0">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-10 mb-8">
          {/* Brand — takes up more space */}
          <div className="flex-[2]">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-[#ff9900]" />
              <span className="text-white font-black tracking-tight">ZeroTrace<span className="text-[#ff9900]">VPN</span></span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">Free, open-source VPN service. No ads, no logs, no compromise. Built for privacy, trusted by thousands.</p>
            <div className="flex items-center gap-1.5 mt-3 text-xs">
              <MapPin className="w-3 h-3 text-[#ff9900]" /> Located in India
            </div>
            <div className="flex items-center gap-3 mt-4">
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs">OpenVPN</span>
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs">WireGuard</span>
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs">AES-256-GCM</span>
            </div>
          </div>
          {/* Service */}
          <div className="flex-1">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Service</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/setup" className="hover:text-white transition-colors">{t.setupGuide}</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>
          {/* Support */}
          <div className="flex-1">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          {/* Donate */}
          <div className="flex-1">
            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Support Us</h4>
            <p className="text-sm mb-4 leading-relaxed">This service is completely free. Help us keep the servers running.</p>
            <a href="https://paypal.me" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#e88b00] text-black text-sm font-bold rounded transition-all">
              <Heart className="w-3.5 h-3.5" /> {t.donate}
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <span>{t.copyright}</span>
        </div>
      </div>
    </footer>
  );
};

// ── Main Landing Page ─────────────────────────────────────────────────────────
const Landing = () => {
  const { t } = useLanguage();
  const howRef = useRef<HTMLElement>(null);

  const scrollToHow = () => howRef.current?.scrollIntoView({ behavior: 'smooth' });

  const steps = [
    { n: '01', icon: Download,    title: 'Create Account',    desc: 'Sign up for free in seconds. No credit card required.' },
    { n: '02', icon: Shield,      title: 'Get Your Config',   desc: 'Generate your personal WireGuard or OpenVPN config from your dashboard.' },
    { n: '03', icon: CheckCircle, title: 'Connect & Browse',  desc: 'Import the config, tap Connect. Your traffic is encrypted and your IP is hidden.' },
  ];

  const benefits = [
    { icon: Lock,   title: 'Zero-Log Policy',       desc: 'We never store connection logs, IP addresses, or browsing activity. Ever.' },
    { icon: Users,  title: 'Per-User Configs',       desc: 'Create an account to get dedicated configs, track devices, and revoke access anytime.' },
    { icon: Zap,    title: 'WireGuard Speed',        desc: 'WireGuard is 3× faster than OpenVPN with a leaner codebase and modern cryptography.' },
    { icon: Eye,    title: 'No Ads, No Tracking',    desc: 'Completely ad-free. We are donation-supported, not data-supported.' },
    { icon: Globe,  title: 'Multi-Country Servers',  desc: 'Servers across multiple countries. More being added regularly.' },
    { icon: Clock,  title: '99% Uptime SLA',         desc: 'Health-monitored infrastructure with automatic failover and real-time status.' },
  ];

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex flex-col">
      <PublicNav />

      {/* ── Hero ── */}
      <section className="bg-[#232f3e] text-white py-24 px-6 relative overflow-hidden">
        {/* subtle grid bg */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#ff9900]/10 border border-[#ff9900]/30 rounded-full px-4 py-1.5 text-[#ff9900] text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-[#ff9900] animate-pulse" />
            Free VPN — OpenVPN &amp; WireGuard. No Ads. No Logs.
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
            Your IP. Your Rules.<br />
            <span className="text-[#ff9900]">Zero Traces</span> Left Behind.
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Per-user WireGuard configs with QR codes. No registration required for basic access. Open-source, ad-free, and trusted by thousands worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded transition-all shadow-lg text-sm">
              <Download className="w-4 h-4" /> Get Started Free
            </Link>
            <button onClick={scrollToHow}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded transition-all border border-white/20 text-sm">
              {t.howItWorks} <ChevronRight className="w-4 h-4" />
            </button>
            <Link to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-transparent hover:bg-white/5 text-white/80 hover:text-white font-bold rounded transition-all border border-white/20 text-sm">
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section ref={howRef} className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#ff9900] text-xs font-bold uppercase tracking-widest">{t.howItWorks}</span>
            <h2 className="text-3xl font-black text-[#16191f] mt-2">Connect in 3 easy steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ n, icon: Icon, title, desc }) => (
              <div key={n} className="bg-white border border-gray-200 rounded shadow-sm p-6 relative">
                <span className="absolute top-4 right-4 text-4xl font-black text-gray-100 select-none">{n}</span>
                <div className="w-10 h-10 bg-[#fff8ec] border border-[#ff9900]/20 rounded flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#ff9900]" />
                </div>
                <h3 className="font-bold text-[#16191f] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/setup"
              className="inline-flex items-center gap-2 text-[#ff9900] hover:text-[#e88b00] font-bold text-sm transition-colors">
              View detailed setup guides <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Protocol Comparison ── */}
      <section id="protocol" className="py-20 px-6 bg-white border-y border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#ff9900] text-xs font-bold uppercase tracking-widest">{t.protocolComparison}</span>
            <h2 className="text-3xl font-black text-[#16191f] mt-2">Protocol Comparison</h2>
            <p className="text-gray-500 mt-2 text-sm">All protocols available after sign-up. Pick the one that fits your needs.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#232f3e] text-white">
                  <th className="text-left px-4 py-3 font-bold border border-[#2d3a4a]">Feature</th>
                  <th className="px-4 py-3 font-bold border border-[#2d3a4a] text-center"><span className="inline-flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-400" /> OpenVPN</span></th>
                  <th className="px-4 py-3 font-bold border border-[#2d3a4a] text-center"><span className="inline-flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#ff9900]" /> WireGuard</span></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Speed',            ovpn: 'Good',         wg: '⚡ Excellent' },
                  { feature: 'Security',          ovpn: '✅ Excellent',  wg: '✅ Excellent' },
                  { feature: 'Ease of Setup',     ovpn: 'Moderate',     wg: '✅ Easy' },
                  { feature: 'Hard to Block',     ovpn: '✅ Yes',        wg: 'Moderate' },
                  { feature: 'Software Required', ovpn: 'Yes',          wg: 'Yes' },
                  { feature: 'P2P / Torrents',    ovpn: '✅ Supported',  wg: '✅ Supported' },
                ].map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f2f3f3]/60'}>
                    <td className="px-4 py-3 font-semibold text-[#16191f] border border-gray-200">{row.feature}</td>
                    <td className="px-4 py-3 text-gray-600 border border-gray-200 text-center">{row.ovpn}</td>
                    <td className="px-4 py-3 text-gray-600 border border-gray-200 text-center">{row.wg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#ff9900] text-xs font-bold uppercase tracking-widest">Why ZeroTraceVPN</span>
            <h2 className="text-3xl font-black text-[#16191f] mt-2">Built different. Priced right.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-200 rounded shadow-sm p-6">
                <div className="w-10 h-10 bg-[#fff8ec] border border-[#ff9900]/20 rounded flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#ff9900]" />
                </div>
                <h3 className="font-bold text-[#16191f] mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Account Benefits Banner ── */}
      <section className="py-16 px-6 bg-[#232f3e]">
        <div className="max-w-4xl mx-auto text-center">
          <QrCode className="w-10 h-10 text-[#ff9900] mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-3">Create a free account for more</h2>
          <p className="text-white/60 text-sm mb-6 max-w-xl mx-auto">
            Get dedicated WireGuard configs with QR codes, track your devices, revoke access remotely, and monitor your bandwidth — all for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup"
              className="px-8 py-3 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded transition-all text-sm">
              {t.createAccount} — It's Free
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Landing;
