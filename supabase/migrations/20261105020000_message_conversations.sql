alter table public.portfolio_messages
  add column guest_access_hash text
    check (guest_access_hash is null or guest_access_hash ~ '^[0-9a-f]{64}$'),
  add column recipient text not null default 'all'
    check (recipient in (
      'all',
      'santiago-daniel-acuna',
      'angel-gabriel-benitez',
      'abel-villafane',
      'wilson-lopez'
    ));

drop policy if exists "Visitors submit their own validated messages"
  on public.portfolio_messages;

create policy "Visitors submit their own validated messages"
  on public.portfolio_messages for insert to authenticated
  with check (
    (select auth.uid()) is not null
    and user_id = (select auth.uid())
    and guest_access_hash is null
    and (select private.is_active_portfolio_user())
  );

revoke insert on public.portfolio_messages from anon;

create or replace function private.owns_portfolio_message(p_message_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.portfolio_messages
      where id = p_message_id
        and user_id = (select auth.uid())
    );
$$;

revoke all on function private.owns_portfolio_message(uuid) from public, anon;
grant execute on function private.owns_portfolio_message(uuid) to authenticated;
grant usage on schema private to anon, authenticated;
revoke all on function private.is_portfolio_operator() from public, anon, authenticated;
revoke all on function private.is_active_portfolio_user() from public, anon, authenticated;
grant execute on function private.is_portfolio_operator() to anon, authenticated;
grant execute on function private.is_active_portfolio_user() to authenticated;

create policy "Users read their own contact messages"
  on public.portfolio_messages for select to authenticated
  using (
    (select private.is_portfolio_operator())
    or (select private.owns_portfolio_message(id))
  );

insert into public.portfolio_users (id, name, email)
select
  auth_user.id,
  coalesce(
    nullif(btrim(auth_user.raw_user_meta_data ->> 'full_name'), ''),
    'Usuario'
  ),
  lower(btrim(auth_user.email))
from auth.users as auth_user
where auth_user.email is not null
on conflict (id) do nothing;

create or replace function public.submit_guest_portfolio_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text,
  p_recipient text,
  p_guest_access_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  message_id uuid;
begin
  if (select auth.uid()) is not null then
    raise exception 'Esta operación es solo para consultas de invitado.';
  end if;
  if p_guest_access_hash is null or p_guest_access_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'El enlace privado de seguimiento no es válido.';
  end if;

  insert into public.portfolio_messages
    (name, email, subject, message, recipient, guest_access_hash)
  values
    (btrim(p_name), lower(btrim(p_email)), p_subject, btrim(p_message), p_recipient, p_guest_access_hash)
  returning id into message_id;

  return message_id;
end;
$$;

create table public.portfolio_message_replies (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.portfolio_messages (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  author_role text not null check (author_role in ('operator', 'customer')),
  body text not null check (char_length(btrim(body)) between 1 and 3000),
  created_at timestamptz not null default now()
);

create index portfolio_message_replies_message_created_idx
  on public.portfolio_message_replies (message_id, created_at);

alter table public.portfolio_message_replies enable row level security;
revoke all on public.portfolio_message_replies from public, anon, authenticated;
grant select, insert on public.portfolio_message_replies to authenticated;

create policy "Operators and message owners read conversation replies"
  on public.portfolio_message_replies for select to authenticated
  using (
    (select private.is_portfolio_operator())
    or (select private.owns_portfolio_message(message_id))
  );

create policy "Operators and message owners send conversation replies"
  on public.portfolio_message_replies for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and (
      (
        author_role = 'operator'
        and (select private.is_portfolio_operator())
      )
      or (
        author_role = 'customer'
        and (select private.owns_portfolio_message(message_id))
      )
    )
  );

