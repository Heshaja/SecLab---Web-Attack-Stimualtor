/**
 * CSRF DEMO
 * =========
 * Cross-Site Request Forgery: tricks an authenticated user into unknowingly
 * submitting a form to a target site.
 *
 * In vulnerable mode: form submits without a CSRF token — any page can forge it.
 * In secure mode: form includes a CSRF token that the server validates.
 * A mismatched or absent token triggers detection.
 */

import { useState } from 'react';
import { Crosshair, Shield, ShieldOff, Copy, CheckCheck } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import AlertBanner from '../components/AlertBanner';
import { getSessionCSRFToken, validateCSRFToken, logAttack } from '../lib/attackDetection';

interface Alert { type: 'danger' | 'success' | 'info' | 'warning'; title: string; message: string }

export default function CSRF() {
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [amount, setAmount] = useState('500');
  const [recipient, setRecipient] = useState('attacker@evil.com');
  const [tokenField, setTokenField] = useState('');
  const [alert, setAlert] = useState<Alert | null>(null);
  const [copied, setCopied] = useState(false);

  const realToken = getSessionCSRFToken();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (mode === 'secure') {
      const valid = validateCSRFToken(tokenField);
      if (!valid) {
        await logAttack({
          attackType: 'CSRF',
          payload: `token=${tokenField || 'MISSING'} | amount=${amount} | recipient=${recipient}`,
          details: `CSRF token validation failed. Submitted: "${tokenField}", Expected: "${realToken.slice(0, 8)}..."`,
        });
        setAlert({
          type: 'danger',
          title: 'ATTACK DETECTED — CSRF Token Mismatch',
          message: `Token "${tokenField || '(empty)'}" does not match session token. Request rejected. Logged.`,
        });
        return;
      }
      setAlert({ type: 'success', title: 'Transfer Completed (CSRF Protected)', message: `$${amount} to ${recipient}. Token validated — request was legitimate.` });
    } else {
      // Vulnerable: no token check — any forged request succeeds
      await logAttack({
        attackType: 'CSRF',
        payload: `amount=${amount} | recipient=${recipient}`,
        details: 'Form submitted without CSRF token. A forged cross-origin request would succeed in a real application.',
      });
      setAlert({
        type: 'danger',
        title: 'ATTACK SIMULATED — CSRF Successful',
        message: `$${amount} "transferred" to ${recipient} — no token was required. In a real app, an attacker page could forge this request silently. Logged.`,
      });
    }
  };

  const copyToken = () => {
    setTokenField(realToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <SectionHeader
        icon={<Crosshair size={20} className="text-white" />}
        title="CSRF Attack"
        subtitle="Cross-Site Request Forgery — forged requests bypass authentication by riding existing sessions"
        badge="VULNERABILITY DEMO"
        badgeColor="bg-blue-700"
      />

      <div className="flex gap-3 mb-6">
        <button onClick={() => setMode('vulnerable')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'vulnerable' ? 'bg-red-900/40 border-red-600/60 text-red-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <ShieldOff size={15} /> Vulnerable (no token)
        </button>
        <button onClick={() => setMode('secure')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'secure' ? 'bg-emerald-900/40 border-emerald-600/60 text-emerald-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <Shield size={15} /> Secure (CSRF token)
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Target form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400 font-mono">bank.internal — /transfer</span>
            </div>
            <h3 className="text-base font-semibold text-white mb-4">Bank Transfer (Target Site)</h3>

            {alert && <div className="mb-4"><AlertBanner {...alert} onClose={() => setAlert(null)} /></div>}

            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Amount ($)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Recipient</label>
                  <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 font-mono" />
                </div>
              </div>

              {mode === 'secure' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium text-gray-300">CSRF Token</label>
                    <button type="button" onClick={copyToken} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                      {copied ? <><CheckCheck size={11} /> Copied!</> : <><Copy size={11} /> Use session token</>}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={tokenField}
                    onChange={e => setTokenField(e.target.value)}
                    placeholder="Leave empty to simulate forged request, or click 'Use session token'"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">Session token starts with: <code className="font-mono text-blue-400">{realToken.slice(0, 12)}...</code></p>
                </div>
              )}

              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Transfer Funds
              </button>
            </form>
          </div>

          {/* Forged request simulation */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs text-gray-400 font-mono">evil-site.com — CSRF attack page</span>
            </div>
            <h3 className="text-sm font-semibold text-white mb-3">Simulated Forged Request</h3>
            <p className="text-xs text-gray-400 mb-3">
              An attacker's page would contain a hidden form that auto-submits to the bank when the victim visits:
            </p>
            <pre className="bg-gray-950 rounded-lg p-3 text-xs font-mono text-red-400 overflow-x-auto">{`<!-- attacker's page (evil-site.com) -->
<html><body onload="document.f.submit()">
  <form name="f" action="https://bank.internal/transfer" method="POST">
    <input type="hidden" name="amount" value="500">
    <input type="hidden" name="recipient" value="attacker@evil.com">
    <!-- No CSRF token! Vulnerable site accepts this. -->
  </form>
</body></html>`}</pre>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 text-xs text-gray-400 leading-relaxed">
            <div>
              <p className="font-bold text-blue-400 uppercase mb-1">Attack</p>
              <p>CSRF exploits the browser's automatic inclusion of cookies/session tokens with requests. An attacker can forge a request from any origin and the server can't tell it apart from a legitimate one — unless a secret token is checked.</p>
            </div>
            <div>
              <p className="font-bold text-emerald-400 uppercase mb-1">Detection</p>
              <p>Validate the CSRF token on every state-changing request. A missing or mismatched token indicates a forged request from another origin.</p>
            </div>
            <div>
              <p className="font-bold text-amber-400 uppercase mb-1">Prevention</p>
              <p>Use synchronizer token pattern or double-submit cookies. Check the <code className="font-mono text-gray-300">Origin</code>/<code className="font-mono text-gray-300">Referer</code> headers. Use <code className="font-mono text-gray-300">SameSite=Strict</code> cookie attribute to prevent cross-site sends.</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Token Scenarios</h3>
            <div className="space-y-2">
              {[
                { label: 'Correct token', result: 'Request passes', color: 'text-emerald-400' },
                { label: 'Empty token', result: 'CSRF detected', color: 'text-red-400' },
                { label: 'Wrong token', result: 'CSRF detected', color: 'text-red-400' },
                { label: 'No token field', result: 'Vulnerable mode only', color: 'text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-xs">
                  <span className="text-gray-400">{s.label}</span>
                  <span className={s.color + ' font-medium'}>{s.result}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
