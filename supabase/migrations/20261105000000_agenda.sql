-- =============================================================================
-- NSC Garage: agenda de avaliações (Supabase / PostgreSQL)
--
-- Como usar: no painel do Supabase, abra SQL Editor, cole este arquivo inteiro
-- e clique em Run. Ele cria as tabelas, as regras de segurança e as funções
-- que o site chama. Pode ser rodado de novo sem perder dados.
--
-- Segurança (RNF-04):
-- * Ninguém lê ou grava as tabelas direto: o RLS está ligado e não há
--   políticas. Todo acesso passa pelas funções abaixo (security definer),
--   que aplicam as regras de negócio no servidor.
-- * O público só vê quais horários estão ocupados (sem nomes nem telefones),
--   agenda, e consulta os próprios agendamentos com telefone + protocolo.
-- * A agenda completa e as mudanças de situação exigem login de alguém da
--   tabela oficina_admins.
--
-- Regras de negócio (mantenha iguais a src/content/scheduling.ts):
-- RN-01 seg–sex 8h–18h, sáb 8h–12h, horários de 60 min · RN-02 um carro por
-- horário (índice único) · RN-03 antecedência de 2 h e janela de 30 dias ·
-- RN-04 cliente cancela até 24 h antes · RN-05 avaliação só de concluído,
-- uma vez, nota 1–5 · RN-06 transições do ciclo de vida · RN-07 protocolo.
-- Horários sempre no fuso da oficina (America/Sao_Paulo).
-- =============================================================================

-- ---------- Tabelas ----------------------------------------------------------

create table if not exists public.oficina_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.agendamentos (
  protocolo text primary key
    check (protocolo ~ '^NSC-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$'),
  servico text not null check (servico ~ '^[a-z][a-z-]{1,40}$'),
  dia date not null,
  horario time not null,
  cliente_nome text not null check (char_length(btrim(cliente_nome)) between 1 and 80),
  -- Só números, com DDD: celular (9 + 8 dígitos) ou fixo (2 a 5 + 7 dígitos).
  cliente_telefone text not null check (cliente_telefone ~ '^[1-9]{2}(9[0-9]{8}|[2-5][0-9]{7})$'),
  cliente_email text check (cliente_email is null or cliente_email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  carro_modelo text not null check (char_length(btrim(carro_modelo)) between 1 and 60),
  carro_ano text check (carro_ano is null or carro_ano ~ '^[0-9]{4}$'),
  observacoes text check (observacoes is null or char_length(observacoes) <= 500),
  status text not null default 'pendente'
    check (status in ('pendente', 'confirmado', 'concluido', 'cancelado')),
  nota smallint check (nota between 1 and 5),
  comentario text check (comentario is null or char_length(comentario) <= 500),
  avaliado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  -- RN-05: só atendimento concluído tem nota.
  constraint agendamentos_avaliacao_so_concluido check (nota is null or status = 'concluido')
);

-- RN-02 e RNF-06: um carro por horário. Dois pedidos simultâneos para o
-- mesmo horário nunca passam os dois: o segundo bate neste índice.
create unique index if not exists agendamentos_um_por_horario
  on public.agendamentos (dia, horario) where status <> 'cancelado';
create index if not exists agendamentos_por_telefone on public.agendamentos (cliente_telefone);

create table if not exists public.agendamento_historico (
  id bigint generated always as identity primary key,
  protocolo text not null references public.agendamentos (protocolo) on delete cascade,
  de text,
  para text not null,
  por text not null check (por in ('cliente', 'oficina')),
  em timestamptz not null default now()
);
create index if not exists agendamento_historico_por_protocolo
  on public.agendamento_historico (protocolo);

alter table public.oficina_admins enable row level security;
alter table public.agendamentos enable row level security;
alter table public.agendamento_historico enable row level security;
revoke all on public.oficina_admins, public.agendamentos, public.agendamento_historico
  from public, anon, authenticated;

-- ---------- Funções internas ---------------------------------------------------

-- Agora, no relógio da oficina.
create or replace function public.agora_oficina()
returns timestamp language sql stable
as $$ select (now() at time zone 'America/Sao_Paulo') $$;

-- RN-01 e RN-03: o horário existe na agenda e ainda pode ser escolhido?
create or replace function public.horario_valido(p_dia date, p_horario time)
returns boolean language plpgsql stable
as $$
declare
  abre time;
  fecha time;
begin
  case extract(isodow from p_dia)::int
    when 1, 2, 3, 4, 5 then abre := '08:00'; fecha := '18:00';
    when 6 then abre := '08:00'; fecha := '12:00';
    else return false; -- domingo
  end case;
  return extract(minute from p_horario) = 0
    and extract(second from p_horario) = 0
    and p_horario >= abre
    and p_horario + interval '60 minutes' <= fecha
    and (p_dia + p_horario) >= public.agora_oficina() + interval '2 hours'
    and p_dia <= public.agora_oficina()::date + 30;
end
$$;

-- RN-07: "NSC-" + 6 caracteres sem 0/O/1/I/L, de bytes aleatórios fortes.
create or replace function public.gerar_protocolo()
returns text language plpgsql volatile
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  bytes bytea := uuid_send(gen_random_uuid());
  codigo text := 'NSC-';
begin
  for i in 0..5 loop
    codigo := codigo || substr(alfabeto, 1 + (get_byte(bytes, i) % length(alfabeto)), 1);
  end loop;
  return codigo;
end
$$;

-- O agendamento no formato que o site usa (tipos em domain/types.ts).
create or replace function public.agendamento_json(a public.agendamentos)
returns jsonb language sql stable
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'protocol', a.protocolo,
    'serviceId', a.servico,
    'date', to_char(a.dia, 'YYYY-MM-DD'),
    'time', to_char(a.horario, 'HH24:MI'),
    'customer', jsonb_build_object(
      'name', a.cliente_nome, 'phone', a.cliente_telefone, 'email', a.cliente_email),
    'vehicle', jsonb_build_object('model', a.carro_modelo, 'year', a.carro_ano),
    'notes', a.observacoes,
    'status', a.status,
    'rating', case when a.nota is null then null else jsonb_build_object(
      'score', a.nota, 'comment', a.comentario, 'ratedAt', a.avaliado_em) end,
    'createdAt', a.criado_em,
    'updatedAt', a.atualizado_em,
    'history', coalesce((
      select jsonb_agg(jsonb_build_object('from', h.de, 'to', h.para, 'by', h.por, 'at', h.em)
                       order by h.id)
      from public.agendamento_historico h where h.protocolo = a.protocolo), '[]'::jsonb)
  ))