create or replace function public.get_guest_portfolio_message(p_access_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  message_data jsonb;
begin
  if p_access_token is null or p_access_token !~ '^[A-Za-z0-9_-]{32,128}$' then
    return null;
  end if;

  select jsonb_build_object(
    'id', message.id,
    'name', message.name,
    'subject', message.subject,
    'message', message.message,
    'status', message.status,
    'created_at', message.created_at,
    'replies', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', reply.id,
          'author_role', reply.author_role,
          'body', reply.body,
          'created_at', reply.created_at
        )
        order by reply.created_at
      )
      from public.portfolio_message_replies as reply
      where reply.message_id = message.id
    ), '[]'::jsonb)
  )
  into message_data
  from public.portfolio_messages as message
  where message.guest_access_hash = encode(
    extensions.digest(convert_to(p_access_token, 'UTF8'), 'sha256'),
    'hex'
  );

  return message_data;
end;
$$;

create or replace function public.reply_to_guest_portfolio_message(
  p_access_token text,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  message_id uuid;
  reply_id uuid;
begin
  if p_access_token is null or p_access_token !~ '^[A-Za-z0-9_-]{32,128}$' then
    raise exception 'Consulta no encontrada.';
  end if;
  if p_body is null or char_length(btrim(p_body)) not between 1 and 3000 then
    raise exception 'La respuesta debe tener entre 1 y 3000 caracteres.';
  end if;

  select message.id
  into message_id
  from public.portfolio_messages as message
  where message.guest_access_hash = encode(
    extensions.digest(convert_to(p_access_token, 'UTF8'), 'sha256'),
    'hex'
  )
  for update;

  if message_id is null then
    raise exception 'Consulta no encontrada.';
  end if;

  insert into public.portfolio_message_replies (message_id, author_role, body)
  values (message_id, 'customer', btrim(p_body))
  returning id into reply_id;

  update public.portfolio_messages
  set status = 'en curso',
      responded_at = null
  where id = message_id;

  return reply_id;
end;
$$;

create or replace function public.reply_to_portfolio_message(
  p_message_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  reply_id uuid;
begin
  if (select auth.uid()) is null
    or not (select private.owns_portfolio_message(p_message_id)) then
    raise exception 'Consulta no encontrada.';
  end if;
  if p_body is null or char_length(btrim(p_body)) not between 1 and 3000 then
    raise exception 'La respuesta debe tener entre 1 y 3000 caracteres.';
  end if;

  insert into public.portfolio_message_replies
    (message_id, author_id, author_role, body)
  values
    (p_message_id, (select auth.uid()), 'customer', btrim(p_body))
  returning id into reply_id;

  update public.portfolio_messages
  set status = 'en curso',
      responded_at = null
  where id = p_message_id;

  return reply_id;
end;
$$;

create or replace function public.reply_to_operator_portfolio_message(
  p_message_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  reply_id uuid;
begin
  if not (select private.is_portfolio_operator()) then
    raise exception 'Solo el equipo puede responder consultas.';
  end if;
  if p_body is null or char_length(btrim(p_body)) not between 1 and 3000 then
    raise exception 'La respuesta debe tener entre 1 y 3000 caracteres.';
  end if;

  insert into public.portfolio_message_replies
    (message_id, author_id, author_role, body)
  values
    (p_message_id, (select auth.uid()), 'operator', btrim(p_body))
  returning id into reply_id;

  update public.portfolio_messages
  set status = 'respondida',
      responded_at = now()
  where id = p_message_id;

  return reply_id;
end;
$$;

revoke all on function public.get_guest_portfolio_message(text) from public;
revoke all on function public.reply_to_guest_portfolio_message(text, text) from public;
revoke all on function public.reply_to_portfolio_message(uuid, text) from public;
revoke all on function public.reply_to_operator_portfolio_message(uuid, text) from public;
revoke all on function public.submit_guest_portfolio_message(text, text, text, text, text, text) from public;
grant execute on function public.get_guest_portfolio_message(text) to anon, authenticated;
grant execute on function public.reply_to_guest_portfolio_message(text, text) to anon, authenticated;
grant execute on function public.reply_to_portfolio_message(uuid, text) to authenticated;
grant execute on function public.reply_to_operator_portfolio_message(uuid, text) to authenticated;
grant execute on function public.submit_guest_portfolio_message(text, text, text, text, text, text) to anon;
