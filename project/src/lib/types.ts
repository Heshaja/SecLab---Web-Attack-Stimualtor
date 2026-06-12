export type AttackType = 'SQL_INJECTION' | 'XSS_STORED' | 'XSS_REFLECTED' | 'CSRF' | 'BRUTE_FORCE';

export interface AttackLog {
  id: string;
  attack_type: AttackType;
  payload: string;
  ip_address: string;
  user_agent: string;
  username_attempted: string | null;
  details: string;
  detected_at: string;
}

export interface LoginAttempt {
  id: string;
  username: string;
  ip_address: string;
  success: boolean;
  attempted_at: string;
}

export interface Post {
  id: string;
  user_id: string | null;
  username: string;
  title: string;
  content: string;
  created_at: string;
}

export interface DemoUser {
  id: string;
  username: string;
  email: string;
  password_plain: string;
  role: string;
  created_at: string;
}
