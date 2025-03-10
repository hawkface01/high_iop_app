-- Drop existing table if it exists
drop table if exists public.scan_results;

-- Create scan_results table
create table public.scan_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  result text not null check (result in ('Normal', 'High')),
  pressure numeric not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.scan_results enable row level security;

-- Create security policies
create policy "Users can view their own scan results"
  on public.scan_results
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scan results"
  on public.scan_results
  for insert
  with check (auth.uid() = user_id);

-- Create indexes for better performance
create index scan_results_user_id_idx on public.scan_results(user_id);
create index scan_results_created_at_idx on public.scan_results(created_at); 