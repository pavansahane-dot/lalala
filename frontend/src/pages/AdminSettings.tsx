import { useState } from 'react';
import { Settings, Shield, Wifi, Users, Mail, CreditCard, Lock, Activity, Bell, FileText, Globe } from 'lucide-react';
import AdminGeneralTab from '../components/admin-settings/AdminGeneralTab';
import {
  AdminOpenVPNTab,
  AdminWireGuardTab,
  AdminServersTab,
  AdminUsersTab,
  AdminEmailTab,
  AdminBillingTab,
  AdminSecurityTab,
  AdminMonitoringTab,
  AdminNotificationsTab,
  AdminLegalTab,
  AdminProxyTab,
} from '../components/admin-settings/PlaceholderTabs';

type TabId = 'general' | 'openvpn' | 'wireguard' | 'servers' | 'users' | 'email' | 'billing' | 'security' | 'monitoring' | 'notifications' | 'legal' | 'proxy';

const tabs = [
  { id: 'general' as TabId, label: 'General', icon: Settings },
  { id: 'openvpn' as TabId, label: 'OpenVPN', icon: Shield },
  { id: 'wireguard' as TabId, label: 'WireGuard', icon: Wifi },
  { id: 'servers' as TabId, label: 'Servers', icon: Globe },
  { id: 'users' as TabId, label: 'User Settings', icon: Users },
  { id: 'email' as TabId, label: 'Email / SMTP', icon: Mail },
  { id: 'billing' as TabId, label: 'Plans & Billing', icon: CreditCard },
  { id: 'security' as TabId, label: 'Security', icon: Lock },
  { id: 'monitoring' as TabId, label: 'Monitoring & Logs', icon: Activity },
  { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
  { id: 'legal' as TabId, label: 'Legal Pages', icon: FileText },
  { id: 'proxy' as TabId, label: 'Proxy Settings', icon: Globe },
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  const renderTab = () => {
    switch (activeTab) {
      case 'general': return <AdminGeneralTab />;
      case 'openvpn': return <AdminOpenVPNTab />;
      case 'wireguard': return <AdminWireGuardTab />;
      case 'servers': return <AdminServersTab />;
      case 'users': return <AdminUsersTab />;
      case 'email': return <AdminEmailTab />;
      case 'billing': return <AdminBillingTab />;
      case 'security': return <AdminSecurityTab />;
      case 'monitoring': return <AdminMonitoringTab />;
      case 'notifications': return <AdminNotificationsTab />;
      case 'legal': return <AdminLegalTab />;
      case 'proxy': return <AdminProxyTab />;
      default: return <AdminGeneralTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#ff9900] rounded-lg flex items-center justify-center shadow-sm">
          <Settings className="w-6 h-6 text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-[#16191f]">System Settings</h1>
          <p className="text-gray-500 text-sm">Configure system-wide preferences and options</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2">
            <nav className="space-y-0.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#ff9900] text-black font-bold'
                        : 'text-gray-600 hover:text-[#16191f] hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