$$;

-- Quem está logado faz parte da oficina?
create or replace function public.e_oficina()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.oficina_admins where user_id = auth.uid()) $$;

-- ---------- Funções públicas (site) ------------------------------------------

-- RF-014: horários ocupados num período, sem nenhum dado pessoal.
create or replace function public.agenda_ocupada(p_de date, p_ate date)
returns table (dia date, horario time)
language sql stable security definer set search_path = public
as $$
  select a.dia, a.horario from public.agendamentos a
  where a.status <> 'cancelado'
    and a.dia between p_de and least(p_ate, p_de + 62)
$$;

-- UC-12 Agendar Serviço: valida no servidor, grava pendente e devolve com protocolo.
create or replace function public.agendar(
  p_servico text, p_dia date, p_horario time, p_nome text, p_telefone text,
  p_email text, p_carro text, p_ano text, p_observacoes text)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  novo public.agendamentos;
begin
  if not public.horario_valido(p_dia, p_horario) then
    raise exception 'horario-indisponivel';
  end if;
  for tentativa in 1..5 loop
    begin
      insert into public.agendamentos (
        protocolo, servico, dia, horario, cliente_nome, cliente_telefone, cliente_email,
        carro_modelo, carro_ano, observacoes)
      values (
        public.gerar_protocolo(), p_servico, p_dia, p_horario, btrim(p_nome), p_telefone,
        nullif(btrim(coalesce(p_email, '')), ''), btrim(p_carro),
        nullif(btrim(coalesce(p_ano, '')), ''), nullif(btrim(coalesce(p_observacoes, '')), ''))
      returning * into novo;
      exit;
    exception
      when unique_violation then
        -- Horário tomado por outro pedido (RNF-06) ou, muito raro, protocolo repetido.
        if exists (select 1 from public.agendamentos
                   where dia = p_dia and horario = p_horario and status <> 'cancelado') then
          raise exception 'horario-indisponivel';
        end if;
      when check_violation then
        raise exception 'dados-invalidos';
    end;
  end loop;
  if novo.protocolo is null then
    raise exception 'horario-indisponivel';
  end if;
  insert into public.agendamento_historico (protocolo, de, para, por)
    values (novo.protocolo, null, 'pendente', 'cliente');
  return public.agendamento_json(novo);
