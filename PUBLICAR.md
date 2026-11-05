# Como colocar o site da NSC Garage no ar

Este guia leva o site do computador para o domínio da oficina, com o agendamento gravando num banco
de dados de verdade. São três peças, todas com plano gratuito:

| Peça          | Para quê                                                   | Serviço sugerido  |
| ------------- | ---------------------------------------------------------- | ----------------- |
| Banco e login | Guardar os agendamentos e deixar só a oficina entrar       | Supabase          |
| Hospedagem    | Servir os arquivos do site (o `dist/`) com HTTPS           | Cloudflare Pages  |
| Domínio       | O endereço `seudominio.com.br` apontando para a hospedagem | onde você comprou |

Tempo estimado: uma hora, mais a espera do DNS (de minutos a algumas horas).

> **Sem o banco o site também funciona**, em modo de demonstração: os agendamentos ficam só no
> navegador de quem usa e a oficina não os vê. Serve para a apresentação, não para atender clientes.
> O site escolhe o modo sozinho: com as duas variáveis do passo 2 no build, usa o Supabase.

---

## Antes de começar

- [ ] Número do WhatsApp da oficina em `contact.whatsapp` (`src/content/site.ts`), no formato
      `55` + DDD + número, só dígitos (exemplo: `5513987654321`). Hoje está `5500000000000`.
- [ ] Horário de atendimento em `contact.hours` (`src/content/site.ts`) e as mesmas horas na agenda
      (`src/content/scheduling.ts`). Se mudar a agenda, mude também a função `horario_valido` na
      migração do banco: as duas precisam dizer a mesma coisa.
- [ ] Texto do aviso de privacidade revisado pela oficina (`src/pages/PrivacyPage.tsx`): prazo de
      guarda dos dados e quem atende os pedidos.
- [ ] Autorização para as fotos da Trajetória (são de terceiros, com crédito) ou troca pelo acervo
      da NSC em `src/assets/images/history/`.
- [ ] Conferir os marcos 14 (Endurance, uma fonte só) e 15 (Recife: o texto fala de um evento futuro
      e precisa mudar de tempo depois que ele acontecer) em `src/content/milestones.ts`.
- [ ] Node.js 20 ou mais novo no computador que vai gerar o site.

---

## 1. Banco de dados (Supabase)

1. Crie uma conta em [supabase.com](https://supabase.com) e um projeto novo (**New project**):
   - nome: `nsc-garage`;
   - região: **South America (São Paulo)**, para o site responder rápido;
   - senha do banco: gere uma forte e guarde num gerenciador de senhas. O site não usa essa senha.
2. Abra **SQL Editor → New query**, cole todo o conteúdo de
   `supabase/migrations/20261105000000_agenda.sql` e clique em **Run**. Deve aparecer "Success". A
   migração cria as tabelas, trava o acesso direto a elas e cria as funções que o site chama. Pode
   rodar de novo sem estragar nada.
3. Desligue o cadastro aberto: **Authentication → Sign In / Providers** e desmarque **Allow new
   users to sign up**. Só quem você criar consegue entrar.
4. Crie o login da oficina: **Authentication → Users → Add user → Create new user**, com o e-mail
   da oficina, uma senha forte e **Auto Confirm User** marcado.
5. Diga ao banco que esse login é da equipe. No **SQL Editor**, rode (troque o e-mail):

   ```sql
   insert into public.oficina_admins (user_id)
   select id from auth.users where email = 'contato@nscgarage.com.br';
   ```

   Repita os passos 4 e 5 para cada pessoa da equipe. Para tirar alguém:
   `delete from public.oficina_admins where user_id = (select id from auth.users where email = '…');`

6. Copie os dois dados de conexão (botão **Connect** no topo do projeto, ou **Project Settings →
   API Keys**):
   - **Project URL**, como `https://abcdefgh.supabase.co`;
   - a chave pública: **anon** (ou **publishable**, que começa com `sb_publishable_`).

   **Nunca** use a chave `service_role` (ou `secret`) no site: ela ignora todas as travas do banco.

### O que protege os dados

- As tabelas têm RLS ligado e nenhuma permissão direta: nem visitante nem login lê ou altera uma
  linha sozinho.
- Tudo passa por funções do banco que conferem as regras de novo (horário válido, 24 h para
  cancelar, uma avaliação por atendimento, transições permitidas). O navegador valida antes só para
  avisar mais rápido.
- Quem visita só vê **quais horários estão ocupados**, sem nome nem telefone.
- Consultar, cancelar e avaliar exigem protocolo **e** o telefone usado no agendamento.
- A agenda completa e a mudança de situação só respondem para quem está em `oficina_admins`.
- Dois pedidos para o mesmo horário: o banco tem um índice único por dia e hora dos agendamentos
  ativos, e o segundo é recusado (RNF-06).

Os testes em `supabase/` rodam esse mesmo SQL num PostgreSQL de verdade (PGlite) a cada `npm test`.

---

## 2. Gerar o site com o banco ligado

Na pasta do projeto:

```bash
cp .env.example .env
```

Abra o `.env` e cole a URL e a chave do passo 1.6. Depois:

```bash
npm ci
```

```bash
npm run build
```

O site final fica em `dist/`. Para conferir antes de publicar:

```bash
npm run preview
```

Abra o endereço que aparecer, faça um agendamento de teste e entre em `#/painel` com o e-mail e a
senha do passo 1.4. O agendamento tem que aparecer na agenda. Se aparecer "Não foi possível falar
com a agenda", confira a URL e a chave no `.env` e gere o build de novo (as variáveis entram no
momento do build).

