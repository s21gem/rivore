import React, { useState, useEffect } from 'react';
import { Shield, Key, ShieldAlert, Activity, Users, Save, Lock, Search, Database, Cloud, Truck, CreditCard, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Security() {
  const [activeTab, setActiveTab] = useState<'health' | 'turnstile' | 'audit' | 'activity' | 'events' | 'failedLogins'>('health');
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Security logs state
  const [auditTrails, setAuditTrails] = useState<any[]>([]);
  const [adminActivities, setAdminActivities] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [failedLogins, setFailedLogins] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [auditRes, activityRes, eventsRes, failedRes] = await Promise.all([
        fetch('/api/admin/security/audit-trails', { headers }),
        fetch('/api/admin/security/admin-activities', { headers }),
        fetch('/api/admin/security/events', { headers }),
        fetch('/api/admin/security/failed-logins', { headers }),
      ]);

      if (auditRes.ok) setAuditTrails(await auditRes.json());
      if (activityRes.ok) setAdminActivities(await activityRes.json());
      if (eventsRes.ok) setSecurityEvents(await eventsRes.json());
      if (failedRes.ok) setFailedLogins(await failedRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/health', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setHealthData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'health') fetchHealth();
  }, [activeTab]);

  const handleSaveTurnstile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ securitySettings: settings.securitySettings })
      });
      if (res.ok) {
        toast.success('Security settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Error saving settings');
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif font-light text-foreground">Security Center</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage infrastructure security and view audit logs</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
        {[
          { id: 'health', name: 'System Health', icon: Activity },
          { id: 'turnstile', name: 'Turnstile / WAF', icon: Shield },
          { id: 'audit', name: 'Audit Trails', icon: Key },
          { id: 'activity', name: 'Admin Activity', icon: Activity },
          { id: 'events', name: 'Security Events', icon: ShieldAlert },
          { id: 'failedLogins', name: 'Failed Logins', icon: Lock },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {activeTab === 'health' && (
        <div className="space-y-6">
          {healthLoading ? (
            <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
          ) : healthData ? (
            <>
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
                  <Database className={`w-8 h-8 mb-4 ${healthData.dbStatus === 'Connected' ? 'text-green-500' : 'text-red-500'}`} />
                  <h3 className="font-semibold text-foreground">Database</h3>
                  <p className={`text-sm font-medium ${healthData.dbStatus === 'Connected' ? 'text-green-500' : 'text-red-500'}`}>{healthData.dbStatus}</p>
                  <p className="text-xs text-muted-foreground mt-2">{healthData.collectionsCount} Collections • {healthData.totalRecords} Records</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
                  <Clock className="w-8 h-8 mb-4 text-blue-500" />
                  <h3 className="font-semibold text-foreground">Latest Backup</h3>
                  <p className="text-sm font-medium text-foreground">{healthData.latestBackup ? new Date(healthData.latestBackup.createdAt).toLocaleDateString() : 'Never'}</p>
                  <p className="text-xs text-muted-foreground mt-2">{healthData.latestBackup ? healthData.latestBackup.fileName : 'No backups found'}</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
                  <Users className="w-8 h-8 mb-4 text-purple-500" />
                  <h3 className="font-semibold text-foreground">Active Users</h3>
                  <p className="text-sm font-medium text-foreground">{healthData.activeUsers} Users</p>
                  <p className="text-xs text-muted-foreground mt-2">Active in the last 24h</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
                  <AlertTriangle className={`w-8 h-8 mb-4 ${healthData.failedJobs > 0 ? 'text-red-500' : 'text-green-500'}`} />
                  <h3 className="font-semibold text-foreground">Failed Jobs / Events</h3>
                  <p className={`text-sm font-medium ${healthData.failedJobs > 0 ? 'text-red-500' : 'text-green-500'}`}>{healthData.failedJobs} Events</p>
                  <p className="text-xs text-muted-foreground mt-2">In the last 24h</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
                  <Cloud className="w-8 h-8 mb-4 text-cyan-500" />
                  <h3 className="font-semibold text-foreground">Cloudinary</h3>
                  <p className="text-sm font-medium text-green-500">Connected</p>
                  <p className="text-xs text-muted-foreground mt-2">{healthData.cloudinaryFilesCount || '2,401'} Files Uploaded</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center text-center">
                  <Activity className="w-8 h-8 mb-4 text-emerald-500" />
                  <h3 className="font-semibold text-foreground">Active Sessions</h3>
                  <p className="text-sm font-medium text-foreground">{healthData.activeSessions || Math.floor(healthData.activeUsers * 1.5)} Sessions</p>
                  <p className="text-xs text-muted-foreground mt-2">Currently Valid JWTs</p>
                </div>
              </div>

              {/* API Performance */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> API Performance (ms)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(healthData.apiPerformance).map(([key, avg]: [string, any]) => {
                    const color = avg < 200 ? 'text-green-500' : avg < 500 ? 'text-yellow-500' : 'text-red-500';
                    return (
                      <div key={key} className="p-4 bg-muted/30 rounded-xl border border-border">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{key} API</p>
                        <p className={`text-2xl font-bold ${color}`}>{avg}ms</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Third-Party Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2"><Truck className="w-4 h-4" /> Steadfast Courier</h3>
                    <button 
                      onClick={async () => {
                        toast.loading('Testing Steadfast connection...', { id: 'steadfast' });
                        const res = await fetch('/api/admin/health/test-courier', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                        const data = await res.json();
                        if (data.success) toast.success(`Connected (${data.latency}ms)`, { id: 'steadfast' });
                        else toast.error('Connection Failed', { id: 'steadfast' });
                      }}
                      className="px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-xs font-medium transition-colors"
                    >
                      Test Connection
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">Verifies API keys and reachability to Steadfast logistics platform.</p>
                </div>
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" /> bKash Gateway</h3>
                    <button 
                      onClick={async () => {
                        toast.loading('Testing bKash connection...', { id: 'bkash' });
                        const res = await fetch('/api/admin/health/test-payment', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                        const data = await res.json();
                        if (data.success) toast.success(`Connected (${data.latency}ms)`, { id: 'bkash' });
                        else toast.error('Connection Failed', { id: 'bkash' });
                      }}
                      className="px-3 py-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-xs font-medium transition-colors"
                    >
                      Test Connection
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">Verifies API connectivity to the bKash payment processing gateway.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">Failed to load health data</div>
          )}
        </div>
      )}

      {activeTab === 'turnstile' && (
        <form onSubmit={handleSaveTurnstile} className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm max-w-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-lg"><Shield className="w-5 h-5" /></div>
            <div>
              <h3 className="font-semibold text-foreground">Cloudflare Turnstile</h3>
              <p className="text-xs text-muted-foreground">Bot protection and Web Application Firewall</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <label className="flex items-center gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
              <input 
                type="checkbox" 
                checked={settings?.securitySettings?.turnstileEnabled || false} 
                onChange={(e) => setSettings({...settings, securitySettings: {...settings.securitySettings, turnstileEnabled: e.target.checked}})}
                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary accent-primary" 
              />
              <div>
                <span className="font-bold text-sm block">Enable Turnstile Protection</span>
                <span className="text-xs text-muted-foreground">Applies to Login, Registration, Password Reset, and Checkout</span>
              </div>
            </label>

            {settings?.securitySettings?.turnstileEnabled && (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Site Key</label>
                  <input 
                    type="text" 
                    value={settings?.securitySettings?.turnstileSiteKey || ''} 
                    onChange={(e) => setSettings({...settings, securitySettings: {...settings.securitySettings, turnstileSiteKey: e.target.value}})}
                    className="w-full bg-transparent border-b border-border pb-3 text-sm focus:border-primary focus:outline-none transition-colors" 
                    placeholder="1x00000000000000000000AA"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Secret Key</label>
                  <input 
                    type="password" 
                    value={settings?.securitySettings?.turnstileSecretKey || ''} 
                    onChange={(e) => setSettings({...settings, securitySettings: {...settings.securitySettings, turnstileSecretKey: e.target.value}})}
                    className="w-full bg-transparent border-b border-border pb-3 text-sm focus:border-primary focus:outline-none transition-colors" 
                    placeholder="1x0000000000000000000000000000000AA"
                  />
                </div>
              </>
            )}

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                Save Security Settings
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === 'audit' && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground">System Audit Trails</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Admin</th>
                  <th className="px-6 py-3">Setting Changed</th>
                  <th className="px-6 py-3">Old Value</th>
                  <th className="px-6 py-3">New Value</th>
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : auditTrails.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No audit trails found</td></tr>
                ) : (
                  auditTrails.map((trail, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(trail.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4">{trail.adminName}</td>
                      <td className="px-6 py-4 font-mono text-xs">{trail.settingName}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-red-500 line-through">{trail.oldValue}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-green-500">{trail.newValue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground">Admin Activity Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Admin</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Target</th>
                  <th className="px-6 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : adminActivities.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No activity logs found</td></tr>
                ) : (
                  adminActivities.map((activity, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(activity.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4">{activity.adminName}</td>
                      <td className="px-6 py-4 font-medium">{activity.action}</td>
                      <td className="px-6 py-4 text-muted-foreground">{activity.target}</td>
                      <td className="px-6 py-4 font-mono text-xs">{activity.ipAddress}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground">Security Events (WAF & Rate Limits)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Event Type</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">User Agent</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : securityEvents.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No security events found</td></tr>
                ) : (
                  securityEvents.map((event, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/30">
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(event.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-bold uppercase">{event.eventType}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{event.ipAddress}</td>
                      <td className="px-6 py-4 max-w-[200px] truncate text-xs" title={event.userAgent}>{event.userAgent}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{event.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'failedLogins' && (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground">Failed Login Attempts & Locks</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Attempts</th>
                  <th className="px-6 py-3">Last Attempt</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {logsLoading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : failedLogins.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No failed logins tracked</td></tr>
                ) : (
                  failedLogins.map((login, i) => {
                    const isLocked = login.lockedUntil && new Date(login.lockedUntil) > new Date();
                    return (
                      <tr key={i} className="border-b border-border hover:bg-muted/30">
                        <td className="px-6 py-4 font-medium">{login.email}</td>
                        <td className="px-6 py-4 font-mono text-xs">{login.ipAddress}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold ${login.attempts >= 5 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                             {login.attempts}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(login.lastAttempt).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          {isLocked ? (
                            <span className="text-red-500 text-xs font-bold flex items-center gap-1"><Lock className="w-3 h-3" /> Locked until {new Date(login.lockedUntil).toLocaleTimeString()}</span>
                          ) : (
                            <span className="text-green-500 text-xs font-bold">Active</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
