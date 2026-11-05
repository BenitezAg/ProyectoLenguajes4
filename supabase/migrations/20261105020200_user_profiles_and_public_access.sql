alter table public.portfolio_users
  add column first_name text not null default '',
  add column last_name text not null default '',
  add column phone text not null default '';

update public.portfolio_users as profile
set first_name = coalesce(
      case
        when char_length(btrim(coalesce(auth_user.raw_user_meta_data ->> 'first_name', ''))) between 2 and 70
          then nullif(btrim(auth_user.raw_user_meta_data ->> 'first_name'), '')
      end,
      case
        when char_length(split_part(btrim(profile.name), ' ', 1)) between 2 and 70
          then split_part(btrim(profile.name), ' ', 1)
        else 'Usuario'
      end
    ),
    last_name = coalesce(
      case
        when char_length(btrim(coalesce(auth_user.raw_user_meta_data ->> 'last_name', ''))) between 2 and 70
          then nullif(btrim(auth_user.raw_user_meta_data ->> 'last_name'), '')
      end,
      case
        when char_length(btrim(regexp_replace(btrim(profile.name), '^\S+\s*', ''))) between 2 and 70
          then nullif(btrim(regexp_replace(btrim(profile.name), '^\S+\s*', '')), '')
      end,
      ''
    ),
    phone = case
      when coalesce(auth_user.raw_user_meta_data ->> 'phone', '') ~ '^[0-9+(). -]{8,30}$'
        and char_length(regexp_replace(coalesce(auth_user.raw_user_meta_data ->> 'phone', ''), '[^0-9]', '', 'g')) between 8 and 15
        then btrim(auth_user.raw_user_meta_data ->> 'phone')
      else ''
    end
from auth.users as auth_user
where auth_user.id = profile.id;

alter table public.portfolio_users
  add constraint portfolio_users_first_name_length
    check (first_name = '' or char_length(btrim(first_name)) between 2 and 70),
  add constraint portfolio_users_last_name_length
    check (last_name = '' or char_length(btrim(last_name)) between 2 and 70),
  add constraint portfolio_users_phone_format
    check (
      phone = ''
      or (
        char_length(phone) <= 30
        and phone ~ '^[0-9+(). -]+$'
        and char_length(regexp_replace(phone, '[^0-9]', '', 'g')) between 8 and 15
      )
    );

create or replace function public.create_portfolio_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  full_name text;
  first_name text;
  last_name text;
begin
  full_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    'Usuario'
  );
  first_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'first_name'), ''),
    split_part(full_name, ' ', 1)
  );
  last_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'last_name'), ''),
    nullif(btrim(regexp_replace(full_name, '^\S+\s*', '')), ''),
    ''
  );

  insert into public.portfolio_users
    (id, name, email, first_name, last_name, phone)
  values (
    new.id,
    coalesce(nullif(concat_ws(' ', nullif(first_name, ''), nullif(last_name, '')), ''), full_name),
    lower(btrim(new.email)),
    first_name,
    last_name,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'phone'), ''), '')
  );
  return new;
end;
$$;

grant select on public.portfolio_services to anon, authenticated;
grant select on public.portfolio_daily_visits to authenticated;
