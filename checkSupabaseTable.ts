import { supabase } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export const checkSupabaseSetup = async () => {
  try {
    // Check profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .select('count');

    if (profileError) {
      console.error('Profiles table check error:', profileError);
      // Create profiles table if it doesn't exist
      await supabase.rpc('create_profiles_table');
    }

    // Test basic connection
    console.log('Testing Supabase connection...');
    const { data: tableData, error: tableError } = await supabase
      .from('articles')
      .select('count');

    if (tableError) {
      console.error('Table check error:', tableError);
      if (tableError.code === 'PGRST116') {
        console.error('The "articles" table does not exist');
      }
      return false;
    }

    console.log('Table check successful:', tableData);
    return true;

  } catch (error) {
    console.error('Setup error:', error);
    return false;
  }
};

export async function checkAndCreateTables(supabase: SupabaseClient) {
  // Check and create profiles table
  const { error: profileError } = await supabase.from('profiles').select('*').limit(1);
  
  if (profileError) {
    const { error: createError } = await supabase.rpc('create_profiles_table');
    if (createError) {
      console.error('Error creating profiles table:', createError);
    }
  }
}

// Add this SQL function to your Supabase SQL editor:
/*
create or replace function create_profiles_table()
returns void
language plpgsql
security definer
as $$
begin
  create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    full_name text,
    avatar_url text,
    bio text,
    role text default 'member',
    level integer default 1,
    following_count integer default 0,
    followers_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
  );

  -- Set up Row Level Security (RLS)
  alter table public.profiles enable row level security;

  -- Create policies
  create policy "Public profiles are viewable by everyone"
    on profiles for select
    using ( true );

  create policy "Users can insert their own profile"
    on profiles for insert
    with check ( auth.uid() = id );

  create policy "Users can update own profile"
    on profiles for update
    using ( auth.uid() = id );
end;
$$;
*/ 