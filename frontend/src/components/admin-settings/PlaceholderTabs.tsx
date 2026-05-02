// Placeholder components for admin settings tabs
// These can be expanded with full functionality as needed

import { Shield, Wifi, Globe, Users, Mail, CreditCard, Lock, Activity, Bell, FileText } from 'lucide-react';

const PlaceholderTab = ({ title, icon: Icon, description }: any) => (
  <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 p-12 text-center">
    <Icon className="w-16 h-16 text-orange-400 mx-auto mb-4" />
    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
    <p className="text-gray-400">{description}</p>
    <p className="text-sm text-gray-500 mt-4">This tab is under construction</p>
  </div>
);

export const AdminOpenVPNTab = () => (
  <PlaceholderTab
    title="OpenVPN Credentials"
    icon={Shield}
    description="Manage shared OpenVPN username and password"
  />
);

export const AdminWireGuardTab = () => (
  <PlaceholderTab
    title="WireGuard Global Config"
    icon={Wifi}
    description="Configure WireGuard default settings"
  />
);

export const AdminServersTab = () => (
  <PlaceholderTab
    title="Server Management"
    icon={Globe}
    description="Add, edit, and manage VPN servers"
  />
);

export const AdminUsersTab = () => (
  <PlaceholderTab
    title="User Settings"
    icon={Users}
    description="Configure user registration and limits"
  />
);

export const AdminEmailTab = () => (
  <PlaceholderTab
    title="Email / SMTP"
    icon={Mail}
    description="Configure SMTP settings and email templates"
  />
);

export const AdminBillingTab = () => (
  <PlaceholderTab
    title="Plans & Billing"
    icon={CreditCard}
    description="Manage subscription plans and payment gateways"
  />
);

export const AdminSecurityTab = () => (
  <PlaceholderTab
    title="Security Settings"
    icon={Lock}
    description="Configure JWT, rate limiting, and security options"
  />
);

export const AdminMonitoringTab = () => (
  <PlaceholderTab
    title="Monitoring & Logs"
    icon={Activity}
    description="View system logs and configure monitoring"
  />
);

export const AdminNotificationsTab = () => (
  <PlaceholderTab
    title="Admin Notifications"
    icon={Bell}
    description="Configure admin alerts and webhooks"
  />
);

export const AdminLegalTab = () => (
  <PlaceholderTab
    title="Legal Pages"
    icon={FileText}
    description="Edit privacy policy, terms of service, and legal documents"
  />
);

export const AdminProxyTab = () => (
  <PlaceholderTab
    title="Proxy Settings"
    icon={Globe}
    description="Configure proxy server settings"
  />
);
