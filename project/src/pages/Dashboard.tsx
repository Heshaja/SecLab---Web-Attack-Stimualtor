import { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, RefreshCw, AlertTriangle, Shield, Trash2, Filter } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { supabase } from '../lib/supabase';
import type { AttackLog, AttackType } from '../lib/types';

const TYPE_COLORS: Record<AttackType, { bg: string; text: string; border: string }> = {
  SQL_INJECTION:  { bg: 'bg-red-900/30',     text: 'text-red-400',     border: 'border-red-700/40' },
  XSS_STORED:     { bg: 'bg-orange-900/30',   text: 'text-orange-400',  border: 'border-orange-700/40' },
  XSS_REFLECTED:  { bg: 'bg-yellow-900/30',   text: 'text-yellow-400',  border: 'border-yellow-700/40' },
  CSRF:           { bg: 'bg-blue-900/30',     text: 'text-blue-400',    border: 'border-blue-700/40' },
  BRUTE_FORCE:    { bg: 'bg-emerald-900/30',  text: 'text-emerald-400', border: 'border-emerald-700/40' },
};

const TYPE_LABELS: Record<AttackType, string> = {
  SQL_INJECTION: 'SQL Injection',
  XSS_STORED:    'Stored XSS',
  XSS_REFLECTED: 'Reflected XSS',
  CSRF:          'CSRF',
  BRUTE_FORCE:   'Brute Force',
};

export default function Dashboard() {
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const [filter, setFilter] = useState<AttackType | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<AttackType, number>>({
    SQL_INJECTION: 0, XSS_STORED: 0, XSS_REFLECTED: 0, CSRF: 0, BRUTE_FORCE: 0,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('attack_logs')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(100);

    const rows = (data ?? []) as AttackLog[];
    setLogs(rows);

    const s: Record<AttackType, number> = { SQL_INJECTION: 0, XSS_STORED: 0, XSS_REFLECTED: 0, CSRF: 0, BRUTE_FORCE: 0 };
    rows.forEach(r => { if (r.attack_type in s) s[r.attack_type as AttackType]++; });
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('attack_logs_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attack_logs' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const filtered = filter === 'ALL' ? logs : logs.filter(l => l.attack_type === filter);

  const clearLogs = async () => {
    if (!confirm('Clear all attack logs? This cannot be undone.')) return;
    await supabase.from('attack_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    load();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <SectionHeader
        icon={<LayoutDashboard size={20} className="text-white" />}
        title="Attack Dashboard"
        subtitle="Real-time feed of all detected attacks — updates automatically via live subscription"
        badgeColor="bg-blue-700"
      />

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {(Object.keys(TYPE_LABELS) as AttackType[]).map(type => {
          const c = TYPE_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => setFilter(prev => prev === type ? 'ALL' : type)}
              className={`${c.bg} border ${c.border} rounded-xl p-4 text-left transition-all hover:opacity-90 ${filter === type ? 'ring-1 ring-white/20' : ''}`}
            >
              <div className={`text-2xl font-bold ${c.text}`}>{stats[type]}</div>
              <div className="text-xs text-gray-400 mt-0.5">{TYPE_LABELS[type]}</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <span className="text-xs text-gray-500">Filter:</span>
        </div>
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filter === 'ALL' ? 'bg-gray-700 border-gray-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}
        >
          All ({logs.length})
        </button>
        {(Object.keys(TYPE_LABELS) as AttackType[]).map(type => {
          const c = TYPE_COLORS[type];
          return (
            <button
              key={type}
              onClick={() => setFilter(prev => prev === type ? 'ALL' : type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filter === type ? `${c.bg} ${c.border} ${c.text}` : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}
            >
              {TYPE_LABELS[type]}
            </button>
          );
        })}
        <div className="ml-auto flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={clearLogs} className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
            <Trash2 size={12} /> Clear
          </button>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading attack logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Shield size={32} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No attacks logged yet. Try one of the vulnerability demos.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payload</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map(log => {
                  const c = TYPE_COLORS[log.attack_type as AttackType] ?? TYPE_COLORS.BRUTE_FORCE;
                  return (
                    <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">
                        {new Date(log.detected_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${c.bg} ${c.text} border ${c.border}`}>
                          <AlertTriangle size={10} />
                          {TYPE_LABELS[log.attack_type as AttackType] ?? log.attack_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ip_address}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.username_attempted ?? '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-red-400 max-w-xs">
                        <div className="truncate" title={log.payload}>{log.payload}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-xs">
                        <div className="truncate" title={log.details}>{log.details}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600 mt-3 text-right">
        Showing {filtered.length} of {logs.length} events. Updates in real-time via Supabase Realtime.
      </p>
    </div>
  );
}
