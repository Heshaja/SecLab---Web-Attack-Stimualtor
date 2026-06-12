import { useState } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SQLInjection from './pages/SQLInjection';
import StoredXSS from './pages/StoredXSS';
import ReflectedXSS from './pages/ReflectedXSS';
import CSRF from './pages/CSRF';
import BruteForce from './pages/BruteForce';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';

type Page =
  | 'home' | 'login' | 'signup'
  | 'sqli' | 'xss-stored' | 'xss-reflected'
  | 'csrf' | 'brute' | 'dashboard' | 'reports';

function PageContent({ page, onNavigate }: { page: Page; onNavigate: (p: string) => void }) {
  switch (page) {
    case 'login':         return <Login />;
    case 'signup':        return <Signup />;
    case 'sqli':          return <SQLInjection />;
    case 'xss-stored':    return <StoredXSS />;
    case 'xss-reflected': return <ReflectedXSS />;
    case 'csrf':          return <CSRF />;
    case 'brute':         return <BruteForce />;
    case 'dashboard':     return <Dashboard />;
    case 'reports':       return <Reports />;
    default:              return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const navigate = (p: string) => {
    setPage(p as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout activePage={page} onNavigate={navigate}>
      <PageContent page={page} onNavigate={navigate} />
    </Layout>
  );
}
