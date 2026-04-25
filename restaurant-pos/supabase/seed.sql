-- FILE: supabase/seed.sql
create extension if not exists pgcrypto;

-- Creates the default owner account if it does not exist.
do $$
declare
  v_owner_id uuid;
  v_restaurant_id uuid;
begin
  select id into v_owner_id from auth.users where email = 'admin@restaurant.com' limit 1;

  if v_owner_id is null then
    v_owner_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_owner_id,
      'authenticated',
      'authenticated',
      'admin@restaurant.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      jsonb_build_object('name', 'Restaurant Owner', 'role', 'owner'),
      now(),
      now(),
      false,
      false
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      created_at,
      updated_at,
      last_sign_in_at
    )
    values (
      gen_random_uuid(),
      v_owner_id,
      jsonb_build_object('sub', v_owner_id::text, 'email', 'admin@restaurant.com'),
      'email',
      v_owner_id::text,
      now(),
      now(),
      now()
    );
  end if;

  insert into public.profiles (id, name, email, role, restaurant_id, phone, is_active)
  values (
    v_owner_id,
    'Restaurant Owner',
    'admin@restaurant.com',
    'owner',
    null,
    '+1 555-0100',
    true
  )
  on conflict (id) do update
  set
    name = excluded.name,
    email = excluded.email,
    role = excluded.role,
    is_active = true,
    updated_at = now();

  -- Optional demo restaurant and menu data to speed up first run.
  if not exists (select 1 from public.restaurants where owner_id = v_owner_id) then
    insert into public.restaurants (name, owner_id, address, phone, operating_hours)
    values (
      'Amber Bistro',
      v_owner_id,
      '42 Market Street',
      '+1 555-0111',
      '{
        "monday": {"enabled": true, "open": "09:00", "close": "22:00"},
        "tuesday": {"enabled": true, "open": "09:00", "close": "22:00"},
        "wednesday": {"enabled": true, "open": "09:00", "close": "22:00"},
        "thursday": {"enabled": true, "open": "09:00", "close": "22:00"},
        "friday": {"enabled": true, "open": "09:00", "close": "23:00"},
        "saturday": {"enabled": true, "open": "10:00", "close": "23:00"},
        "sunday": {"enabled": true, "open": "10:00", "close": "21:00"}
      }'::jsonb
    )
    returning id into v_restaurant_id;

    update public.profiles
    set restaurant_id = v_restaurant_id, updated_at = now()
    where id = v_owner_id;

    insert into public.menu_items (restaurant_id, name, description, price, category, prep_time_min, available)
    values
      (v_restaurant_id, 'Signature Burger', 'House sauce, pickles, brioche bun', 12.50, 'Burgers', 15, true),
      (v_restaurant_id, 'Smoked Pasta', 'Creamy roasted garlic sauce', 14.00, 'Pasta', 18, true),
      (v_restaurant_id, 'Garden Salad', 'Lemon vinaigrette, seasonal greens', 8.75, 'Salads', 8, true),
      (v_restaurant_id, 'Cold Brew', 'Single-origin, slow-steeped', 4.50, 'Beverages', 3, true);
  end if;
end;
$$;
