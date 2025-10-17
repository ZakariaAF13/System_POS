-- Step 1: Temporary disable trigger untuk testing
alter table public.profiles disable trigger prevent_non_admin_role_change;

-- Step 2: Test dari web, jika berhasil maka trigger yang bermasalah

-- Step 3: Fix trigger dengan versi yang lebih aman (no recursion)
create or replace function public.profiles_prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_role text;
begin
  -- Only check if role is being changed
  if new.role is distinct from old.role then
    -- Get current user's role directly (bypassing RLS with security definer)
    select role into current_user_role
    from public.profiles
    where id = auth.uid()
    limit 1;
    
    -- Only admins can change roles
    if current_user_role is null or current_user_role != 'admin' then
      raise exception 'Only admins can change roles';
    end if;
  end if;
  
  return new;
end;
$$;

-- Step 4: Re-enable trigger dengan fungsi yang sudah diperbaiki
alter table public.profiles enable trigger prevent_non_admin_role_change;

-- Alternative: DROP trigger completely untuk testing
-- drop trigger if exists prevent_non_admin_role_change on public.profiles;
