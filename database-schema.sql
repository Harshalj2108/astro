-- Database schema for Astrology Website
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Birth details table
create table birth_details (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  full_name text not null,
  date_of_birth date not null,
  time_of_birth time not null,
  place_of_birth text not null,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  timezone text,
  is_owner boolean default false not null, -- true if this is the account owner's birth details
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Astrology charts table
create table astrology_charts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  birth_detail_id uuid references birth_details on delete cascade not null,
  chart_type text not null, -- e.g., 'natal', 'transit', 'composite'
  chart_data jsonb not null, -- store all chart calculations
  chart_name text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index on profiles (id);
create index on birth_details (user_id);
create index on astrology_charts (user_id);
create index on astrology_charts (birth_detail_id);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table birth_details enable row level security;
alter table astrology_charts enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- RLS Policies for birth_details
create policy "Users can view their own birth details"
  on birth_details for select
  using (auth.uid() = user_id);

create policy "Users can insert their own birth details"
  on birth_details for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own birth details"
  on birth_details for update
  using (auth.uid() = user_id);

create policy "Users can delete their own birth details"
  on birth_details for delete
  using (auth.uid() = user_id);

-- RLS Policies for astrology_charts
create policy "Users can view their own charts"
  on astrology_charts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own charts"
  on astrology_charts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own charts"
  on astrology_charts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own charts"
  on astrology_charts for delete
  using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone_number', '')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();