> O `.env` está no `.gitignore` e não vai para o repositório. A chave anon vai dentro do site
> publicado de qualquer jeito (é pública por natureza); o que não pode vazar é a `service_role`.

---

## 3. Hospedagem (Cloudflare Pages)

1. Crie uma conta gratuita em [cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages → Create → Pages → Upload assets** (envio direto).
3. Nome do projeto: `nsc-garage`. Arraste a pasta `dist/` inteira e clique em **Deploy**.
4. Em um minuto o site abre em `https://nsc-garage.pages.dev`. Teste tudo lá antes do domínio.

O arquivo `public/_headers` (copiado para `dist/`) liga cabeçalhos de segurança e o cache longo dos
arquivos com hash. Como a navegação usa `#/`, não é preciso nenhuma regra de redirecionamento.

**Alternativa: Netlify.** Em [app.netlify.com/drop](https://app.netlify.com/drop), arraste a pasta
`dist/`. Lê o mesmo `_headers`.

**Mais tarde, publicação automática:** ligue a hospedagem ao repositório no GitHub (comando de build
`npm run build`, pasta `dist`, e as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas
configurações do projeto). Cada envio para a branch principal publica sozinho.

---

## 4. Apontar o domínio

### Se o domínio é `.com.br` (Registro.br) ou de outro registrador, com Cloudflare Pages

O jeito mais simples é deixar a Cloudflare cuidar do DNS:

1. No painel da Cloudflare, **Add a domain** (plano Free) e digite o seu domínio. Ela importa os
   registros que já existem.
2. **Atenção ao e-mail:** se o domínio já tem e-mail (Google Workspace, Hostinger, Zoho…), confira
   se os registros `MX` e `TXT` foram importados. Sem eles o e-mail para de chegar.
3. A Cloudflare mostra dois servidores de nome, como `ana.ns.cloudflare.com`. No Registro.br:
   **Painel → o domínio → DNS → Alterar servidores DNS**, cole os dois e salve. Em outros
   registradores o nome é parecido ("Nameservers" ou "Servidores DNS").
4. Quando a Cloudflare disser que o domínio está ativo, volte ao projeto do Pages: **Custom domains →
   Set up a custom domain**, adicione `seudominio.com.br` e depois `www.seudominio.com.br`.
5. O HTTPS é emitido sozinho, em alguns minutos.

### Com Netlify, mantendo o DNS onde está

No Netlify: **Domain management → Add a domain**. No painel do registrador, crie:

| Tipo  | Nome  | Valor                  |
| ----- | ----- | ---------------------- |
| A     | `@`   | `75.2.60.5`            |
| CNAME | `www` | `seu-site.netlify.app` |

---

## 5. Depois de publicar

- [ ] No domínio, faça o ciclo completo: agendar, ver no painel, confirmar, "Avisar cliente pelo
      WhatsApp", consultar em "Meus agendamentos", cancelar outro e avaliar um concluído.
- [ ] Abra no celular e teste o painel de acessibilidade (texto 150%, alto contraste, reduzir
      movimento).
- [ ] Apague os agendamentos de teste. No SQL Editor:
      `delete from public.agendamentos where cliente_telefone = 'SEU_TELEFONE_DE_TESTE';`
      (o histórico vai junto).
- [ ] No Supabase, **Authentication → URL Configuration**, ponha o domínio em **Site URL**.

### Cuidados no plano gratuito

- **Projeto pausado:** o Supabase pausa projetos gratuitos que ficam cerca de uma semana sem uso.
  O site mostra "Não foi possível falar com a agenda"; basta abrir o projeto no painel e clicar em
  **Restore**. Para uma oficina com clientes de verdade, o plano pago evita isso.
- **Cópia dos dados:** o plano gratuito não guarda backups para baixar. De vez em quando, exporte a
  tabela `agendamentos` em **Table Editor → Export to CSV**.
- **Pedidos falsos:** qualquer pessoa pode agendar sem login (é o que a oficina quer). Se aparecer
  abuso, os próximos passos são um desafio anti-robô (Cloudflare Turnstile) e um limite de pedidos
  por telefone no banco.

---

## 6. Atualizar o site depois

- **Texto, foto ou visual:** edite, rode `npm run build` e envie a nova pasta `dist/` (no Pages:
  **Create deployment** no projeto). As versões antigas ficam guardadas e dá para voltar com um
  clique.
- **Regra da agenda:** mude no domínio (`src/features/scheduling/domain/` e
  `src/content/scheduling.ts`) **e** numa migração nova em `supabase/migrations/`, rodada no SQL
  Editor. Rode `npm test`: os testes do banco mostram se os dois lados ainda concordam.

## Problemas comuns

| Sintoma                                 | Causa provável e solução                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| "Não foi possível falar com a agenda"   | URL ou chave erradas no build, ou projeto pausado no Supabase                         |
| O site diz "versão de demonstração"     | O build foi gerado sem o `.env`. Gere de novo com as duas variáveis                   |
| "Este usuário não tem acesso ao painel" | O usuário não está em `oficina_admins` (passo 1.5)                                    |
| Horários de hoje somem antes da hora    | O banco usa o horário de Brasília (`America/Sao_Paulo`) e 2 h de antecedência (RN-03) |
| Domínio não abre depois de horas        | Confira os servidores DNS no registrador e se o domínio está "Active" na Cloudflare   |
