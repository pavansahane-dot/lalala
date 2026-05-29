import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const TermsOfService = () => {
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
        <h1 className="text-4xl font-black text-[#16191f] mb-4">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using ZeroTraceVPN ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">2. Service Description</h2>
            <p className="text-gray-600 leading-relaxed">
              ZeroTraceVPN provides Virtual Private Network (VPN) services that encrypt your internet traffic and protect your online privacy. We offer both free and paid subscription plans with varying features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">3. Account Registration</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To use certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
              <li>Not share your account with others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You agree NOT to use the Service to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Engage in illegal activities or violate any laws</li>
              <li>Distribute malware, viruses, or harmful code</li>
              <li>Conduct DDoS attacks or network abuse</li>
              <li>Spam, phish, or engage in fraudulent activities</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, threaten, or harm others</li>
              <li>Access or attempt to access unauthorized systems</li>
              <li>Resell or redistribute the Service without permission</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              Violation of this policy may result in immediate account termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">5. Subscription Plans</h2>
            
            <h3 className="text-lg font-semibold text-[#16191f] mb-2 mt-4">5.1 Free Plan</h3>
            <p className="text-gray-600 leading-relaxed">
              Our free plan provides basic VPN access with limited features. We reserve the right to modify or discontinue the free plan at any time.
            </p>

            <h3 className="text-lg font-semibold text-[#16191f] mb-2 mt-4">5.2 Paid Plans</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Paid subscriptions are billed monthly or annually. By subscribing, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Automatic renewal unless cancelled</li>
              <li>Current pricing at time of renewal</li>
              <li>No refunds for partial months</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#16191f] mb-2 mt-4">5.3 Cancellation</h3>
            <p className="text-gray-600 leading-relaxed">
              You may cancel your subscription at any time. Access continues until the end of the billing period. No refunds for unused time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">6. Payment Terms</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Payments are processed through Stripe. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide valid payment information</li>
              <li>Authorize automatic billing for subscriptions</li>
              <li>Pay all applicable taxes</li>
              <li>Update payment information if it changes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">7. Refund Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We offer a 7-day money-back guarantee for first-time subscribers. Refund requests must be submitted within 7 days of initial purchase. Refunds are not available for renewals or after the 7-day period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">8. Service Availability</h2>
            <p className="text-gray-600 leading-relaxed">
              We strive for 99% uptime but do not guarantee uninterrupted service. We may perform maintenance, updates, or experience outages. We are not liable for service interruptions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">9. Privacy and Data</h2>
            <p className="text-gray-600 leading-relaxed">
              We operate a strict no-logs policy. Your use of the Service is also governed by our <Link to="/privacy-policy" className="text-[#ff9900] hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">10. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              All content, trademarks, and intellectual property related to the Service are owned by ZeroTraceVPN. You may not copy, modify, or distribute our content without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">11. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE ERROR-FREE, SECURE, OR UNINTERRUPTED.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">12. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">13. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">14. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">15. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#16191f] mb-4">16. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              For questions about these Terms:
            </p>
            <ul className="list-none text-gray-600 space-y-2 mt-4">
              <li><strong>Email:</strong> <a href="mailto:legal@zerotracevpn.com" className="text-[#ff9900] hover:underline">legal@zerotracevpn.com</a></li>
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

export default TermsOfService;
