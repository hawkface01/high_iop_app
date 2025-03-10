-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create security policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( true );  -- Allow profile creation during signup

create policy "Users can update own profile."
  on profiles for update using (
    auth.uid() = id
  );

-- Create indexes for better performance
create index profiles_id_index on public.profiles(id);
create index profiles_email_index on public.profiles(email); 