import { FileText, Database, Code2, RefreshCw, Crosshair, KeyRound, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import SectionHeader from '../components/SectionHeader';

interface ReportSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium';
  severityColor: string;
  description: string;
  howItWorks: string[];
  detectionLogic: string[];
  prevention: string[];
  cwe: string;
  owasp: string;
}

const reports: ReportSection[] = [
  {
    id: 'sqli',
    icon: <Database size={18} className="text-red-400" />,
    title: 'SQL Injection (SQLi)',
    type: 'Injection',
    severity: 'Critical',
    severityColor: 'text-red-400 bg-red-900/30 border-red-700/40',
    description: 'SQL Injection occurs when user-controlled data is incorporated into database queries without proper sanitization. An attacker can manipulate the query logic to bypass authentication, exfiltrate data, modify records, or in some configurations, execute operating system commands.',
    howItWorks: [
      'Application builds a SQL query using string concatenation with user input',
      'Attacker injects SQL syntax into the input (e.g., \' OR 1=1 --)',
      'The injected SQL changes the query\'s logic (tautology, UNION, comment, stack)',
      'Database executes the modified query, returning unintended data or granting access',
    ],
    detectionLogic: [
      'Pattern matching against known SQLi signatures: boolean tautologies (OR 1=1)',
      'Detection of SQL comment terminators: --, #, /*',
      'UNION SELECT keyword sequences indicating data exfiltration attempts',
      'Stacked query delimiters: semicolons followed by DML/DDL keywords',
      'Time-based blind injection keywords: SLEEP(), BENCHMARK(), WAITFOR DELAY',
      'Schema enumeration attempts: information_schema, sys.tables',
    ],
    prevention: [
      'Use parameterized queries / prepared statements — never concatenate user input into SQL',
      'Use an ORM (e.g., Prisma, Hibernate) that handles escaping automatically',
      'Apply the principle of least privilege: DB users should only have necessary permissions',
      'Validate and whitelist input types and lengths at the application layer',
      'Enable database-level query logging to detect anomalies',
      'Use a Web Application Firewall (WAF) as an additional defense layer',
    ],
    cwe: 'CWE-89',
    owasp: 'OWASP A03:2021 — Injection',
  },
  {
    id: 'xss-stored',
    icon: <Code2 size={18} className="text-orange-400" />,
    title: 'Stored Cross-Site Scripting (Stored XSS)',
    type: 'Injection',
    severity: 'High',
    severityColor: 'text-orange-400 bg-orange-900/30 border-orange-700/40',
    description: 'Stored XSS (also called Persistent XSS) occurs when malicious scripts are saved to the server (e.g., in a database) and later rendered in the browser of any user who views the affected page. Unlike reflected XSS, the payload is not delivered in the URL — it lives in the application\'s data.',
    howItWorks: [
      'Attacker submits a form containing a script payload (e.g., <script>alert(1)</script>)',
      'Application stores the payload in the database without sanitization',
      'When another user views the page, the server renders the stored payload in HTML',
      'The victim\'s browser executes the script, enabling session hijacking, keylogging, or redirects',
    ],
    detectionLogic: [
      'Scan all user-submitted content for HTML/script tags before storage',
      'Detect event handler attributes: onerror, onload, onclick, onfocus, onmouseover',
      'Match javascript: URI scheme in href/src attributes',
      'Flag eval(), document.write(), document.cookie access patterns',
      'Log all flagged submissions with full payload and user context',
    ],
    prevention: [
      'Escape all user-generated content before rendering (HTML entity encoding)',
      'Use React\'s default JSX rendering which escapes by default — never use dangerouslySetInnerHTML',
      'Sanitize HTML input with a trusted library (DOMPurify) when rich text is required',
      'Implement a strict Content Security Policy (CSP) to block inline scripts',
      'Set HttpOnly on session cookies to prevent JavaScript access',
      'Use output encoding appropriate to the context (HTML, JS, CSS, URL)',
    ],
    cwe: 'CWE-79',
    owasp: 'OWASP A03:2021 — Injection',
  },
  {
    id: 'xss-reflected',
    icon: <RefreshCw size={18} className="text-yellow-400" />,
    title: 'Reflected Cross-Site Scripting (Reflected XSS)',
    type: 'Injection',
    severity: 'High',
    severityColor: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40',
    description: 'Reflected XSS occurs when user input is immediately reflected in the HTTP response without being stored. The payload is typically delivered via a crafted URL. An attacker tricks a victim into clicking a link; the server reflects the payload back to the victim\'s browser, where it executes.',
    howItWorks: [
      'Attacker crafts a URL with an XSS payload in a query parameter: ?q=<script>...</script>',
      'Victim clicks the link (often through phishing or embedded in another page)',
      'Server reads the parameter and includes it unsanitized in the HTML response',
      'Victim\'s browser executes the script in the context of the legitimate site',
      'Attacker steals cookies, tokens, or performs actions on behalf of the victim',
    ],
    detectionLogic: [
      'Validate all reflected parameters against XSS patterns before including in response',
      'Check for HTML tags, script tags, event handlers, and javascript: URIs',
      'Log all detected payloads with the full URL and remote IP',
      'Monitor for encoded variants: URL encoding, HTML entity encoding bypass attempts',
    ],
    prevention: [
      'HTML-encode all reflected output (convert <, >, &, ", \' to HTML entities)',
      'Never use innerHTML to render reflected content — use textContent',
      'Validate and sanitize all URL parameters server-side',
      'Implement CSP to restrict script sources and disable inline scripts',
      'Set X-XSS-Protection: 1; mode=block response header',
      'Use SameSite cookie attribute to limit CSRF risk from reflected XSS',
    ],
    cwe: 'CWE-79',
    owasp: 'OWASP A03:2021 — Injection',
  },
  {
    id: 'csrf',
    icon: <Crosshair size={18} className="text-blue-400" />,
    title: 'Cross-Site Request Forgery (CSRF)',
    type: 'Broken Access Control',
    severity: 'High',
    severityColor: 'text-blue-400 bg-blue-900/30 border-blue-700/40',
    description: 'CSRF tricks an authenticated user\'s browser into sending forged HTTP requests to a target site. Since the browser automatically includes credentials (cookies, session tokens) with every request to a domain, the target site cannot distinguish a forged request from a legitimate one — unless a secret per-session token is validated.',
    howItWorks: [
      'Victim is authenticated on bank.com (session cookie in browser)',
      'Attacker lures victim to evil.com which contains a hidden form targeting bank.com',
      'Form auto-submits on page load, sending a transfer request with victim\'s credentials',
      'bank.com receives the request with valid session cookie and processes it',
      'Victim\'s account is debited without their knowledge',
    ],
    detectionLogic: [
      'Every state-changing request must include a CSRF token in the request body or header',
      'Server validates the submitted token against the session-stored token',
      'Mismatched, missing, or expired tokens indicate a forged cross-origin request',
      'Check Origin and Referer headers as secondary validation (can be spoofed)',
      'Log all token validation failures with IP and request details',
    ],
    prevention: [
      'Synchronizer token pattern: include a random token in every form, validate on submission',
      'Double-submit cookie pattern: set a random cookie and require it echoed in request body',
      'Set SameSite=Strict or SameSite=Lax on all session cookies',
      'Validate Origin/Referer headers to reject cross-origin requests',
      'Require re-authentication for high-value actions (e.g., fund transfers)',
      'Use framework-provided CSRF protection (Django CSRF middleware, Rails authenticity_token)',
    ],
    cwe: 'CWE-352',
    owasp: 'OWASP A01:2021 — Broken Access Control',
  },
  {
    id: 'brute',
    icon: <KeyRound size={18} className="text-emerald-400" />,
    title: 'Brute Force / Credential Stuffing',
    type: 'Authentication Failure',
    severity: 'Medium',
    severityColor: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/40',
    description: 'Brute force attacks systematically try all possible passwords. Dictionary attacks use lists of common passwords. Credential stuffing uses leaked username/password pairs from other breaches. Without rate limiting or account lockout, attackers can try thousands of combinations per second.',
    howItWorks: [
      'Attacker obtains or generates a wordlist of common passwords',
      'Automated tool submits login requests for each password in the list',
      'Without rate limiting, hundreds of attempts per second are possible',
      'A successful match grants account access — often without triggering any alert',
      'Compromised accounts used for financial fraud, data theft, or account takeover',
    ],
    detectionLogic: [
      'Log every login attempt with username, IP address, timestamp, and success/failure',
      'Count failed attempts per username within a rolling time window (e.g., 2 minutes)',
      'Threshold: 5+ failures → brute force alert + account lockout',
      'Also monitor per-IP across multiple usernames (distributed/spray attacks)',
      'Alert on abnormal patterns: rapid sequential attempts, unusual geographic IPs',
    ],
    prevention: [
      'Rate limiting: max N login attempts per minute per IP or username',
      'Progressive delays: exponential backoff after each failure',
      'Account lockout: temporary lock after threshold failures (alert user by email)',
      'CAPTCHA: challenge after 3 failures to block automated tools',
      'Multi-factor authentication (MFA): makes password knowledge insufficient',
      'Enforce strong password policy and check against known breached password lists (HaveIBeenPwned API)',
      'Monitor login anomalies: unusual IPs, times, geographic locations',
    ],
    cwe: 'CWE-307',
    owasp: 'OWASP A07:2021 — Identification and Authentication Failures',
  },
];

