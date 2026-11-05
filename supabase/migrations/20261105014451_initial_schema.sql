create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.is_portfolio_operator()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'portfolio_role', '') = 'operator';
$$;

create table public.portfolio_users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 70),
  email text not null unique check (char_length(email) <= 254),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function private.is_active_portfolio_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.portfolio_users
      where id = (select auth.uid())
        and active
    );
$$;

create table public.portfolio_projects (
  id text primary key check (char_length(id) between 1 and 100),
  title text not null check (char_length(btrim(title)) between 2 and 80),
  category text not null check (category in ('web', 'diseno', 'app')),
  emoji text not null check (char_length(emoji) between 1 and 8),
  color text not null check (color in ('pink', 'yellow', 'cyan', 'green', 'purple', 'blue')),
  description text not null check (char_length(btrim(description)) between 5 and 300),
  technologies text not null check (char_length(btrim(technologies)) between 1 and 140),
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_demos (
  id text primary key check (char_length(id) between 1 and 100),
  project_id text not null references public.portfolio_projects (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  description text not null check (char_length(btrim(description)) between 5 and 240),
  kind text not null check (kind in ('shop', 'brand', 'habits', 'dashboard', 'gallery', 'arcade')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.portfolio_services (
  id text primary key check (char_length(id) between 1 and 100),
  icon text not null check (char_length(icon) between 1 and 8),
  title text not null check (char_length(btrim(title)) between 2 and 80),
  description text not null check (char_length(btrim(description)) between 5 and 300),
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portfolio_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null check (char_length(btrim(name)) between 2 and 70),
  email text not null check (char_length(email) between 3 and 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  subject text not null check (subject in ('Proyecto nuevo', 'Cotización', 'Asesoría técnica', 'Otra consulta')),
  message text not null check (char_length(btrim(message)) between 20 and 3000),
  status text not null default 'nueva' check (status in ('nueva', 'en curso', 'respondida')),
  notification_status text not null default 'pending' check (notification_status in ('pending', 'sending', 'sent', 'failed')),
  responded_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.portfolio_daily_visits (
  visit_date date primary key default current_date,
  total_visits bigint not null default 0 check (total_visits >= 0),
  registered_visits bigint not null default 0 check (registered_visits >= 0 and registered_visits <= total_visits)
);

create or replace function public.create_portfolio_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.portfolio_users (id, name, email)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), 'Usuario'),
    lower(btrim(new.email))
  );
  return new;
end;
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_portfolio_operator() to authenticated;
grant execute on function private.is_active_portfolio_user() to authenticated;
revoke all on function public.create_portfolio_user() from public, anon, authenticated;

create or replace function public.get_public_project_previews()
returns table (id text, title text, category text, emoji text, color text)
language sql
stable
security definer
set search_path = ''
as $$
  select project.id, project.title, project.category, project.emoji, project.color
  from public.portfolio_projects as project
  where project.published
  order by project.position, project.id;
$$;

create or replace function public.record_portfolio_visit()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  registered_count integer := case
    when private.is_active_portfolio_user() then 1
    else 0
  end;
begin
  insert into public.portfolio_daily_visits (visit_date, total_visits, registered_visits)
  values (current_date, 1, registered_count)
  on conflict (visit_date) do update
  set total_visits = public.portfolio_daily_visits.total_visits + 1,
      registered_visits = public.portfolio_daily_visits.registered_visits + excluded.registered_visits;
end;
$$;

create or replace function public.update_portfolio_timestamp()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.update_portfolio_timestamp() from public, anon, authenticated;

create trigger on_portfolio_user_created
  after insert on auth.users
  for each row execute function public.create_portfolio_user();

create trigger portfolio_projects_updated_at
  before update on public.portfolio_projects
  for each row execute function public.update_portfolio_timestamp();

create trigger portfolio_services_updated_at
  before update on public.portfolio_services
  for each row execute function public.update_portfolio_timestamp();

create index portfolio_demos_project_position_idx
  on public.portfolio_demos (project_id, position);

create index portfolio_users_created_at_idx
  on public.portfolio_users (created_at desc);

create index portfolio_messages_created_at_idx
  on public.portfolio_messages (created_at desc);

create index portfolio_messages_status_created_at_idx
  on public.portfolio_messages (status, created_at desc);

create index portfolio_projects_published_position_idx
  on public.portfolio_projects (published, position);

alter table public.portfolio_users enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_demos enable row level security;
alter table public.portfolio_services enable row level security;
alter table public.portfolio_messages enable row level security;
alter table public.portfolio_daily_visits enable row level security;

revoke all on public.portfolio_users from public, anon, authenticated;
revoke all on public.portfolio_projects from public, anon, authenticated;
revoke all on public.portfolio_demos from public, anon, authenticated;
revoke all on public.portfolio_services from public, anon, authenticated;
revoke all on public.portfolio_messages from public, anon, authenticated;
revoke all on public.portfolio_daily_visits from public, anon, authenticated;

grant select, update on public.portfolio_users to authenticated;
grant select, insert, update, delete on public.portfolio_projects to authenticated;
grant select, insert, update, delete on public.portfolio_demos to authenticated;
grant select, insert, update, delete on public.portfolio_services to authenticated;
grant select, insert, update on public.portfolio_messages to authenticated;
grant insert on public.portfolio_messages to anon;
grant execute on function public.get_public_project_previews() to anon, authenticated;
grant execute on function public.record_portfolio_visit() to anon, authenticated;
revoke all on function public.get_public_project_previews() from public;
revoke all on function public.record_portfolio_visit() from public;

create policy "Users read their own profile; operators manage registrations"
  on public.portfolio_users for select to authenticated
  using (id = (select auth.uid()) or (select private.is_portfolio_operator()));

create policy "Only operators update registration status"
  on public.portfolio_users for update to authenticated
  using ((select private.is_portfolio_operator()))
  with check ((select private.is_portfolio_operator()));

create policy "Active registered users read published projects"
  on public.portfolio_projects for select to authenticated
  using (
    published
    and (select private.is_active_portfolio_user())
  );

create policy "Only operators create projects"
  on public.portfolio_projects for insert to authenticated
  with check ((select private.is_portfolio_operator()));

create policy "Only operators update projects"
  on public.portfolio_projects for update to authenticated
  using ((select private.is_portfolio_operator()))
  with check ((select private.is_portfolio_operator()));

create policy "Only operators delete projects"
  on public.portfolio_projects for delete to authenticated
  using ((select private.is_portfolio_operator()));

create policy "Active registered users read project demos"
  on public.portfolio_demos for select to authenticated
  using ((select private.is_active_portfolio_user()));

create policy "Only operators create demos"
  on public.portfolio_demos for insert to authenticated
  with check ((select private.is_portfolio_operator()));

create policy "Only operators update demos"
  on public.portfolio_demos for update to authenticated
  using ((select private.is_portfolio_operator()))
  with check ((select private.is_portfolio_operator()));

create policy "Only operators delete demos"
  on public.portfolio_demos for delete to authenticated
  using ((select private.is_portfolio_operator()));

create policy "Anyone reads published services"
  on public.portfolio_services for select to anon, authenticated
  using (
    active
    or (select private.is_portfolio_operator())
  );

create policy "Only operators create services"
  on public.portfolio_services for insert to authenticated
  with check ((select private.is_portfolio_operator()));

create policy "Only operators update services"
  on public.portfolio_services for update to authenticated
  using ((select private.is_portfolio_operator()))
  with check ((select private.is_portfolio_operator()));

create policy "Only operators delete services"
  on public.portfolio_services for delete to authenticated
  using ((select private.is_portfolio_operator()));

create policy "Visitors submit their own validated messages"
  on public.portfolio_messages for insert to anon, authenticated
  with check (
    (
      (select auth.uid()) is null
      and user_id is null
    )
    or (
      (select auth.uid()) is not null
      and user_id = (select auth.uid())
      and (select private.is_active_portfolio_user())
    )
  );

create policy "Only operators read messages"
  on public.portfolio_messages for select to authenticated
  using ((select private.is_portfolio_operator()));

create policy "Only operators update message follow-ups"
  on public.portfolio_messages for update to authenticated
  using ((select private.is_portfolio_operator()))
  with check ((select private.is_portfolio_operator()));

create policy "Only operators read daily analytics"
  on public.portfolio_daily_visits for select to authenticated
  using ((select private.is_portfolio_operator()));

insert into public.portfolio_projects
  (id, title, category, emoji, color, description, technologies, position)
values
  ('tienda-online', 'Tienda online', 'web', '🛍️', 'pink', 'Una tienda online veloz, con una experiencia de compra simple y pagos seguros.', 'React · Node.js · Stripe', 1),
  ('identidad-de-marca', 'Identidad de marca', 'diseno', '🎨', 'yellow', 'Un sistema visual completo, desde el logotipo hasta la guía de marca.', 'Figma · UI/UX · CSS', 2),
  ('app-de-habitos', 'App de hábitos', 'app', '📱', 'cyan', 'Una aplicación móvil para adquirir hábitos y dar seguimiento al progreso.', 'React · Node.js · PostgreSQL', 3),
  ('dashboard-analitico', 'Dashboard analítico', 'web', '📊', 'green', 'Un panel de datos con filtros útiles e indicadores fáciles de entender.', 'React · Express · Chart.js', 4),
  ('ilustracion-editorial', 'Ilustración editorial', 'diseno', '🖌️', 'purple', 'Una serie de ilustraciones pensada para las ocho entregas de una revista.', 'Procreate · Figma · Ilustración', 5),
  ('juego-arcade', 'Juego arcade', 'app', '🎮', 'blue', 'Un juego arcade de ritmo rápido con un tablero de puntuaciones.', 'JavaScript · Canvas · Web Audio', 6)
on conflict (id) do nothing;

insert into public.portfolio_demos (id, project_id, name, description, kind, position)
values
  ('demo-tienda', 'tienda-online', 'Compra interactiva', 'Añade una gorra a un carrito de ejemplo.', 'shop', 1),
  ('demo-marca', 'identidad-de-marca', 'Explorador de identidad', 'Explora los colores y los elementos de la marca.', 'brand', 1),
  ('demo-habitos', 'app-de-habitos', 'Seguimiento de hábitos', 'Marca tu progreso diario en esta demo interactiva.', 'habits', 1),
  ('demo-dashboard', 'dashboard-analitico', 'Panel de estadísticas', 'Consulta un indicador de ventas ilustrativo.', 'dashboard', 1),
  ('demo-ilustracion', 'ilustracion-editorial', 'Muestra editorial', 'Explora las ilustraciones de la colección.', 'gallery', 1),
  ('demo-arcade', 'juego-arcade', 'Reto de reflejos', 'Juega una partida rápida de prueba.', 'arcade', 1)
on conflict (id) do nothing;

insert into public.portfolio_services (id, icon, title, description, position)
values
  ('desarrollo-fullstack', '⌘', 'Desarrollo full stack', 'Aplicaciones web completas, rápidas y adaptadas al crecimiento de tu proyecto.', 1),
  ('diseno-ux', '✳', 'Diseño y experiencia UX/UI', 'Interfaces claras y sistemas visuales que ponen a las personas primero.', 2),
  ('asesoria', '↗', 'Asesoría técnica', 'Acompañamiento práctico para planificar, mantener o mejorar un producto digital.', 3)
on conflict (id) do nothing;
