/**
 * BRUTE FORCE DEMO
 * ================
 * Simulates automated rapid login attempts against a target account.
 * Detection: 5+ failed attempts in 2 minutes triggers a lockout alert.
 * Prevention: rate limiting, account lockout, CAPTCHA.
 */

import { useState, useRef } from 'react';
import { KeyRound, Play, Square, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import AlertBanner from '../components/AlertBanner';
import { logLoginAttempt, logAttack } from '../lib/attackDetection';
import { supabase } from '../lib/supabase';

const WORDLIST = [
  'password', '123456', 'qwerty', 'letmein', 'monkey', 'dragon',
  '111111', 'abc123', 'iloveyou', 'master', 'sunshine', 'shadow',
  'admin', 'admin123', 'password1', 'qwerty123', 'test', 'root',
  'pass', '12345678', 'welcome', 'login', 'hello', 'admin1',
];

interface Attempt { password: string; success: boolean; ts: string }
interface Alert { type: 'danger' | 'success' | 'info' | 'warning'; title: string; message: string }

export default function BruteForce() {
  const [targetUser, setTargetUser] = useState('admin');
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [speed, setSpeed] = useState(300);
  const stopRef = useRef(false);

  const start = async () => {
    stopRef.current = false;
    setRunning(true);
    setAttempts([]);
    setAlert(null);

    for (let i = 0; i < WORDLIST.length; i++) {
      if (stopRef.current) break;

      const pw = WORDLIST[i];

      // Check actual DB for a match (simulating a real login check)
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('username', targetUser)
        .eq('password_plain', pw)
        .maybeSingle();

      const success = !!data;
      await logLoginAttempt(targetUser, success);

      const ts = new Date().toLocaleTimeString();
      setAttempts(prev => [{ password: pw, success, ts }, ...prev.slice(0, 49)]);

      if (success) {
        await logAttack({
          attackType: 'BRUTE_FORCE',
          payload: `username=${targetUser} password=${pw}`,
          details: `Brute force succeeded for user "${targetUser}" with password "${pw}" after ${i + 1} attempts.`,
          usernameAttempted: targetUser,
        });
        setAlert({
          type: 'danger',
          title: 'Brute Force SUCCESS — Password Found!',
          message: `Password for "${targetUser}" is "${pw}" (attempt #${i + 1}). Attack logged to database.`,
        });
        stopRef.current = true;
        break;
      }

      // Brute force detection fires after 5 failures
      if ((i + 1) === 5) {
        await logAttack({
          attackType: 'BRUTE_FORCE',
          payload: `username=${targetUser}`,
          details: `Brute force threshold reached: 5 failed attempts for "${targetUser}". Account should be locked.`,
          usernameAttempted: targetUser,
        });
        setAlert({
          type: 'warning',
          title: 'ATTACK DETECTED — Brute Force',
          message: `5+ failed login attempts for "${targetUser}". In a protected system, this account would now be locked.`,
        });
      }

      await new Promise(r => setTimeout(r, speed));
    }

    if (!stopRef.current) {
      setAlert(prev => prev ?? { type: 'info', title: 'Wordlist Exhausted', message: 'All wordlist entries tried — no match found.' });
    }

    setRunning(false);
  };

  const stop = () => { stopRef.current = true; };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <SectionHeader
        icon={<KeyRound size={20} className="text-white" />}
        title="Brute Force Attack"
        subtitle="Automated credential guessing using a wordlist — detection triggers on repeated failures"
        badge="VULNERABILITY DEMO"
        badgeColor="bg-emerald-700"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Controls */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Attack Configuration</h3>
            {alert && <div className="mb-4"><AlertBanner {...alert} onClose={() => setAlert(null)} /></div>}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Target Username</label>
                <select
                  value={targetUser}
                  onChange={e => setTargetUser(e.target.value)}
                  disabled={running}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="admin">admin (password: admin123)</option>
                  <option value="alice">alice (password: password1)</option>
                  <option value="bob">bob (password: qwerty)</option>
                  <option value="ghost">ghost (doesn't exist)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Speed: {speed}ms delay
                </label>
                <input
                  type="range"
                  min={50} max={1000} step={50}
                  value={speed}
                  onChange={e => setSpeed(+e.target.value)}
                  disabled={running}
                  className="w-full accent-emerald-500 mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fast (50ms)</span>
                  <span>Slow (1000ms)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={start}
                disabled={running}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <Play size={14} /> Start Attack
              </button>
              <button
                onClick={stop}
                disabled={!running}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                <Square size={14} /> Stop
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Wordlist: {WORDLIST.length} common passwords. Detection at attempt #5.
            </p>
          </div>

          {/* Attempt log */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              Attempt Log
              {running && <span className="flex items-center gap-1 text-xs text-emerald-400"><Clock size={11} className="animate-spin" /> Running...</span>}
            </h3>
            {attempts.length === 0 ? (
              <p className="text-xs text-gray-500">Start the attack to see attempts here.</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {attempts.map((a, i) => (
                  <div key={i} className={`flex items-center gap-3 text-xs rounded-lg px-3 py-1.5 font-mono
                    ${a.success ? 'bg-red-900/30 border border-red-700/40' : 'bg-gray-800'}`}
                  >
                    {a.success
                      ? <CheckCircle size={12} className="text-red-400 flex-shrink-0" />
                      : <AlertTriangle size={12} className="text-gray-500 flex-shrink-0" />}
                    <span className="text-gray-500 w-16 flex-shrink-0">{a.ts}</span>
                    <span className="text-gray-300">username=</span>
                    <span className="text-yellow-400">{targetUser}</span>
                    <span className="text-gray-300 mx-1">password=</span>
                    <span className={a.success ? 'text-red-400 font-bold' : 'text-blue-400'}>{a.password}</span>
                    <span className={`ml-auto flex-shrink-0 font-bold ${a.success ? 'text-red-400' : 'text-gray-500'}`}>
                      {a.success ? 'SUCCESS' : 'FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 text-xs text-gray-400 leading-relaxed">
            <div>
              <p className="font-bold text-emerald-400 uppercase mb-1">Attack</p>
              <p>Brute force systematically tries every password in a wordlist. Dictionary attacks use common passwords. Given no rate limiting, an attacker can try thousands of combinations per second.</p>
            </div>
            <div>
              <p className="font-bold text-yellow-400 uppercase mb-1">Detection Logic</p>
              <p>Count failed login attempts per username within a rolling 2-minute window. Threshold of 5 failures triggers a brute force alert and account lock.</p>
            </div>
            <div>
              <p className="font-bold text-blue-400 uppercase mb-1">Prevention</p>
              <ul className="space-y-1">
                <li>• Rate limiting (max N attempts/minute)</li>
                <li>• Account lockout after N failures</li>
                <li>• CAPTCHA after 3 failures</li>
                <li>• Multi-factor authentication (MFA)</li>
                <li>• Exponential backoff delays</li>
                <li>• IP-based blocking</li>
                <li>• Strong password policies</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Wordlist Sample</h3>
            <div className="flex flex-wrap gap-1.5">
              {WORDLIST.slice(0, 12).map(w => (
                <span key={w} className="font-mono text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded">{w}</span>
              ))}
              <span className="text-xs text-gray-500 self-center">+{WORDLIST.length - 12} more</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
