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
  time_of_birth time, -- Can be null if time unknown
  place_of_birth text not null,
  latitude decimal(10, 8), -- Geographic latitude for chart calculations
  longitude decimal(11, 8), -- Geographic longitude for chart calculations
  timezone text, -- IANA timezone (e.g., 'Asia/Kolkata')
  is_owner boolean default false not null, -- true if this is the account owner's birth details
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Astrology charts table
create table astrology_charts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  birth_details_id uuid references birth_details on delete cascade not null,
  chart_name text not null,
  chart_type text not null default 'D1', -- D1, D9, D10, D12, D16, D20, D24, D27, D30, D60
  chart_data jsonb not null, -- Complete astrological calculation data
  -- Chart data structure:
  -- {
  --   "Sun": { "longitude": 51.25, "rashiNumber": 2, "rashiName": "Taurus", "rashiSanskrit": "Vrishabha", 
  --            "degreeInRashi": 21.25, "nakshatraNumber": 4, "nakshatraName": "Rohini", "formatted": "Taurus 21° 15'" },
  --   "Moon": { ... },
  --   "Mercury": { ... },
  --   "Venus": { ... },
  --   "Mars": { ... },
  --   "Jupiter": { ... },
  --   "Saturn": { ... },
  --   "Rahu": { ... },
  --   "Ketu": { ... },
  --   "Ascendant": { ... },
  --   "housePlacements": { "Sun": 9, "Moon": 11, ... },
  --   "birthDetails": { "name": "...", "dateOfBirth": "...", "timeOfBirth": "...", 
  --                     "placeOfBirth": "...", "latitude": 28.61, "longitude": 77.20 },
  --   "ayanamsa": 24.15,
  --   "calculatedAt": "2025-12-11T10:30:00.000Z"
  -- }
  notes text,
  is_favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index on profiles (id);
create index on birth_details (user_id);
create index on birth_details (is_owner);
create index on astrology_charts (user_id);
create index on astrology_charts (birth_details_id);
create index on astrology_charts (chart_type);
create index on astrology_charts (created_at desc);

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