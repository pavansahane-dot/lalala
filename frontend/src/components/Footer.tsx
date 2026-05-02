import { Shield } from 'lucide-react';

const Footer = () => (
  <footer className="bg-white border-t border-gray-200 mt-8">
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#ff9900]" />
          <span className="font-black text-[#16191f] text-sm tracking-tight">
            ZeroTrace<span className="text-[#ff9900]">VPN</span>
          </span>
        </div>

        <p className="text-xs text-gray-400">© 2026 ZeroTraceVPN. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
