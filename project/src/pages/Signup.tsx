import { useState } from 'react';
import { UserPlus, Shield, ShieldOff, CheckCircle } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import AlertBanner from '../components/AlertBanner';
import { detectSQLInjection, detectXSS, logAttack } from '../lib/attackDetection';
import { supabase } from '../lib/supabase';

interface Alert {
  type: 'danger' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

export default function Signup() {
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      if (form.password !== form.confirm) {
        setAlert({ type: 'warning', title: 'Validation Error', message: 'Passwords do not match.' });
        return;
      }

      const inputs = [form.username, form.email, form.password];

      if (mode === 'secure') {
        // Secure: validate all inputs
        for (const input of inputs) {
          if (detectSQLInjection(input)) {
            await logAttack({
              attackType: 'SQL_INJECTION',
              payload: input,
              details: 'SQLi pattern found in signup form input (secure mode blocked it).',
            });
            setAlert({ type: 'warning', title: 'Attack Blocked — SQL Injection', message: 'Malicious input detected in signup form. Request rejected and logged.' });
            return;
          }
          if (detectXSS(input)) {
            await logAttack({
              attackType: 'XSS_STORED',
              payload: input,
              details: 'XSS payload found in signup form input (secure mode blocked it).',
            });
            setAlert({ type: 'warning', title: 'Attack Blocked — XSS in Signup', message: 'Script/XSS payload detected in form input. Rejected and logged.' });
            return;
          }
        }
      }

      // In vulnerable mode, we still insert but also log if bad input is found
      if (mode === 'vulnerable') {
        for (const input of inputs) {
          if (detectSQLInjection(input)) {
            await logAttack({
              attackType: 'SQL_INJECTION',
              payload: input,
              details: 'SQLi pattern in signup form. In a real vulnerable app this could corrupt the DB.',
              usernameAttempted: form.username,
            });
          }
          if (detectXSS(input)) {
            await logAttack({
              attackType: 'XSS_STORED',
              payload: input,
              details: 'XSS payload in signup username/email would be stored in DB and rendered unsanitized.',
              usernameAttempted: form.username,
            });
          }
        }
      }

      const { error } = await supabase.from('users').insert({
        username: form.username,
        email: form.email,
        password_plain: form.password,
        password_hash: `hashed_${form.password}`,
        role: 'user',
      });

      if (error) {
        if (error.code === '23505') {
          setAlert({ type: 'warning', title: 'Username Taken', message: 'That username or email is already registered.' });
        } else {
          setAlert({ type: 'danger', title: 'Registration Error', message: error.message });
        }
      } else {
        setAlert({ type: 'success', title: 'Account Created!', message: `User "${form.username}" registered successfully.` });
        setForm({ username: '', email: '', password: '', confirm: '' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <SectionHeader
        icon={<UserPlus size={20} className="text-white" />}
        title="Signup Demo"
        subtitle="Registration with and without input validation — shows stored XSS and SQLi risks"
        badge="LIVE DEMO"
      />

      <div className="flex gap-3 mb-6">
        <button onClick={() => setMode('vulnerable')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'vulnerable' ? 'bg-red-900/40 border-red-600/60 text-red-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <ShieldOff size={15} /> Vulnerable Mode
        </button>
        <button onClick={() => setMode('secure')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'secure' ? 'bg-emerald-900/40 border-emerald-600/60 text-emerald-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <Shield size={15} /> Secure Mode
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className={`mb-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${mode === 'vulnerable' ? 'bg-red-900/30 border border-red-800/50 text-red-400' : 'bg-emerald-900/30 border border-emerald-800/50 text-emerald-400'}`}>
            {mode === 'vulnerable' ? <ShieldOff size={13} /> : <Shield size={13} />}
            {mode === 'vulnerable' ? 'VULNERABLE: No input sanitization — XSS payloads stored as-is' : 'SECURE: Input validated and sanitized before storage'}
          </div>

          {alert && (
            <div className="mb-4">
              <AlertBanner {...alert} onClose={() => setAlert(null)} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'username', label: 'Username', type: 'text', placeholder: 'Try: <script>alert(1)</script>' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'user@example.com' },
              { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={update(f.key as keyof typeof form)}
                  placeholder={f.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Secure Registration Checklist</h3>
            </div>
            {[
              { done: mode === 'secure', label: 'Input validation on all fields' },
              { done: mode === 'secure', label: 'XSS payload detection & rejection' },
              { done: mode === 'secure', label: 'SQLi pattern detection' },
              { done: true, label: 'Parameterized DB inserts (always)' },
              { done: mode === 'secure', label: 'Password hashing before storage' },
            ].map(item => (
              <div key={item.label} className={`flex items-center gap-2 text-xs ${item.done ? 'text-emerald-400' : 'text-gray-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.done ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                {item.label}
              </div>
            ))}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h4 className="text-xs font-bold text-red-400 uppercase mb-2">Stored XSS via Signup</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              If a username like <code className="font-mono text-red-400 bg-gray-800 px-1 rounded">&lt;script&gt;alert('hacked')&lt;/script&gt;</code> is stored
              in the database without sanitization, every page that renders this username will execute the script.
              This affects all visitors — not just the attacker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
