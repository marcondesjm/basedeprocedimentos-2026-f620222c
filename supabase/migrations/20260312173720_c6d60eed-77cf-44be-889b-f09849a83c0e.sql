create or replace function public.sync_changelog_from_app_config()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  version_raw text;
  normalized_version text;
  build_ts_raw text;
  parsed_build_ts timestamptz;
  release_ts timestamptz;
  existing_row_id uuid;
  default_changes text[] := array['Atualização automática registrada nesta build.'];
begin
  if NEW.key is distinct from 'current_version' then
    return NEW;
  end if;

  version_raw := btrim(split_part(coalesce(NEW.value, ''), '|', 1));
  if version_raw = '' then
    return NEW;
  end if;

  normalized_version := 'v' || regexp_replace(version_raw, '^v', '', 'i');

  build_ts_raw := nullif(btrim(split_part(coalesce(NEW.value, ''), '|', 2)), '');
  parsed_build_ts := null;

  if build_ts_raw is not null then
    begin
      parsed_build_ts := build_ts_raw::timestamptz;
    exception when others then
      parsed_build_ts := null;
    end;
  end if;

  release_ts := coalesce(parsed_build_ts, NEW.updated_at, now());

  select id
    into existing_row_id
  from public.changelog_versions
  where version = normalized_version
  order by release_date desc, created_at desc
  limit 1;

  if existing_row_id is null then
    insert into public.changelog_versions (version, release_date, changes)
    values (normalized_version, release_ts, default_changes);
  else
    update public.changelog_versions
    set
      release_date = greatest(coalesce(release_date, release_ts), release_ts),
      changes = case
        when coalesce(array_length(changes, 1), 0) = 0 then default_changes
        else changes
      end
    where id = existing_row_id;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_sync_changelog_from_app_config on public.app_config;
create trigger trg_sync_changelog_from_app_config
after insert or update on public.app_config
for each row
execute function public.sync_changelog_from_app_config();

with target as (
  select id
  from public.changelog_versions
  where version = 'v2.9.3'
  order by release_date desc, created_at desc
  limit 1
)
update public.changelog_versions cv
set
  release_date = now(),
  changes = (
    select array_agg(distinct item)
    from unnest(
      coalesce(cv.changes, '{}'::text[]) ||
      array[
        'Correção: aviso de nova sessão não dispara ao minimizar/reabrir o app.',
        'Alerta aos 40 minutos com notificação em segundo plano e vibração no celular.'
      ]::text[]
    ) as item
  )
where cv.id in (select id from target);

insert into public.changelog_versions (version, release_date, changes)
select
  'v2.9.3',
  now(),
  array[
    'Correção: aviso de nova sessão não dispara ao minimizar/reabrir o app.',
    'Alerta aos 40 minutos com notificação em segundo plano e vibração no celular.'
  ]::text[]
where not exists (
  select 1 from public.changelog_versions where version = 'v2.9.3'
);