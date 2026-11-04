create policy "Operators read all projects"
  on public.portfolio_projects for select to authenticated
  using ((select private.is_portfolio_operator()));

create policy "Operators read all project demos"
  on public.portfolio_demos for select to authenticated
  using ((select private.is_portfolio_operator()));

update public.portfolio_projects
set published = false
where id in (
  'tienda-online',
  'identidad-de-marca',
  'app-de-habitos',
  'dashboard-analitico',
  'ilustracion-editorial',
  'juego-arcade'
);

update public.portfolio_services
set active = false
where id in (
  'desarrollo-fullstack',
  'diseno-ux',
  'asesoria'
);
