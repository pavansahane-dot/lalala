import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Mail, MessageSquare, Bug, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      toast.success('Message sent successfully! We\'ll respond within 24 hours.');
      setFormData({ name: '', email: '', subject: 'general', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-4xl font-black text-[#16191f] mb-4">Contact & Support</h1>
        <p className="text-gray-500 mb-8">Get in touch with our team. We typically respond within 24 hours.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
            <Mail className="w-8 h-8 text-[#ff9900] mb-3" />
            <h3 className="font-bold text-[#16191f] mb-2">Email Support</h3>
            <p className="text-gray-600 text-sm mb-3">For general inquiries and support</p>
            <a href="mailto:support@zerotracevpn.com" className="text-[#ff9900] hover:underline text-sm font-semibold">
              support@zerotracevpn.com
            </a>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
            <Bug className="w-8 h-8 text-[#ff9900] mb-3" />
            <h3 className="font-bold text-[#16191f] mb-2">Bug Reports</h3>
            <p className="text-gray-600 text-sm mb-3">Found a bug? Let us know</p>
            <a href="mailto:bugs@zerotracevpn.com" className="text-[#ff9900] hover:underline text-sm font-semibold">
              bugs@zerotracevpn.com
            </a>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm p-6">
            <MessageSquare className="w-8 h-8 text-[#ff9900] mb-3" />
            <h3 className="font-bold text-[#16191f] mb-2">Feedback</h3>
            <p className="text-gray-600 text-sm mb-3">Share your suggestions</p>
            <a href="mailto:feedback@zerotracevpn.com" className="text-[#ff9900] hover:underline text-sm font-semibold">
              feedback@zerotracevpn.com
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-8">
          <h2 className="text-2xl font-bold text-[#16191f] mb-6">Send us a message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#16191f] mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#ff9900]"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#16191f] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#ff9900]"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#16191f] mb-2">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#ff9900]"
              >
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#16191f] mb-2">
                Message
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#ff9900] resize-none"
                placeholder="Tell us how we can help..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-[#ff9900] hover:bg-[#e88b00] text-black font-bold rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
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

export default Contact;
