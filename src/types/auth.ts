import { User, Session } from '@supabase/supabase-js';
import { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  provider: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
