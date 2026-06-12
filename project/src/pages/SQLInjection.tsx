/**
 * SQL INJECTION DEMO
 * ==================
 * Shows vulnerable query simulation and detection.
 * In vulnerable mode the query string is shown as it would be constructed.
 * Detection catches the pattern before it reaches the DB.
 */

import { useState } from 'react';
import { Database, Shield, ShieldOff, Search, AlertTriangle } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import AlertBanner from '../components/AlertBanner';
import PayloadChip from '../components/PayloadChip';
import { detectSQLInjection, logAttack } from '../lib/attackDetection';
import { supabase } from '../lib/supabase';

const PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1 --",
  "admin'--",
  "' UNION SELECT id, username, password_plain FROM users--",
  "'; DROP TABLE posts; --",
  "' AND SLEEP(5)--",
  "' OR 1=1 UNION SELECT 1,2,3--",
];

interface ResultRow { username: string; title: string; content: string }
interface Alert { type: 'danger' | 'success' | 'info' | 'warning'; title: string; message: string }

export default function SQLInjection() {
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultRow[]>([]);
  const [simulatedSQL, setSimulatedSQL] = useState('');
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);
    setResults([]);

    const injected = detectSQLInjection(query);

    // Show what the raw SQL would look like in vulnerable mode
    setSimulatedSQL(
      `SELECT p.title, p.content, u.username\n` +
      `FROM posts p JOIN users u ON p.user_id = u.id\n` +
      `WHERE p.title = '${query}'`
    );

    try {
      if (mode === 'vulnerable') {
        if (injected) {
          await logAttack({
            attackType: 'SQL_INJECTION',
            payload: query,
            details: `Search input contained SQLi pattern. Simulated query: SELECT ... WHERE title='${query}'`,
          });

          // Simulate what a successful injection might return (show all posts)
          const { data } = await supabase
            .from('posts')
            .select('username, title, content')
            .limit(10);

          setResults((data ?? []) as ResultRow[]);
          setAlert({
            type: 'danger',
            title: 'ATTACK DETECTED — SQL Injection',
            message: `Payload "${query}" matched SQLi pattern. In a real DB, this query would return ALL rows or modify data. Attack logged.`,
          });
        } else {
          const { data } = await supabase
            .from('posts')
            .select('username, title, content')
            .ilike('title', `%${query}%`);
          setResults((data ?? []) as ResultRow[]);
          if (!data?.length) setAlert({ type: 'info', title: 'No Results', message: 'No posts matched your search.' });
        }
      } else {
        // Secure mode: detect and block
        if (injected) {
          await logAttack({
            attackType: 'SQL_INJECTION',
            payload: query,
            details: 'SQLi attempt blocked by input validation in secure search.',
          });
          setAlert({
            type: 'warning',
            title: 'Attack Blocked — SQL Injection',
            message: 'Input was validated and the malicious query was rejected. Parameterized queries prevent injection.',
          });
        } else {
          const { data } = await supabase
            .from('posts')
            .select('username, title, content')
            .ilike('title', `%${query}%`);
          setResults((data ?? []) as ResultRow[]);
          if (!data?.length) setAlert({ type: 'info', title: 'No Results', message: 'No posts found.' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <SectionHeader
        icon={<Database size={20} className="text-white" />}
        title="SQL Injection"
        subtitle="Inject malicious SQL through search inputs to bypass queries or leak data"
        badge="VULNERABILITY DEMO"
        badgeColor="bg-red-700"
      />

      <div className="flex gap-3 mb-6">
        <button onClick={() => setMode('vulnerable')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'vulnerable' ? 'bg-red-900/40 border-red-600/60 text-red-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <ShieldOff size={15} /> Vulnerable Mode
        </button>
        <button onClick={() => setMode('secure')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'secure' ? 'bg-emerald-900/40 border-emerald-600/60 text-emerald-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <Shield size={15} /> Secure Mode
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: search form */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Post Search</h3>
            {alert && <div className="mb-4"><AlertBanner {...alert} onClose={() => setAlert(null)} /></div>}

            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search posts..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 font-mono"
              />
              <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                <Search size={15} /> Search
              </button>
            </form>

            {/* Simulated SQL query */}
            {simulatedSQL && (
              <div className="bg-gray-950 border border-gray-700 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1 font-semibold">Simulated raw SQL (vulnerable mode):</p>
                <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap">{simulatedSQL}</pre>
              </div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {detectSQLInjection(query) && mode === 'vulnerable' && (
                    <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                      <AlertTriangle size={12} /> Injection returned {results.length} rows (all data exposed)
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {results.map((r, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-gray-400">by {r.username}</span>
                      </div>
                      <p className="text-sm font-medium text-white">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{r.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: payloads + explanation */}
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Test Payloads</h3>
            <div className="flex flex-col gap-1.5">
              {PAYLOADS.map(p => (
                <PayloadChip key={p} payload={p} onClick={v => setQuery(v)} />
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 text-xs text-gray-400 leading-relaxed">
            <div>
              <p className="font-bold text-red-400 uppercase mb-1">Attack</p>
              <p>SQL injection manipulates query logic by injecting SQL syntax. A tautology like <code className="text-red-400 font-mono bg-gray-800 px-1 rounded">OR 1=1</code> always evaluates true, returning all rows.</p>
            </div>
            <div>
              <p className="font-bold text-emerald-400 uppercase mb-1">Detection</p>
              <p>Regex patterns match SQLi markers: boolean tautologies, UNION SELECT, comment terminators (<code className="font-mono bg-gray-800 px-1 rounded text-gray-300">--</code>, <code className="font-mono bg-gray-800 px-1 rounded text-gray-300">#</code>), stacked queries.</p>
            </div>
            <div>
              <p className="font-bold text-blue-400 uppercase mb-1">Prevention</p>
              <p>Always use parameterized queries or prepared statements. Never concatenate user input into SQL. Use an ORM. Apply the principle of least privilege to DB users.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
