/**
 * ATTACK DETECTION LIBRARY
 * ========================
 * This module implements client-side detection heuristics for common web attacks.
 * In a real application, detection should happen server-side. These patterns are
 * intentionally simplified for educational demonstration purposes.
 */

import { supabase } from './supabase';
import type { AttackType } from './types';

// Simulated "client IP" for demo purposes (browsers can't read real IP)
export const DEMO_IP = '192.168.1.' + Math.floor(Math.random() * 254 + 1);

// ---------------------------------------------------------------------------
// SQL INJECTION DETECTION
// Looks for classic SQLi markers: comment sequences, UNION keywords,
// boolean tautologies, and stacked queries.
// ---------------------------------------------------------------------------
const SQL_PATTERNS = [
  /('|")\s*or\s+['"\d]/i,           // ' OR 1=1 or " OR "a"="a
  /('|")\s*--/i,                     // ' --  (comment terminator)
  /union\s+(all\s+)?select/i,        // UNION SELECT / UNION ALL SELECT
  /;\s*(drop|delete|insert|update)/i,// Stacked queries
  /'\s*=\s*'/i,                      // '='
  /xp_cmdshell/i,                    // MSSQL shell exec
  /information_schema/i,             // Schema enumeration
  /sleep\s*\(/i,                     // Time-based blind: SLEEP()
  /benchmark\s*\(/i,                 // MySQL benchmark
  /waitfor\s+delay/i,                // MSSQL time-based
];

export function detectSQLInjection(input: string): boolean {
  return SQL_PATTERNS.some(p => p.test(input));
}

// ---------------------------------------------------------------------------
// XSS DETECTION
// Looks for script tags, event handlers, javascript: URIs, and template injection.
// ---------------------------------------------------------------------------
const XSS_PATTERNS = [
  /<script[\s>]/i,                   // <script> or <script src=...>
  /<\/script>/i,                     // </script>
  /javascript\s*:/i,                 // javascript: URI
  /on\w+\s*=\s*["'`]?\s*(alert|confirm|prompt|eval|fetch|document|window)/i,
  /onerror\s*=/i,                    // onerror=
  /onload\s*=/i,                     // onload=
  /onclick\s*=/i,                    // onclick=
  /onfocus\s*=/i,                    // onfocus=
  /alert\s*\(/i,                     // alert(
  /<img[^>]+onerror/i,              // <img onerror=...>
  /eval\s*\(/i,                      // eval(
  /document\.cookie/i,               // Cookie theft
  /document\.write/i,                // document.write
  /<iframe/i,                        // iframe injection
  /\bvbscript\s*:/i,                 // VBScript URI
];

export function detectXSS(input: string): boolean {
  return XSS_PATTERNS.some(p => p.test(input));
}

// ---------------------------------------------------------------------------
// BRUTE FORCE DETECTION
// Counts failed login attempts within a time window per username/IP.
// Threshold: 5 failures within 2 minutes = brute force detected.
// ---------------------------------------------------------------------------
export async function checkBruteForce(username: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('login_attempts')
    .select('id')
    .eq('username', username)
    .eq('success', false)
    .gte('attempted_at', windowStart);

  return (data?.length ?? 0) >= 5;
}

// ---------------------------------------------------------------------------
// LOG ATTACK TO DATABASE
// Persists a detected attack to the attack_logs table.
// ---------------------------------------------------------------------------
export async function logAttack(params: {
  attackType: AttackType;
  payload: string;
  details: string;
  usernameAttempted?: string;
}) {
  await supabase.from('attack_logs').insert({
    attack_type: params.attackType,
    payload: params.payload.slice(0, 2000),
    ip_address: DEMO_IP,
    user_agent: navigator.userAgent.slice(0, 500),
    username_attempted: params.usernameAttempted ?? null,
    details: params.details,
  });
}

// ---------------------------------------------------------------------------
// LOG LOGIN ATTEMPT
// ---------------------------------------------------------------------------
export async function logLoginAttempt(username: string, success: boolean) {
  await supabase.from('login_attempts').insert({
    username,
    ip_address: DEMO_IP,
    success,
  });
}

// ---------------------------------------------------------------------------
// CSRF TOKEN UTILITIES
// In a real app these are server-generated. Here we simulate client-side
// generation for demonstration. A missing or mismatched token triggers detection.
// ---------------------------------------------------------------------------
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function getSessionCSRFToken(): string {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem('csrf_token', token);
  }
  return token;
}

export function validateCSRFToken(submitted: string): boolean {
  const session = sessionStorage.getItem('csrf_token');
  return !!session && session === submitted;
}
