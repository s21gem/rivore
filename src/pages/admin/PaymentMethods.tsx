import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { CreditCard, Save, Lock, Zap, CheckCircle2, XCircle, Trash2, Webhook, RefreshCw, Loader2 } from 'lucide-react';
import Loader from '../../components/Loader';

export default function PaymentMethods() {
  const { token } = useAuthStore();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Payment settings saved successfully.' });
        fetchSettings(); // Refetch to get masked keys
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestStatus(null);
    try {
      // Use the actual API key from input, but if it's masked we can't test properly on frontend alone unless backend handles it
      // For this test, we send whatever is in the input. If it's masked, the backend should ideally use the DB key.
      const res = await fetch('/api/payment/uddoktapay/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          apiKey: settings.paymentUddoktaPay.apiKey,
          baseUrl: settings.paymentUddoktaPay.baseUrl
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTestStatus(`Success! Response time: ${data.responseTime}ms`);
      } else {
        setTestStatus(`Failed: ${data.message}`);
      }
    } catch (error) {
      setTestStatus('Failed to connect to gateway.');
    } finally {
      setTestLoading(false);
    }
  };

  if (loading || !settings) return <Loader />;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-foreground flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            Payment Center
          </h1>
          <p className="text-muted-foreground mt-1">Configure and manage payment gateways and automation rules.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="space-y-8">
        {/* ============ UddoktaPay ============ */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-green-500/5 p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">UP</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">UddoktaPay</h3>
                <p className="text-sm text-muted-foreground">Primary payment gateway for Bangladesh</p>
              </div>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={settings.paymentUddoktaPay?.enabled || false}
                  onChange={(e) => setSettings({ ...settings, paymentUddoktaPay: { ...settings.paymentUddoktaPay, enabled: e.target.checked } })}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${settings.paymentUddoktaPay?.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.paymentUddoktaPay?.enabled ? 'transform translate-x-6' : ''}`}></div>
              </div>
            </label>
          </div>

          {settings.paymentUddoktaPay?.enabled && (
            <div className="p-6 space-y-8">
              
              {/* Credentials Section */}
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-muted-foreground" /> API Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">API Key</label>
                    <input 
                      type="text" 
                      value={settings.paymentUddoktaPay.apiKey} 
                      onChange={(e) => setSettings({ ...settings, paymentUddoktaPay: { ...settings.paymentUddoktaPay, apiKey: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-green-500/30 outline-none font-mono text-sm" 
                      placeholder="Enter API Key"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Will be masked upon saving for security.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">API Base URL</label>
                    <input 
                      type="url" 
                      value={settings.paymentUddoktaPay.baseUrl} 
                      onChange={(e) => setSettings({ ...settings, paymentUddoktaPay: { ...settings.paymentUddoktaPay, baseUrl: e.target.value } })} 
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-green-500/30 outline-none font-mono text-sm" 
                      placeholder="https://rivore.paymently.io/api"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <button 
                    onClick={handleTestConnection}
                    disabled={testLoading}
                    className="bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
                  >
                    {testLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Test Connection
                  </button>
                  {testStatus && (
                    <span className={`text-sm font-medium ${testStatus.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                      {testStatus}
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-border" />

              {/* Webhook Settings */}
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Webhook className="w-5 h-5 text-muted-foreground" /> Webhook & IPN
                </h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.paymentUddoktaPay.enableWebhookProcessing} 
                      onChange={(e) => setSettings({ ...settings, paymentUddoktaPay: { ...settings.paymentUddoktaPay, enableWebhookProcessing: e.target.checked } })} 
                      className="w-5 h-5 accent-green-600 rounded" 
                    />
                    <div>
                      <span className="block text-sm font-medium text-foreground">Enable Webhook Processing</span>
                      <span className="block text-xs text-muted-foreground">Allow background verification of payments via IPN</span>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Webhook URL (Copy to UddoktaPay dashboard)</label>
                    <input 
                      type="text" 
                      readOnly
                      value={window.location.origin + '/api/payment/uddoktapay/webhook'}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 outline-none font-mono text-sm text-muted-foreground" 
                    />
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Post-Payment Automation */}
              <div>
                <h4 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-muted-foreground" /> Post-Payment Automations
                </h4>
                <p className="text-sm text-muted-foreground mb-4">These actions will trigger automatically ONLY after payment is verified.</p>
                <div className="space-y-4 bg-muted/20 p-6 rounded-xl border border-border">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.paymentUddoktaPay.autoAwardLoyaltyPoints} 
                      onChange={(e) => setSettings({ ...settings, paymentUddoktaPay: { ...settings.paymentUddoktaPay, autoAwardLoyaltyPoints: e.target.checked } })} 
                      className="w-5 h-5 accent-green-600 rounded" 
                    />
                    <div>
                      <span className="block text-sm font-medium text-foreground">Auto-Award Loyalty Points</span>
                      <span className="block text-xs text-muted-foreground">Add points to user account based on order amount</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.paymentUddoktaPay.autoUpdateMembershipTier} 
                      onChange={(e) => setSettings({ ...settings, paymentUddoktaPay: { ...settings.paymentUddoktaPay, autoUpdateMembershipTier: e.target.checked } })} 
                      className="w-5 h-5 accent-green-600 rounded" 
                    />
                    <div>
                      <span className="block text-sm font-medium text-foreground">Auto-Update Membership Tier</span>
                      <span className="block text-xs text-muted-foreground">Recalculate lifetime spend and update Gold/Silver tiers</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.paymentUddoktaPay.autoSendToSteadfast} 
                      onChange={(e) => setSettings({ ...settings, paymentUddoktaPay: { ...settings.paymentUddoktaPay, autoSendToSteadfast: e.target.checked } })} 
                      className="w-5 h-5 accent-green-600 rounded" 
                    />
                    <div>
                      <span className="block text-sm font-medium text-foreground">Auto-Send to Steadfast Courier</span>
                      <span className="block text-xs text-muted-foreground">Dispatch order to Steadfast immediately upon payment</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.paymentUddoktaPay.enableActivityLogging} 
                      onChange={(e) => setSettings({ ...settings, paymentUddoktaPay: { ...settings.paymentUddoktaPay, enableActivityLogging: e.target.checked } })} 
                      className="w-5 h-5 accent-green-600 rounded" 
                    />
                    <div>
                      <span className="block text-sm font-medium text-foreground">Enable Activity Logging</span>
                      <span className="block text-xs text-muted-foreground">Log payment verifications in Admin Activity Logs</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.paymentUddoktaPay.enableSecurityLogging} 
                      onChange={(e) => setSettings({ ...settings, paymentUddoktaPay: { ...settings.paymentUddoktaPay, enableSecurityLogging: e.target.checked } })} 
                      className="w-5 h-5 accent-green-600 rounded" 
                    />
                    <div>
                      <span className="block text-sm font-medium text-foreground">Enable Security Logging</span>
                      <span className="block text-xs text-muted-foreground">Log unauthorized webhook attempts to Security Center</span>
                    </div>
                  </label>
                </div>
              </div>

            </div>
          )}
        </div>
        
        {/* ============ bKash (Legacy) ============ */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm opacity-60">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#E2136E] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">bK</div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">bKash Merchant (Legacy)</h3>
                <p className="text-sm text-muted-foreground">Tokenized Checkout API</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-foreground">bKash is currently configured via the Settings & CMS page. Please use UddoktaPay for robust automated payments.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
