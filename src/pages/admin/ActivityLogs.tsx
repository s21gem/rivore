import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Eye, Globe, Laptop, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [adminName, setAdminName] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(adminName && { adminName }),
        ...(actionFilter && { action: actionFilter }),
      });

      const res = await fetch(`/api/admin/activity-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (err) {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleExport = () => {
    // Basic CSV export
    const headers = ['Timestamp', 'Admin', 'Action', 'Target', 'IP Address', 'Country', 'Device', 'OS', 'Browser'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        new Date(log.createdAt).toISOString(),
        `"${log.adminName}"`,
        `"${log.action}"`,
        `"${log.target}"`,
        `"${log.ipAddress}"`,
        `"${log.country}"`,
        `"${log.deviceType}"`,
        `"${log.os}"`,
        `"${log.browser}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_logs_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    if (type.toLowerCase().includes('mobile')) return <Smartphone className="w-4 h-4" />;
    return <Laptop className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-light text-foreground">Activity Logs</h2>
          <p className="text-sm text-muted-foreground mt-1">Enterprise audit trail for all administrative actions.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <form onSubmit={handleFilter} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Search Details</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search targets or details..." className="w-full pl-9 pr-4 py-2 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>
        <div className="w-48">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Admin Name</label>
          <input value={adminName} onChange={e => setAdminName(e.target.value)} type="text" placeholder="Filter by admin..." className="w-full px-4 py-2 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
        </div>
        <div className="w-48">
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Action Type</label>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="w-full px-4 py-2 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:border-primary">
            <option value="">All Actions</option>
            <option value="Login">Login</option>
            <option value="Product Created">Product Created</option>
            <option value="Settings Updated">Settings Updated</option>
          </select>
        </div>
        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
          Filter
        </button>
      </form>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Action & Target</th>
                <th className="px-6 py-4">Location & IP</th>
                <th className="px-6 py-4">System Context</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No logs found matching your criteria.</td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {log.adminName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{log.action}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{log.target}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        {log.ipAddress}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{log.city}, {log.country}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <DeviceIcon type={log.deviceType} />
                        {log.os} • {log.browser}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Showing {logs.length} of {total} records
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled={logs.length < 20} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