function ReportCard({ r }: { r: ReportSection }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-800/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
          {r.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-sm">{r.title}</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border ${r.severityColor}`}>{r.severity}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{r.owasp} · {r.cwe}</p>
        </div>
        <ChevronDown size={16} className={`text-gray-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-6 space-y-5 border-t border-gray-800">
          <div className="pt-4">
            <p className="text-sm text-gray-400 leading-relaxed">{r.description}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase mb-2">How It Works</h4>
              <ol className="space-y-1.5">
                {r.howItWorks.map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-400 leading-relaxed">
                    <span className="text-red-500 font-bold flex-shrink-0">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h4 className="text-xs font-bold text-yellow-400 uppercase mb-2">Detection Logic</h4>
              <ul className="space-y-1.5">
                {r.detectionLogic.map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-400 leading-relaxed">
                    <span className="text-yellow-500 flex-shrink-0 mt-0.5">▸</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Prevention</h4>
              <ul className="space-y-1.5">
                {r.prevention.map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs text-gray-400 leading-relaxed">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-1 flex-wrap">
            <span className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-400 px-2 py-1 rounded">{r.cwe}</span>
            <span className="text-xs font-mono bg-gray-800 border border-gray-700 text-gray-400 px-2 py-1 rounded">{r.owasp}</span>
            <span className="text-xs bg-gray-800 border border-gray-700 text-gray-400 px-2 py-1 rounded">Type: {r.type}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Reports() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <SectionHeader
        icon={<FileText size={20} className="text-white" />}
        title="Security Reports"
        subtitle="Complete attack documentation: description, detection logic, and prevention techniques"
        badgeColor="bg-emerald-700"
      />

      <div className="space-y-3">
        {reports.map(r => <ReportCard key={r.id} r={r} />)}
      </div>

      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-3">Additional Resources</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-400">
          {[
            { label: 'OWASP Top 10', desc: 'The ten most critical web application security risks' },
            { label: 'OWASP ASVS', desc: 'Application Security Verification Standard' },
            { label: 'CWE/SANS Top 25', desc: 'Most dangerous software weaknesses' },
            { label: 'PortSwigger Web Security Academy', desc: 'Free hands-on web security labs' },
            { label: 'NIST SP 800-53', desc: 'Security and privacy controls for information systems' },
            { label: 'HaveIBeenPwned', desc: 'Check if credentials were exposed in known breaches' },
          ].map(r => (
            <div key={r.label} className="flex gap-2">
              <span className="text-blue-400 flex-shrink-0 mt-0.5">→</span>
              <div>
                <span className="text-white font-medium">{r.label}</span>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
