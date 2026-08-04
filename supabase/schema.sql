-- La obra — esquema de sincronización
--
-- Pégalo entero en el SQL Editor de Supabase y dale a Run. Se puede volver a
-- ejecutar sin romper nada.
--
-- Una fila por persona con todos sus datos en un jsonb. No hay tablas por
-- entidad a propósito: la app ya trata sus datos como un bloque (es lo que
-- exporta el .json), y partirlo en siete tablas solo añadiría trabajo sin
-- comprar nada mientras no haya varias personas editando a la vez.

create table if not exists public.obra (
  usuario uuid primary key references auth.users (id) on delete cascade,
  datos jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);

-- La marca la pone el servidor, no el móvil: dos aparatos con la hora
-- descuadrada darían marcas incoherentes y la sincronización decidiría mal.
create or replace function public.marcar_actualizado()
returns trigger
language plpgsql
as $$
begin
  new.actualizado = now();
  return new;
end;
$$;

drop trigger if exists obra_marcar_actualizado on public.obra;
create trigger obra_marcar_actualizado
  before insert or update on public.obra
  for each row execute function public.marcar_actualizado();

-- Sin esto, cualquiera con la clave pública leería los datos de cualquiera.
alter table public.obra enable row level security;

drop policy if exists "cada uno ve lo suyo" on public.obra;
create policy "cada uno ve lo suyo"
  on public.obra
  for all
  to authenticated
  using (auth.uid() = usuario)
  with check (auth.uid() = usuario);
