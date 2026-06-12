import { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  LogIn,
  UserPlus,
  Database,
  Code2,
  RefreshCw,
  Crosshair,
  KeyRound,
  FileText,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '#home', icon: <Shield size={16} /> },
  { label: 'Login Demo', href: '#login', icon: <LogIn size={16} /> },
  { label: 'Signup Demo', href: '#signup', icon: <UserPlus size={16} /> },
  { label: 'SQL Injection', href: '#sqli', icon: <Database size={16} />, badge: 'VULN' },
  { label: 'Stored XSS', href: '#xss-stored', icon: <Code2 size={16} />, badge: 'VULN' },
  { label: 'Reflected XSS', href: '#xss-reflected', icon: <RefreshCw size={16} />, badge: 'VULN' },
  { label: 'CSRF Demo', href: '#csrf', icon: <Crosshair size={16} />, badge: 'VULN' },
  { label: 'Brute Force', href: '#brute', icon: <KeyRound size={16} />, badge: 'VULN' },
  { label: 'Attack Dashboard', href: '#dashboard', icon: <LayoutDashboard size={16} /> },
  { label: 'Reports', href: '#reports', icon: <FileText size={16} /> },
];

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, activePage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNav = (href: string) => {
    onNavigate(href.replace('#', ''));
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">SecLab</div>
            <div className="text-gray-400 text-xs">Attack Simulator</div>
          </div>
          <button
            className="ml-auto lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Navigation</p>
          {navItems.map(item => {
            const pageId = item.href.replace('#', '');
            const isActive = activePage === pageId;
            return (
              <button
                key={item.href}
                onClick={() => handleNav(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                <span className={isActive ? 'text-red-400' : 'text-gray-500'}>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-900/50 text-red-400 border border-red-800/50">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Warning footer */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="bg-amber-900/30 border border-amber-700/40 rounded-lg p-3">
            <p className="text-amber-400 text-xs font-semibold mb-1">Educational Use Only</p>
            <p className="text-amber-500/70 text-xs">
              All attacks simulated in a controlled environment. Do not use on real systems.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-gray-400 font-mono">LIVE DETECTION ACTIVE</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono hidden sm:block">
              v1.0.0 — Lab Environment
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
