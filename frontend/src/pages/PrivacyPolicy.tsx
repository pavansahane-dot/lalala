import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#f2f3f3]">
      {/* Header */}
      <header className="bg-[#232f3e] text-white py-4 px-6 border-b border-white/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#ff9900]" />
            <span className="font-black">ZeroTrace<span className="text-[#ff9900]">VPN</span></span>
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-[#16191f] mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              ZeroTraceVPN ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our VPN service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">2. Zero-Log Policy</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We operate a strict no-logs policy. We do NOT collect, store, or log:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Your browsing history or websites visited</li>
              <li>Connection timestamps or session duration</li>
              <li>Your original IP address when connected</li>
              <li>DNS queries or traffic content</li>
              <li>Bandwidth usage or connection logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">3. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-[#16191f] mb-2 mt-4">3.1 Account Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Email address (for account recovery and notifications)</li>
              <li>Hashed password (we never store plain-text passwords)</li>
              <li>Account creation date</li>
              <li>Subscription plan type</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#16191f] mb-2 mt-4">3.2 Payment Information</h3>
            <p className="text-gray-600 leading-relaxed">
              Payment processing is handled by Stripe. We do not store your credit card information. Stripe may collect payment details according to their privacy policy.
            </p>

            <h3 className="text-lg font-semibold text-[#16191f] mb-2 mt-4">3.3 Technical Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              For service functionality, we temporarily store:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>VPN configuration files (WireGuard public keys, OpenVPN certificates)</li>
              <li>Device names you assign to your configurations</li>
              <li>Server selection preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">4. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use collected information solely to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide and maintain VPN service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send account-related notifications (password resets, security alerts)</li>
              <li>Respond to support requests</li>
              <li>Improve service quality and performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">5. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We do NOT sell, trade, or rent your personal information. We may share data only in these limited circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Payment Processors:</strong> Stripe processes payments on our behalf</li>
              <li><strong>Legal Compliance:</strong> If required by law or to protect our rights</li>
              <li><strong>Service Providers:</strong> Trusted third parties who assist in operations (under strict confidentiality)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">6. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">7. Your Rights (GDPR)</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you are in the EU, you have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, contact us at: <a href="mailto:privacy@zerotracevpn.com" className="text-[#ff9900] hover:underline">privacy@zerotracevpn.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">8. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain account information for as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">9. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies for authentication and session management. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, but this may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">10. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our service is not intended for users under 18. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For privacy-related questions or concerns:
            </p>
            <ul className="list-none text-gray-600 space-y-2 mt-4">
              <li><strong>Email:</strong> <a href="mailto:privacy@zerotracevpn.com" className="text-[#ff9900] hover:underline">privacy@zerotracevpn.com</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@zerotracevpn.com" className="text-[#ff9900] hover:underline">support@zerotracevpn.com</a></li>
            </ul>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-[#ff9900] hover:text-[#e88b00] font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
