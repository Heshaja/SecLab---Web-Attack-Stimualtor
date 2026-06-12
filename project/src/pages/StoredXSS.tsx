/**
 * STORED XSS DEMO
 * ===============
 * User-submitted content is stored in the database.
 * In vulnerable mode, content is rendered via innerHTML (executes scripts).
 * In secure mode, content is rendered via textContent / React's safe rendering.
 */

import { useState, useEffect, useRef } from 'react';
import { Code2, Shield, ShieldOff, Trash2, Send } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import AlertBanner from '../components/AlertBanner';
import PayloadChip from '../components/PayloadChip';
import { detectXSS, logAttack } from '../lib/attackDetection';
import { supabase } from '../lib/supabase';
import type { Post } from '../lib/types';

const XSS_PAYLOADS = [
  '<script>alert("XSS!")</script>',
  '<img src=x onerror="alert(\'hacked\')">',
  '<svg onload="alert(document.cookie)">',
  '<a href="javascript:alert(1)">click me</a>',
  '<iframe src="javascript:alert(\'XSS\')"></iframe>',
  '<body onload=alert(1)>',
  '"><script>document.write("<img src=x onerror=alert(1)>")</script>',
];

interface Alert { type: 'danger' | 'success' | 'info' | 'warning'; title: string; message: string }

// Unsafe renderer component that uses innerHTML — educational demonstration only
function UnsafeHTML({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, [html]);
  return <div ref={ref} />;
}

export default function StoredXSS() {
  const [mode, setMode] = useState<'vulnerable' | 'secure'>('vulnerable');
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState({ username: 'demo_user', title: '', content: '' });
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setPosts(data ?? []);
  };

  useEffect(() => { loadPosts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    const xssInContent = detectXSS(form.content);
    const xssInTitle = detectXSS(form.title);

    if (mode === 'secure' && (xssInContent || xssInTitle)) {
      await logAttack({
        attackType: 'XSS_STORED',
        payload: xssInTitle ? form.title : form.content,
        details: 'XSS payload blocked by input validation before storage.',
        usernameAttempted: form.username,
      });
      setAlert({ type: 'warning', title: 'Attack Blocked — Stored XSS', message: 'XSS payload detected in submission. Rejected and logged.' });
      setLoading(false);
      return;
    }

    if (mode === 'vulnerable' && (xssInContent || xssInTitle)) {
      await logAttack({
        attackType: 'XSS_STORED',
        payload: xssInTitle ? form.title : form.content,
        details: `XSS payload stored in DB and will execute when rendered via innerHTML. Content: ${form.content}`,
        usernameAttempted: form.username,
      });
      setAlert({ type: 'danger', title: 'ATTACK DETECTED — Stored XSS', message: `XSS payload stored in database! It will execute for every visitor who views this post. Attack logged.` });
    }

    const { error } = await supabase.from('posts').insert({
      username: form.username,
      title: form.title,
      content: form.content,
    });

    if (!error) {
      setForm(prev => ({ ...prev, title: '', content: '' }));
      await loadPosts();
      if (!xssInContent && !xssInTitle) {
        setAlert({ type: 'success', title: 'Post Created', message: 'Post saved successfully.' });
      }
    }
    setLoading(false);
  };

  const deletePost = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    await loadPosts();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <SectionHeader
        icon={<Code2 size={20} className="text-white" />}
        title="Stored XSS"
        subtitle="Persistent scripts injected into the database execute for every visitor"
        badge="VULNERABILITY DEMO"
        badgeColor="bg-orange-700"
      />

      <div className="flex gap-3 mb-6">
        <button onClick={() => setMode('vulnerable')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'vulnerable' ? 'bg-red-900/40 border-red-600/60 text-red-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <ShieldOff size={15} /> Vulnerable (innerHTML)
        </button>
        <button onClick={() => setMode('secure')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${mode === 'secure' ? 'bg-emerald-900/40 border-emerald-600/60 text-emerald-300' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'}`}>
          <Shield size={15} /> Secure (textContent)
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Submit form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Submit a Post</h3>
            {alert && <div className="mb-4"><AlertBanner {...alert} onClose={() => setAlert(null)} /></div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                  <input type="text" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Post title" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Content</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Paste an XSS payload here..."
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 font-mono resize-none"
                />
              </div>
              <button type="submit" disabled={loading} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                <Send size={14} /> {loading ? 'Submitting...' : 'Submit Post'}
              </button>
            </form>
          </div>

          {/* Post feed */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Posts ({mode === 'vulnerable' ? 'rendered via innerHTML — UNSAFE' : 'rendered via React — SAFE'})</h3>
              <button onClick={loadPosts} className="text-xs text-gray-400 hover:text-white transition-colors">Refresh</button>
            </div>
            {posts.length === 0 ? (
              <p className="text-sm text-gray-500">No posts yet.</p>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-gray-400">by {post.username}</span>
                      <button onClick={() => deletePost(post.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-white mb-1">{post.title}</p>
                    {mode === 'vulnerable' ? (
                      // UNSAFE: innerHTML will execute any embedded scripts
                      <UnsafeHTML html={post.content} />
                    ) : (
                      // SAFE: React renders as text, no script execution
                      <p className="text-xs text-gray-400 break-all">{post.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payloads + explanation */}
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">XSS Payloads</h3>
            <div className="flex flex-col gap-1.5">
              {XSS_PAYLOADS.map(p => (
                <PayloadChip key={p} payload={p} onClick={v => setForm(prev => ({ ...prev, content: v }))} />
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 text-xs text-gray-400 leading-relaxed">
            <div>
              <p className="font-bold text-orange-400 uppercase mb-1">Attack</p>
              <p>Stored XSS persists malicious scripts in the server/database. Every user who views the infected page has the script run in their browser context — enabling cookie theft, keylogging, or account takeover.</p>
            </div>
            <div>
              <p className="font-bold text-emerald-400 uppercase mb-1">Detection</p>
              <p>Input is scanned for script tags, event handlers (<code className="font-mono text-gray-300">onerror</code>, <code className="font-mono text-gray-300">onload</code>), <code className="font-mono text-gray-300">javascript:</code> URIs, and <code className="font-mono text-gray-300">eval()</code> calls.</p>
            </div>
            <div>
              <p className="font-bold text-blue-400 uppercase mb-1">Prevention</p>
              <p>Escape all user-generated content before rendering. Use React's default safe rendering. Apply a strict Content Security Policy (CSP). Sanitize HTML with a library like DOMPurify when rich text is needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