end
$$;

-- UC-18 Consultar Histórico: telefone + protocolo liberam os agendamentos do telefone.
create or replace function public.meus_agendamentos(p_telefone text, p_protocolo text)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.agendamentos
                 where protocolo = p_protocolo and cliente_telefone = p_telefone) then
    raise exception 'nao-encontrado';
  end if;
  return coalesce((
    select jsonb_agg(public.agendamento_json(a) order by a.dia desc, a.horario desc)
    from public.agendamentos a where a.cliente_telefone = p_telefone), '[]'::jsonb);
end
$$;

-- UC-16 Cancelar Agendamento (RN-04).
create or replace function public.cancelar_agendamento(p_protocolo text, p_telefone text)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  atual public.agendamentos;
begin
  select * into atual from public.agendamentos
    where protocolo = p_protocolo and cliente_telefone = p_telefone for update;
  if not found then
    raise exception 'nao-encontrado';
  end if;
  if atual.status not in ('pendente', 'confirmado')
     or (atual.dia + atual.horario) < public.agora_oficina() + interval '24 hours' then
    raise exception 'cancelamento-nao-permitido';
  end if;
  insert into public.agendamento_historico (protocolo, de, para, por)
    values (p_protocolo, atual.status, 'cancelado', 'cliente');
  update public.agendamentos set status = 'cancelado', atualizado_em = now()
    where protocolo = p_protocolo returning * into atual;
  return public.agendamento_json(atual);
end
$$;

-- UC-19 Avaliar Atendimento (RN-05).
create or replace function public.avaliar_agendamento(
  p_protocolo text, p_telefone text, p_nota int, p_comentario text)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  atual public.agendamentos;
begin
  select * into atual from public.agendamentos
    where protocolo = p_protocolo and cliente_telefone = p_telefone for update;
  if not found then
    raise exception 'nao-encontrado';
  end if;
  if atual.status <> 'concluido' or atual.nota is not null or p_nota not between 1 and 5 then
    raise exception 'avaliacao-nao-permitida';
  end if;
  update public.agendamentos
    set nota = p_nota, comentario = nullif(btrim(coalesce(p_comentario, '')), ''),
        avaliado_em = now(), atualizado_em = now()
    where protocolo = p_protocolo returning * into atual;
  return public.agendamento_json(atual);
end
$$;

-- ---------- Funções da oficina (exigem login) ----------------------------------

-- UC-17: a agenda inteira, em ordem de dia e horário.
create or replace function public.agenda_completa()
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.e_oficina() then
    raise exception 'acesso-negado';
  end if;
  return coalesce((
    select jsonb_agg(public.agendamento_json(a) order by a.dia, a.horario)
    from public.agendamentos a), '[]'::jsonb);
end
$$;

-- UC-17: confirmar, concluir ou cancelar, só pelas transições do RN-06.
create or replace function public.mudar_status(p_protocolo text, p_para text)
returns jsonb
language plpgsql volatile security definer set search_path = public
as $$
declare
  atual public.agendamentos;
begin
  if not public.e_oficina() then
    raise exception 'acesso-negado';
  end if;
  select * into atual from public.agendamentos where protocolo = p_protocolo for update;
  if not found then
    raise exception 'nao-encontrado';
  end if;
  if not ((atual.status = 'pendente' and p_para in ('confirmado', 'cancelado'))
       or (atual.status = 'confirmado' and p_para in ('concluido', 'cancelado'))) then
    raise exception 'transicao-invalida';
  end if;
  insert into public.agendamento_historico (protocolo, de, para, por)
    values (p_protocolo, atual.status, p_para, 'oficina');
  update public.agendamentos set status = p_para, atualizado_em = now()
    where protocolo = p_protocolo returning * into atual;
  return public.agendamento_json(atual);
end
$$;

-- ---------- Permissões ----------------------------------------------------------

revoke all on all functions in schema public from public;
grant execute on function
  public.agenda_ocupada(date, date),
  public.agendar(text, date, time, text, text, text, text, text, text),
  public.meus_agendamentos(text, text),
  public.cancelar_agendamento(text, text),
  public.avaliar_agendamento(text, text, int, text)
  to anon, authenticated;
grant execute on function
  public.agenda_completa(),
  public.mudar_status(text, text),
  public.e_oficina()
  to authenticated;
