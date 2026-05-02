import { useState } from 'react';
import { User, Shield, Wifi, Smartphone, Bell, Lock, CreditCard, AlertTriangle } from 'lucide-react';
import ProfileTab from '../components/settings/ProfileTab';
import SecurityTab from '../components/settings/SecurityTab';
import VpnPreferencesTab from '../components/settings/VpnPreferencesTab';
import DevicesTab from '../components/settings/DevicesTab';
import NotificationsTab from '../components/settings/NotificationsTab';
import PrivacyTab from '../components/settings/PrivacyTab';
import BillingTab from '../components/settings/BillingTab';
import DangerZoneTab from '../components/settings/DangerZoneTab';

type TabId = 'profile' | 'security' | 'vpn' | 'devices' | 'notifications' | 'privacy' | 'billing' | 'danger';

const tabs = [
  { id: 'profile' as TabId, label: 'Profile', icon: User },
  { id: 'security' as TabId, label: 'Security', icon: Shield },
  { id: 'vpn' as TabId, label: 'VPN Preferences', icon: Wifi },
  { id: 'devices' as TabId, label: 'Devices', icon: Smartphone },
  { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
  { id: 'privacy' as TabId, label: 'Privacy & Data', icon: Lock },
  { id: 'billing' as TabId, label: 'Billing', icon: CreditCard },
  { id: 'danger' as TabId, label: 'Danger Zone', icon: AlertTriangle },
];

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  const renderTab = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'security': return <SecurityTab />;
      case 'vpn': return <VpnPreferencesTab />;
      case 'devices': return <DevicesTab />;
      case 'notifications': return <NotificationsTab />;
      case 'privacy': return <PrivacyTab />;
      case 'billing': return <BillingTab />;
      case 'danger': return <DangerZoneTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Desktop vertical, Mobile horizontal scroll */}
          <aside className="lg:w-64 shrink-0">
            <nav className="lg:space-y-1 flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDanger = tab.id === 'danger';
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? isDanger
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        : isDanger
                        ? 'text-red-400/60 hover:bg-red-500/5 border border-transparent'
                        : 'text-gray-400 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="font-medium text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderTab()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
