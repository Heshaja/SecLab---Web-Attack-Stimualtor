/**
 * LOGIN DEMO PAGE
 * ==============
 * Demonstrates:
 * - SQL Injection via login form (vulnerable mode)
 * - Brute force detection
 * - Secure login with parameterized queries (safe mode)
 */

import { useState } from 'react';
import { LogIn, Shield, ShieldOff, Eye, EyeOff } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import AlertBanner from '../components/AlertBanner';
import PayloadChip from '../components/PayloadChip';
import { detectSQLInjection, logAttack, logLoginAttempt, checkBruteForce } from '../lib/attackDetection';
import { supabase } from '../lib/supabase';

const SQL_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1 --",
  "admin'--",
  "' UNION SELECT username, password_plain FROM users--",
  "'; DROP TABLE users; --",
];

interface Alert {
  type: 'danger' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

export default function Login() {
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      // BRUTE FORCE CHECK — always active regardless of mode
      const isBruteForce = await checkBruteForce(username);
      if (isBruteForce) {
        await logAttack({
          attackType: 'BRUTE_FORCE',
          payload: `username=${username}`,
          details: `More than 5 failed login attempts within 2 minutes for user "${username}"`,
          usernameAttempted: username,
        });
        setAlert({
          type: 'danger',
          title: 'ATTACK DETECTED — Brute Force',
          message: `Too many failed attempts for "${username}". Account temporarily locked. Attack logged to database.`,
        });
        setLoading(false);
        return;
      }

      if (mode === 'vulnerable') {
        // --- VULNERABLE MODE ---
        // Simulates what happens when user input is interpolated directly into SQL.
        // In a real app this would be: SELECT * FROM users WHERE username='INPUT' AND password='INPUT'
        // Here we check for SQLi patterns and simulate the bypass.

        const sqliDetected = detectSQLInjection(username) || detectSQLInjection(password);

        if (sqliDetected) {
          await logAttack({
            attackType: 'SQL_INJECTION',
            payload: `username: ${username} | password: ${password}`,
            details: 'SQLi pattern matched in login form. Vulnerable query would have been bypassed.',
            usernameAttempted: username,
          });
          // Simulate the vulnerable behavior: login "succeeds" due to injection
          setAlert({
            type: 'danger',
            title: 'ATTACK DETECTED — SQL Injection in Login',
            message: `Malicious payload: "${username}" — The vulnerable query was bypassed! Logged to database. In a real app, the attacker would now be authenticated.`,
          });
          setLoading(false);
          return;
        }

        // Normal vulnerable login: plaintext password comparison
        const { data: users } = await supabase
          .from('users')
          .select('id, username, role')
          .eq('username', username)
          .eq('password_plain', password)
          .maybeSingle();

        await logLoginAttempt(username, !!users);

        if (users) {
          setAlert({ type: 'success', title: 'Login Successful', message: `Welcome, ${users.username}! (Role: ${users.role})` });
        } else {
          setAlert({ type: 'warning', title: 'Login Failed', message: 'Invalid username or password.' });
        }
      } else {
        // --- SECURE MODE ---
        // Uses parameterized queries (Supabase .eq() is safe by default),
        // password hashing comparison simulation, and SQLi detection as defense-in-depth.

        if (detectSQLInjection(username) || detectSQLInjection(password)) {
          await logAttack({
            attackType: 'SQL_INJECTION',
            payload: `username: ${username}`,
            details: 'SQLi attempt blocked by input validation in secure login.',
            usernameAttempted: username,
          });
          setAlert({
            type: 'warning',
            title: 'Attack Blocked — SQL Injection Attempt',
            message: 'Malicious input detected and rejected. Request logged. Parameterized queries prevent SQL injection.',
          });
          setLoading(false);
          return;
        }

        // Secure: compare hashed password (simulated here)
        const simulatedHash = `hashed_${password}`;
        const { data: users } = await supabase
          .from('users')
          .select('id, username, role')
          .eq('username', username)
          .eq('password_hash', simulatedHash)
          .maybeSingle();

        await logLoginAttempt(username, !!users);

        if (users) {
          setAlert({ type: 'success', title: 'Secure Login Successful', message: `Welcome, ${users.username}! (Authenticated via hashed password)` });
        } else {
          setAlert({ type: 'info', title: 'Login Failed', message: 'Invalid credentials. Note: error message is intentionally vague to prevent user enumeration.' });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <SectionHeader
        icon={<LogIn size={20} className="text-white" />}
        title="Login Demo"
        subtitle="Demonstrates SQL Injection bypass and Brute Force detection on login forms"
        badge="LIVE DEMO"
      />

      {/* Mode selector */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode('vulnerable')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
            ${mode === 'vulnerable' ? 'bg-red-900/40 border-red-600/60 text-red-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}
        >
          <ShieldOff size={15} /> Vulnerable Mode
        </button>
        <button
          onClick={() => setMode('secure')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
            ${mode === 'secure' ? 'bg-emerald-900/40 border-emerald-600/60 text-emerald-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}
        >
          <Shield size={15} /> Secure Mode
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Login Form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className={`mb-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2
            ${mode === 'vulnerable'
              ? 'bg-red-900/30 border border-red-800/50 text-red-400'
              : 'bg-emerald-900/30 border border-emerald-800/50 text-emerald-400'}`}
          >
            {mode === 'vulnerable' ? <ShieldOff size={13} /> : <Shield size={13} />}
            {mode === 'vulnerable'
              ? 'VULNERABLE: Input injected directly into query string'
              : 'SECURE: Parameterized queries + input validation + hashed passwords'}
          </div>

          {alert && (
            <div className="mb-4">
              <AlertBanner {...alert} onClose={() => setAlert(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Try: admin or a payload below"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Try: admin123"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 pr-10 font-mono"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              {loading ? 'Checking...' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-4">
            Demo users: <span className="font-mono text-gray-400">admin / admin123</span>, <span className="font-mono text-gray-400">alice / password1</span>
          </p>
        </div>

        {/* Payloads & explanation */}
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">SQLi Test Payloads</h3>
            <p className="text-xs text-gray-400 mb-3">Click a payload to inject it into the username field:</p>
            <div className="flex flex-wrap gap-2">
              {SQL_PAYLOADS.map(p => (
                <PayloadChip key={p} payload={p} onClick={v => setUsername(v)} />
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase mb-1">How SQL Injection Works</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                A vulnerable query like <code className="text-red-400 font-mono bg-gray-800 px-1 rounded">SELECT * FROM users WHERE username='INPUT'</code> can be
                terminated and appended. Entering <code className="text-red-400 font-mono bg-gray-800 px-1 rounded">admin'--</code> produces
                <code className="text-red-400 font-mono bg-gray-800 px-1 rounded"> WHERE username='admin'--'</code> — the password check is commented out.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase mb-1">Detection Logic</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Input is scanned against 9 regex patterns covering tautologies, UNION SELECT, comment sequences, stacked queries, and time-based blind injection keywords.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Brute Force Detection</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Every login attempt is logged. 5+ failed attempts for the same username within a 2-minute window triggers a brute force alert and blocks further attempts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
