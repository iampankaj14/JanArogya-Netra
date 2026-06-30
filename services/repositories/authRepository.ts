import { supabase, isSupabaseConfigured } from '../supabase/supabaseConfig';
import { User } from '@/shared/types/user';
import { UserRole } from '@/constants/roles';
import { dummyUsers } from '@/dummy/users';

export const authRepository = {
  login: async (email: string, password: string, role: UserRole): Promise<{ user: User; token: string }> => {
    if (!isSupabaseConfigured) {
      const matched = dummyUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!matched) {
        throw new Error('AUTH/INVALID_CREDENTIALS');
      }
      if (matched.role !== role) {
        throw new Error('AUTH/ROLE_MISMATCH');
      }
      return {
        user: matched,
        token: 'mock-jwt-token-for-' + matched.id,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user || !data.session) {
        throw new Error('AUTH/INVALID_CREDENTIALS');
      }

      const uid = data.user.id;

      // Query user profile and role details from Supabase public.users schema
      const { data: userProfile, error: profileErr } = await supabase
        .from('users')
        .select('name, avatar_url, phc_id, role:roles(name)')
        .eq('id', uid)
        .single();

      if (profileErr || !userProfile) {
        throw new Error('AUTH/INVALID_CREDENTIALS');
      }

      // Cast role relation object safely
      const dbRole = (userProfile.role as any)?.name;

      // Validate matching role hierarchies
      let isMatch = false;
      if (dbRole === 'SUPER_ADMIN') {
        isMatch = true;
      } else if (dbRole === 'DHO' && role === 'DHO') {
        isMatch = true;
      } else if (dbRole === 'BMO' && role === 'BMO') {
        isMatch = true;
      } else if (dbRole === 'PHC_STAFF' && (role === 'PHC_MO' || role === 'DEO' || role === 'ASHA')) {
        isMatch = true;
      }

      if (!isMatch) {
        // Sign out immediately if client role doesn't match DB permissions scope
        await supabase.auth.signOut();
        throw new Error('AUTH/ROLE_MISMATCH');
      }

      const user: User = {
        id: uid,
        name: userProfile.name,
        role: role,
        email: data.user.email || email,
        facilityId: userProfile.phc_id || undefined,
        avatarUrl: userProfile.avatar_url || undefined,
      };

      return {
        user,
        token: data.session.access_token,
      };
    } catch (error: any) {
      if (error.message === 'AUTH/ROLE_MISMATCH' || error.message === 'AUTH/INVALID_CREDENTIALS') {
        throw error;
      }
      throw new Error('DB/FETCH_ERROR');
    }
  },

  logout: async (): Promise<void> => {
    if (!isSupabaseConfigured) {
      return;
    }
    await supabase.auth.signOut();
  },
};
