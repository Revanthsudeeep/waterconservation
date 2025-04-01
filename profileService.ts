import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: 'admin' | 'moderator' | 'member';
  level: number;
  following_count: number;
  followers_count: number;
  created_at: string;
  updated_at: string;
}

export const profileService = {
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (!data) {
        // If no profile exists, create one
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const newProfile = {
            id: user.id,
            username: user.email?.split('@')[0],
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            avatar_url: user.user_metadata?.avatar_url || null,
            bio: '',
            role: 'member',
            level: 1,
            following_count: 0,
            followers_count: 0
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) throw createError;
          return createdProfile;
        }
      }

      return data;
    } catch (error: any) {
      console.error('Error in getProfile:', error);
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to update profile');

      return data as Profile;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await this.updateProfile(userId, { avatar_url: publicUrl });
    return publicUrl;
  },

  async followUser(userId: string, targetUserId: string) {
    const { error } = await supabase
      .from('user_follows')
      .insert({ follower_id: userId, following_id: targetUserId });

    if (error) throw error;
  },

  async unfollowUser(userId: string, targetUserId: string) {
    const { error } = await supabase
      .from('user_follows')
      .delete()
      .match({ follower_id: userId, following_id: targetUserId });

    if (error) throw error;
  }
}; 