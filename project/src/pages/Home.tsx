import {
  Shield, Database, Code2, RefreshCw, Crosshair, KeyRound,
  LayoutDashboard, FileText, AlertTriangle, ChevronRight
} from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const attacks = [
  {
    id: 'sqli',
    icon: <Database size={20} className="text-red-400" />,
    title: 'SQL Injection',
    desc: 'Manipulate database queries by injecting malicious SQL through input fields.',
    color: 'border-red-800/50 hover:border-red-600/70',
    tag: 'SQLi',
  },
  {
    id: 'xss-stored',
    icon: <Code2 size={20} className="text-orange-400" />,
    title: 'Stored XSS',
    desc: 'Persist malicious scripts in the database that execute for all visitors.',
    color: 'border-orange-800/50 hover:border-orange-600/70',
    tag: 'XSS',
  },
  {
    id: 'xss-reflected',
    icon: <RefreshCw size={20} className="text-yellow-400" />,
    title: 'Reflected XSS',
    desc: 'Reflect user input back in the response without sanitization.',
    color: 'border-yellow-800/50 hover:border-yellow-600/70',
    tag: 'XSS',
  },
  {
    id: 'csrf',
    icon: <Crosshair size={20} className="text-blue-400" />,
    title: 'CSRF',
    desc: 'Trick authenticated users into submitting unauthorized requests.',
    color: 'border-blue-800/50 hover:border-blue-600/70',
    tag: 'CSRF',
  },
  {
    id: 'brute',
    icon: <KeyRound size={20} className="text-emerald-400" />,
    title: 'Brute Force',
    desc: 'Automate repeated login attempts to guess credentials.',
    color: 'border-emerald-800/50 hover:border-emerald-600/70',
    tag: 'Auth',
  },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-red-900/30 border border-red-700/40 rounded-full px-4 py-1.5 text-red-400 text-xs font-semibold mb-6 uppercase tracking-wider">
          <AlertTriangle size={12} />
          Educational Lab Environment — Controlled Use Only
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          Web Security <span className="text-red-500">Attack Lab</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Hands-on demonstrations of common web vulnerabilities. Simulate attacks, observe
          detection mechanisms, and learn prevention techniques in a safe, isolated environment.
        </p>
      </div>

      {/* Quick-access stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Attack Types', value: '5', sub: 'Covered' },
          { label: 'Detection Rules', value: '20+', sub: 'Active patterns' },
          { label: 'Live Logging', value: 'DB', sub: 'All attacks stored' },
          { label: 'Prevention', value: '100%', sub: 'Techniques shown' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-sm font-medium text-gray-300">{s.label}</div>
            <div className="text-xs text-gray-500">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Attack modules */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Attack Modules</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {attacks.map(a => (
          <button
            key={a.id}
            onClick={() => onNavigate(a.id)}
            className={`bg-gray-900 border ${a.color} rounded-xl p-5 text-left transition-all duration-200 group hover:bg-gray-800`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-gray-800 group-hover:bg-gray-700 flex items-center justify-center border border-gray-700 transition-colors">
                {a.icon}
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                {a.tag}
              </span>
            </div>
            <h3 className="font-semibold text-white mb-1">{a.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{a.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
              Open demo <ChevronRight size={12} />
            </div>
          </button>
        ))}
      </div>

      {/* Tools section */}
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Analysis Tools</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 text-left flex items-center gap-4 transition-all duration-200 hover:bg-gray-800 group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-900/30 border border-blue-800/50 flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={22} className="text-blue-400" />
          </div>
          <div>
            <div className="font-semibold text-white mb-0.5">Attack Dashboard</div>
            <p className="text-gray-400 text-sm">Live feed of detected attacks with IP, payload, and timestamps.</p>
          </div>
          <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 ml-auto flex-shrink-0" />
        </button>
        <button
          onClick={() => onNavigate('reports')}
          className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 text-left flex items-center gap-4 transition-all duration-200 hover:bg-gray-800 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-900/30 border border-emerald-800/50 flex items-center justify-center flex-shrink-0">
            <FileText size={22} className="text-emerald-400" />
          </div>
          <div>
            <div className="font-semibold text-white mb-0.5">Security Reports</div>
            <p className="text-gray-400 text-sm">Full breakdown of each attack: description, detection, and prevention.</p>
          </div>
          <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 ml-auto flex-shrink-0" />
        </button>
      </div>

      {/* Footer warning */}
      <div className="mt-10 bg-amber-900/20 border border-amber-700/30 rounded-xl p-5">
        <div className="flex gap-3">
          <Shield size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300 mb-1">Legal & Ethical Notice</p>
            <p className="text-amber-500/80 text-sm leading-relaxed">
              This application intentionally contains security vulnerabilities for educational purposes only.
              All demonstrations must be conducted in a controlled, isolated lab environment.
              Unauthorized use of these techniques against real systems is illegal and unethical.
              The attack simulations here do not execute actual attacks — they simulate detection and logging only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
