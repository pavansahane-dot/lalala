// Simple Analytics Utility
// Tracks events locally without external services

interface AnalyticsEvent {
  event: string;
  timestamp: number;
  page?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

class Analytics {
  private enabled: boolean = true;
  private events: AnalyticsEvent[] = [];

  constructor() {
    // Check if user has consented to analytics
    const consent = localStorage.getItem('cookieConsent');
    this.enabled = consent === 'accepted';
  }

  // Track page view
  trackPageView(page: string) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      event: 'page_view',
      page,
      timestamp: Date.now()
    };

    this.logEvent(event);
  }

  // Track user action
  trackEvent(eventName: string, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    const event: AnalyticsEvent = {
      event: eventName,
      timestamp: Date.now(),
      page: window.location.pathname,
      metadata
    };

    this.logEvent(event);
  }

  // Track user signup
  trackSignup(userId: string) {
    this.trackEvent('user_signup', { userId });
  }

  // Track user login
  trackLogin(userId: string) {
    this.trackEvent('user_login', { userId });
  }

  // Track subscription
  trackSubscription(plan: string, userId: string) {
    this.trackEvent('subscription', { plan, userId });
  }

  // Track VPN connection
  trackVpnConnect(protocol: string) {
    this.trackEvent('vpn_connect', { protocol });
  }

  // Track config download
  trackConfigDownload(protocol: string) {
    this.trackEvent('config_download', { protocol });
  }

  // Private method to log events
  private logEvent(event: AnalyticsEvent) {
    this.events.push(event);
    
    // Keep only last 100 events in memory
    if (this.events.length > 100) {
      this.events.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }
  }

  // Get all tracked events (for debugging)
  getEvents() {
    return this.events;
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const analytics = new Analytics();

// React hook for easy usage
export const useAnalytics = () => {
  return analytics;
};
