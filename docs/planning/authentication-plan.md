# Planejamento: Autenticação do Boia

**Projeto:** Boia (clone do Boia.space)
**Data:** 2026-11-24
**Documento relacionado:** `runware-integration-plan.md`
**Objetivo:** Implementar autenticação real (login/cadastro) com sessão persistente, habilitando multiusuário e tornândp possível o BYOK seguro (chave Runware criptografada por usuário).

---

## 1. Contexto: por que autenticação agora

O plano de integração Runware decidiu pela **Opção 3 (BYOK multiusuário)**. Isso exige responder à pergunta: *de quem é esta chave Runware?* Sem identidade do usuário, não há como:

- Amarrar uma chave a uma pessoa
- Impedir que um usuário leia as gerações de outro
- Auditar quem gastou o quê
- Decidir se a geração sai da conta do servidor ou da conta do usuário

Além disso, o app hoje é uma SPA local com **todos os dados em `useState`** (gerações, projetos, elementos). Sem servidor, não há multiusuário possível.

**Pré-requisito:** a integração Runware (Fases 1-4) deve vir **antes** ou **junto** da auth, porque é a auth que torna o proxy seguro. A ordem está definida na §7.

---

## 2. Restrições do projeto (verificadas no código)

Este é **Next.js 16.4.6** com **Cache Components habilitado**. Isso muda regrastradicionais:

```ts
// next.config.ts (já existente)
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // ...
};
```

### 2.1 Consequências diretas

| Regra | Implicação para a auth |
|---|---|
| `cookies()` só pode ser lido **dentro de `<Suspense>`** | A UI autenticada (header com avatar, saldo) precisa ficar atrás de uma boundary. Fora dela, é **erro de build**. |
| `use cache` (público) **não pode** ler `cookies()` | Dados da sessão não podem ser cacheados no servidor com `use cache` puro |
| `use cache: private` **pode** ler `cookies()` | Solução para ler a sessão com cache — mas o resultado fica **só no browser**, nunca no servidor |
| `use cache` aceita `userId` como argumento | Para cachear no servidor, extraia o `userId` e passe como argumento |
| `redirect()` dentro de `use cache: private` | Funciona — o `redirect` lança e não é cacheado |
| `middleware.ts` → **deprecado**, agora é `proxy.ts` | Usar `src/proxy.ts` |
| `export const instant = false` | escape para rotas que ainda não seguem as regras de cache |

### 2.2 O problema do `src/app/page.tsx` atual

O arquivo é `"use client"` com 471 linhas, todo o estado da aplicação dentro dele. Isso **impede** a leitura de sessão no servidor.

**Duas opções:**

**Opção A — Manter tudo client-side, proteger só as rotas API**
- A página continua `"use client"`
- A sessão é verificada **apenas** nas Route Handlers (`/api/runware/*`)
- O client busca o estado do usuário via `GET /api/auth/me`
- **Prós:** mudança mínima, não quebra o layout existente, mais rápido de implementar
- **Contras:** a página renderiza antes de saber se o usuário está logado → flash de conteúdo não-autenticado; cache components fica meio inerte

**Opção B — Migrar para Server Components com boundary**
- `src/app/page.tsx` vira Server Component
- Estado da UI (aba ativa, sidebar, composer) migra para Client Component filho
- Leitura de sessão no servidor, atrás de `<Suspense>`
- **Prós:** padrão idiomático do Next 16, melhor com cache components, sem flash
- **Contras:** refatoração grande do arquivo mais crítico do app

**Recomendação: Opção A como passo 1, migrar para B depois.** O plano de integração Runware já vai exigir mexer no `page.tsx`; fazer as duas coisas de uma vez aumenta o risco. A Opção A entrega multiusuário funcional; a B é otimização de performance/UX.

---

## 3. Decisões de arquitetura

### Decisão A — Biblioteca de auth: **Better Auth**

Comparação com as alternativas disponíveis:

| Lib | Versão | Prós | Contras |
|---|---|---|---|
| **Better Auth** | 1.7.28 | TypeScript-first, self-hosted, schema via Drizzle, funciona com qualquer DB, session cookie gerenciada, **plugins para API keys** | Mais novo que Auth.js |
| Auth.js / NextAuth v5 | 4.24.15 | Maduro, muito exemplo | v5 em beta há anos, `next-auth` v4 é a estável mas é para Pages Router |
| Clerk | 7.10.9 | Zero config, UI pronta | SaaS, dependency de terceiros, cobra |
| Supabase | — | Completo | Precisa de projeto Supabase, vendor lock-in |
| Auth0 | — | Corporativo | SaaS, caro |
| **Custom (iron-session + bcrypt)** | — | Zero dependency, controle total | Mais código, mais risco de erro, sem social login |

**Escolhido: Better Auth.** Motivos:
- É **self-hosted** — a sessão e os usuários ficam no nosso banco, sem vendor
- Schema gerenciado (Drizzle), sem SQL manual
- Tem plugin de **API key** — útil para futuro: o app poderia gerar uma chave de API própria para o usuário consumir
- TypeScript-first, encaixa bem com o resto do projeto
- `better-auth@1.7.28` é a versão `latest` estável

**Alternativa de menor escopo, se o tempo apertar:** `iron-session` + `bcrypt` + tabelas próprias (o Next.js 16 docs usa exatamente `iron-session` como exemplo). ~150 linhas a mais de código, mas zero dependência externa de auth. Manter como **plano B**.

### Decisão B — Banco de dados

O app precisa de persistência para: usuários, sessões, chaves Runware criptografadas, gerações, projetos, elementos.

| Opção | Quando usar |
|---|---|
| **PostgreSQL (Neon/Supabase)** | **Recomendado.** Servidor Postgres gerenciado, conexão via `postgres` (driver puro JS, edge-compatible). Neon tem free tier generoso. |
| SQLite local | Só para dev. Não escala para multiusuário e complica deploy. |
| Vercel Postgres | Depreciado — a Vercel migrou para Neon/Supabase |

**Escolhido: PostgreSQL via Neon**, acessado com `postgres` (driver puro, sem binário nativo — evita dor de cabeça em serverless).

**ORM: Drizzle ORM** (`drizzle-orm@0.45.4`). Tipado, leve, e o Better Auth tem integração oficial via `drizzleAdapter`.

> **Nota:** a conexão com o banco **não** deve usar `use cache` com o mesmo lifecycle do catálogo público. Dados do usuário vão em funções separadas com tag por `userId`.

### Decisão C — Onde a chave Runware fica

Requisito: a chave do usuário nunca pode ser lida pelo browser, nem em trânsito além do necessário.

```
┌─────────────┐   POST /api/runware/generate    ┌──────────────────┐
│   Browser   │ ───────────────────────────────> │  Next.js server  │
│  (sem chave)│                                  │                  │
└─────────────┘                                  │  1. verifySession│
                                                 │  2. decrypt key  │
                                                 │     (AES-256-GCM)│
                                                 │  3. call Runware │
                                                 └────────┬─────────┘
                                                          │ Bearer key
                                                          v
                                                 api.runware.ai
```

**Criptografia:** AES-256-GCM, chave mestra em `RUNWARE_ENCRYPTION_KEY` (env var, 32 bytes). O IV aleatório é armazenado junto ao ciphertext. Autenticado (GCM) → detecta adulteração.

**Por que não guardar em texto plano?** Um dump do banco expõe todas as chaves. Com criptografia, o dump expõe apenas ciphertext inútil sem a env var.

**Formatos de chave da Runware** (verificar ao implementar): `rw_live_...`, `rw_test_...`. Validar com regex antes de salvar, para pegar erro de digitação antes de gravar.

### Decisão D — Sessão: cookie httpOnly + banco

**Database sessions** (não stateless), conforme a doc do Next.js:
- O cookie guarda **apenas um ID de sessão cifrado**
- Os dados da sessão ficam no banco
- Permite: revogar sessões, "sair de todos os dispositivos", auditar último uso
- O Better Auth gerencia isso nativamente

**Configuração do cookie:**
```ts
{
  httpOnly: true,       // JS não acessa
  secure: true,         // só https
  sameSite: "lax",      // padrão; "strict" se possível
  path: "/",
  maxAge: 30 * 24 * 60 * 60,  // 30 dias
}
```

**Por que httpOnly é crítico aqui:** com `localStorage` (como está hoje), qualquer XSS lê a chave Runware. Com cookie httpOnly, o XSS **não** consegue ler o cookie — mas ainda pode fazer requisições autenticadas. Por isso: **CSP + sanitização de prompt** são necessários de qualquer forma (o prompt do usuário vai para a Runware).

### Decisão E — Rotas protegidas: `proxy.ts` + DAL

**Duas camadas, como manda a doc:**

1. **`src/proxy.ts`** (substitui `middleware.ts` no Next 16) — *checagem otimista*
   - Só lê o cookie (sem hit no banco) → rápido
   - Redireciona para `/login` se não houver sessão
   - É a **primeira** barreira, não a única

2. **DAL (`src/lib/dal.ts`)** — *checagem segura*
   - `verifySession()` valida a sessão no banco
   - Chamado **dentro** de cada Route Handler, Server Action e DAL function
   - É a barreira real

> A doc é explícita: *"Proxy should not be your only line of defense"*.

**Matcher do proxy (cuidado — o guia avisa):**
```ts
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```
Sem o negative match, o proxy roda em todo request e bloqueia CSS/JS/imagens.

**Exceção importante:** as rotas `/api/runware/*` **precisam** passar pelo proxy para pegar o 401 padronizado, mas a verificação real acontece no handler. Alternativa: deixar `/api/*` fora do matcher e proteger cada handler via DAL. **Recomendação:** deixar `/api/*` **fora** do matcher (evita que o proxy e a DAL fiquem duplicados) e proteger cada handler explicitamente.

### Decisão F — Cache Components: o padrão correto

Seguindo `authentication-with-cache-components.md`:

```ts
// src/lib/session.ts
import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  // Better Auth provides its own session helper
  return auth.api.getSession({ headers: cookieStore });
});
```

```ts
// src/lib/dal.ts
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  return { userId: session.user.id, user: session.user };
});
```

**Ponto crucial:** `cache()` do React deduplica **dentro de um render pass**. Em Server Actions e Route Handlers não funciona (não são render pass) — ali cada chamada roda. Isso é aceitável: são operações de leitura rápida.

**`use cache: private`** — usar onde fizer sentido:
```ts
// src/lib/dal.ts
export async function getCurrentUser() {
  "use cache: private";
  cacheLife({ stale: 60 });
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return { id: session.user.id, name: session.user.name };
}
```
Cuidado: `use cache: private` guarda o resultado **só no browser**. Para dados que precisam ficar no servidor (ex.: o saldo Runware do usuário), extraia o `userId` e passe para um `use cache` normal com `cacheTag`.

**Nunca** colocar `email`, `apiKey` ou PII em `cacheTag` — as tags são gravadas em texto plano.

### Decisão G — `export const instant = false`

O guia de migração recomenda aplicar isso nas rotas que ainda não seguem as regras de cache, para o build passar e ir convertendo aos poucos.

**Aplicar em:** `src/app/page.tsx` (que é `"use client"` com `Math.random()` no `handleGenerate` — **`Math.random()` durante prerender é erro de build** que o `instant = false` **não** resolve).

> **Atenção — isso é um problema já existente, não de auth:** `page.tsx` linha 208 tem `seed: Math.floor(Math.random() * 99999999)` dentro do `handleGenerate`, que roda no client, então está OK. Mas `INITIAL_GENERATIONS` etc. são estáticos. Vou verificar no momento da implementação com `next build`.

---

## 4. Esquema de dados

### 4.1 Tabelas de auth (geradas pelo Better Auth)

```ts
// src/lib/db/schema.ts (gerado/gerenciado pelo Better Auth)
user: {
  id, name, email, emailVerified, image,
  createdAt, updatedAt
}

session: {
  id, userId, token, expiresAt, ipAddress, userAgent
}

account: {          // provedores OAuth (futuro)
  id, userId, accountId, providerId, accessToken, refreshToken, ...
}

verification: {     // magic link, reset de senha
  id, identifier, value, expiresAt
}
```

### 4.2 Tabelas do domínio

```ts
runwareCredential: {
  id,
  userId,              // FK → user.id, UNIQUE
  encryptedKey,        // ciphertext AES-256-GCM
  iv,                  // 12 bytes, base64
  keyHint,             // últimos 4 chars, para UI ("...a3f9")
  status: "active" | "invalid" | "disabled",
  lastValidatedAt,
  createdAt, updatedAt
}

generation: {
  id, userId, projectId?, modelId, modelAir,
  prompt, negativePrompt?,
  type: "image" | "video",
  imageUrl?, videoUrl?,
  cost, costBrl, seed,
  dimensions?, aspectRatio?, quality?,
  status: "processing" | "ready" | "failed",
  taskUUID,              // ← para consultar o status no Runware
  isFavorite, createdAt, updatedAt
}

project: {
  id, userId, name, isPrivate, coverUrl?, createdAt, updatedAt
}

element: {
  id, userId, name, version, handle, kind, status,
  triggerTag, avatarUrl?, description?, createdAt, updatedAt
}

elementImage: {
  id, elementId, originalUrl, thumbUrl?, createdAt
}
```

> **Nota sobre `element` e `elementImage`:** os elementos do app (Rapaz, Feirante, etc.) são Currently mockados com URLs do Unsplash. Ao persistir, as imagens devem ir para o **media storage da Runware** ou um storage próprio (Fase 5 do plano de integração). Por enquanto, guardar a URL.

### 4.3 Onde cada tabela é acessada

**Regra da doc de Data Security:** *"only the Data Access Layer should access `process.env`"* e *"database packages and environment variables are not imported outside the Data Access Layer"*.

```
src/lib/db/index.ts      → conexão (server-only)
src/lib/db/schema.ts     → tabelas
src/lib/dal.ts           → ÚNICO lugar que importa db + verifica sessão
src/lib/runware/*.ts     → client Runware (server-only)
src/app/api/**/route.ts  → chama a DAL, nunca importa db direto
```

---

## 5. Estrutura de arquivos

```
src/
├── proxy.ts                          # ← NOVO (substitui middleware.ts)
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx                # layout limpo, sem a sidebar do app
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (app)/
│   │   └── layout.tsx                # ← shell autenticado (Sidebar + header)
│   ├── login/page.tsx                # redirect → (auth)/login
│   ├── signup/page.tsx
│   └── api/
│       ├── auth/[...all]/route.ts    # ← handler do Better Auth
│       ├── auth/session/route.ts     # GET me / DELETE logout
│       ├── runware/
│       │   ├── models/route.ts
│       │   ├── schemas/[id]/route.ts
│       │   ├── account/route.ts
│       │   ├── credential/route.ts   # POST salvar chave / DELETE remover
│       │   └── generate/route.ts
│       ├── generations/route.ts
│       ├── projects/route.ts
│       └── elements/route.ts
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx             # 'use client' + useActionState
│   │   ├── SignupForm.tsx
│   │   └── UserMenu.tsx              # avatar + logout
│   └── ...
└── lib/
    ├── auth.ts                       # ← instância do Better Auth (server-only)
    ├── auth-client.ts                # ← client-side hooks (não server-only!)
    ├── dal.ts                        # ← verifySession + queries (server-only)
    ├── db/
    │   ├── index.ts
    │   └── schema.ts
    ├── crypto.ts                     # ← AES-256-GCM (server-only)
    ├── validation.ts                 # ← schemas zod
    └── runware/
        ├── client.ts
        ├── catalog.ts
        └── generate.ts
```

**Ponto crítico: `auth-client.ts` vs `auth.ts`.** O `auth.ts` (instância do servidor) **não** pode ser importado por Client Components. O `auth-client.ts` é um módulo separado e leve. Misturar os dois causa vazamento de segredo.

---

## 6. Fluxos de autenticação

### 6.1 Cadastro

```
1. Usuário preenche nome/email/senha no <SignupForm>
2. form action → Server Action (signup)
3. Server Action valida com Zod (name ≥ 2, email válido, senha ≥ 8 + 1 letra + 1 número + 1 especial)
4. better-auth: hash da senha (argon2) + cria user + session
5. Server Action redireciona → /
```

**Por que Server Action e não fetch no client?**
- A senha nunca passa pelo JavaScript do browser além do submit do form
- `useActionState` dá o estado de loading + erros de graça
- O `redirect()` funciona no servidor

### 6.2 Login

```
1. <LoginForm> → Server Action (login)
2. Zod valida formato
3. better-auth verifica credenciais
4. Cria session no banco + cookie httpOnly
5. redirect → /
```

**Enumeração de usuário:** retornar **a mesma mensagem** para "e-mail não existe" e "senha errada". Nunca revelar se um e-mail está cadastrado.

**Rate limiting no login:** 5 tentativas por e-mail por 15 min. Um login brute-force é o vetor mais óbvio. Implementação: tabela `loginAttempt` ou contador em memória (memória não funciona em serverless — precisa do banco).

### 6.3 Logout

```
1. UserMenu → Server Action (logout)
2. better-auth: invalida a session no banco + limpa o cookie
3. redirect → /login
```

### 6.4 Salvar chave Runware (BYOK)

```
1. RunwareConfigModal (client) → POST /api/runware/credential
2. Route Handler: verifySession() → 401 se não autenticado
3. Valida formato da chave (regex)
4. **Testa a chave** contra a Runware: POST api.runware.ai/v1 { taskType: "accountManagement", operation: "getDetails" }
   - Se 401 → a chave é inválida → 422 "Chave inválida"
   - Se OK → guarda o balance retornado
5. Criptografa (AES-256-GCM) e salva no banco, amarrada ao userId
6. Retorna { keyHint, balance } — **nunca a chave**
```

**Validar antes de salvar** é essential: evita guardar lixo e dá feedback imediato ao usuário.

### 6.5 Geração (com BYOK)

```
1. Client → POST /api/runware/generate { prompt, model, ... }
2. Route Handler:
   a. verifySession()                          → 401
   b. busca credential do userId (decifra)    → 404 "nenhuma chave configurada"
   c. constrói task a partir do schema do modelo
   d. POST api.runware.ai/v1 com a chave do usuário
   e. faz polling se async
   f. salva a generation no banco (userId)
   g. retorna a GenerationItem
3. Client: adiciona à galeria, atualiza saldo
```

### 6.6 Saldo

```
GET /api/runware/account
→ verifySession()
→ decifra a chave
→ accountManagement/getDetails → balance
→ { balance, credits, brl }
```

Cada geração debita o saldo real — o header deve refletir o saldo real, não um número inventado.

---

## 7. Ordem de implementação

### Fase A — Fundação da auth (sem mexer na UI existente)

| # | Tarefa | Entrega |
|---|---|---|
| A1 | Dependências | `better-auth`, `drizzle-orm`, `postgres`, `zod`, `argon2` |
| A2 | `.env.local` + `.env.example` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RUNWARE_ENCRYPTION_KEY` |
| A3 | Schema Drizzle + migration | Tabelas de auth + domínio |
| A4 | `src/lib/auth.ts` | Instância Better Auth com `drizzleAdapter` |
| A5 | `src/lib/auth-client.ts` | Hooks client-side |
| A6 | `src/app/api/auth/[...all]/route.ts` | Handler do Better Auth |
| A7 | `src/lib/dal.ts` | `verifySession()`, `getCurrentUser()` |
| A8 | **Teste**: signup → session → `/api/auth/session` retorna o user | Prova que a base funciona |

**Critério de aceite:** `curl` cria um usuário, faz login, e o cookie de sessão funciona.

### Fase B — UI de login/cadastro

| # | Tarefa |
|---|---|
| B1 | `(auth)/layout.tsx` — layout visual próprio (sem sidebar) |
| B2 | `LoginForm.tsx` com `useActionState` |
| B3 | `SignupForm.tsx` com `useActionState` |
| B4 | Validação Zod compartilhada em `src/lib/validation.ts` |
| B5 | Rate limiting no login (tabela `loginAttempt`) |
| B6 | Mensagem genérica para credencial inválida |

**Critério de aceite:** fluxo completo de cadastro e login na UI, com erros inline.

### Fase C — Proteção das rotas

| # | Tarefa |
|---|---|
| C1 | `src/proxy.ts` — redirect otimista + matcher correto |
| C2 | `verifySession()` em todas as Route Handlers de `/api/runware/*` |
| C3 | `verifySession()` nos Server Actions de mutação |
| C4 | `UserMenu.tsx` no header (dentro de `<Suspense>`) |
| C5 | Migrar `page.tsx` para `(app)/layout.tsx` com shell autenticado |

**Critério de aceite:** sem sessão, `POST /api/runware/generate` → 401. Com sessão → 200.

### Fase D — BYOK seguro

| # | Tarefa |
|---|---|
| D1 | `src/lib/crypto.ts` — AES-256-GCM |
| D2 | `src/app/api/runware/credential/route.ts` — POST/DELETE |
| D3 | Validação da chave contra a Runware antes de salvar |
| D4 | `RunwareConfigModal` — conecta ao backend, mostra saldo real, **remove o `localStorage`** |
| D5 | `src/lib/dal.ts` — `getRunwareCredential(userId)` |

**Critério de aceite:** a chave é salva cifrada, não aparece no HTML nem em nenhuma resposta da API.

### Fase E — Persistência do domínio

| # | Tarefa |
|---|---|
| E1 | CRUD de `generation` |
| E2 | CRUD de `project` |
| E3 | CRUD de `element` + `elementImage` |
| E4 | Migrar `page.tsx` de `useState` para fetch ao banco |

**Critério de aceite:** recarregar a página mantém tudo. Usuário A não vê os dados do usuário B.

### Fase F — Endurecimento

| # | Tarefa |
|---|---|
| F1 | CSP (`next.config.ts` → `headers()`) |
| F2 | Rate limiting nas rotas de geração (custo!) |
| F3 | Rotação de `RUNWARE_ENCRYPTION_KEY` (versionar no ciphertext) |
| F4 | Logs sem PII (nunca logar a chave Runware) |
| F5 | Testes:矩阵 de autorização (A não acessa dados de B) |

---

## 8. Dependências

```bash
npm i better-auth drizzle-orm postgres zod @node-rs/argon2
npm i -D drizzle-kit
```

**Versões verificadas hoje:**

| Pacote | Versão |
|---|---|
| `better-auth` | 1.7.28 |
| `drizzle-orm` | 0.45.4 |
| `postgres` | 4.1.1 |
| `zod` | 4.6.7 |
| `@node-rs/argon2` | 2.2.2 |
| `drizzle-kit` | (dev) |

> `argon2` (`@node-rs/argon2`) em vez de `bcrypt` — mais moderno, sem gargalo de 72 bytes, e é o default do Better Auth. É um binário nativo: verificar se o runtime de deploy (Vercel Edge vs Node) suporta. Se der problema, trocar por `bcryptjs` (JS puro, mais lento).

---

## 9. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| **Chave Runware vazada** | 🔴 Crítico | Cifrada em repouso (AES-256-GCM); nunca em resposta de API; nunca em log; `localStorage` removido |
| Vazamento de sessão por XSS | 🔴 Alto | Cookie httpOnly + `sameSite` + CSP; o conteúdo do prompt é a principal superfície de XSS |
| **IDOR** (usuário A vê gerações do B) | 🔴 Alto | Toda query filtra por `userId` vindo do `verifySession()`, **nunca** do body da request |
| Brute force no login | 🟡 Médio | Rate limiting por e-mail; mensagem genérica |
| Custo descontrolado (geração em massa) | 🟡 Médio | Rate limiting por usuário em `/api/runware/generate`; opcionalmente cota diária |
| `Math.random()` no prerender quebra o build | 🟡 Médio | `export const instant = false` + mover para Client Component |
| Cache Components × sessão | 🟡 Médio | Seguir `use cache: private` para sessão; `use cache` + `cacheTag(userId)` para dados do usuário |
| Neon free tier estourar | 🟢 Baixo | Pooled connections; `postgres` com `max: 1` em serverless |
| Migração do `page.tsx` quebrar a UI | 🟢 Baixo | Fazer por último (Fase E), com a UI já estável |

---

## 10. O que este plano NÃO faz

- **Não implementa OAuth/Google login** — fica para depois (o Better Auth tem `socialProviders` pronto)
- **Não implementa 2FA**
- **Não implementa recuperação de senha por email** — precisa de provider de email (Resend/Postmark)
- **Não migra os projetos/elementos mockados para o banco imediatamente** — Fase E
- **Não faz a integração Runware** — isso é o `runware-integration-plan.md`

---

## 11. Perguntas em aberto (bloqueiam a Fase A)

1. **Qual provedor de banco?** Recomendo **Neon** (Postgres gerenciado, free tier, `DATABASE_URL` única). Alternativa: Supabase, ou um Postgres já existente na Central IT (dado o contexto do e-mail corporativo). **Preciso saber se há um Postgres institucional disponível** — isso muda a operação.

2. **E-mail para verificação / recuperação de senha?** Se não houver provedor, o cadastro fica sem verificação de e-mail (aceitável para um beta) e sem reset de senha.

3. **First user admin?** O app tem um `DeniedModal` e uma aba de ajuda — é multi-tenant real (qualquer um cria conta) ou convites? Isso muda se precisa de e-mail verificado obrigatório.

4. **Deploy alvo confirmado?** Vercel (serverless) muda o pooling do banco e o timeout do polling de vídeo. Se for Node persistente, dá para usar WebSocket na Runware e SQLite local.

5. **Migrar os projetos/elementos mockados para o banco, ou começar vazio?** Começar vazio é mais simples; migrar preserva a demo.

---

## 12. Resumo das decisões

| Tema | Decisão |
|---|---|
| Biblioteca | Better Auth 1.7.28 (self-hosted, Drizzle, tipado) |
| Banco | PostgreSQL (Neon) via `postgres` + Drizzle ORM |
| Sessão | Database session, cookie httpOnly + secure + sameSite=lax, 30 dias |
| Hash de senha | argon2 (`@node-rs/argon2`) |
| Chave Runware | AES-256-GCM, cifrada em repouso, amarrada ao `userId` |
| Validação | Zod 4, schemas compartilhados entre client e server |
| Proteção de rota | `proxy.ts` (otimista) + DAL (segura) — as duas |
| Cache Components | `use cache: private` para sessão; `use cache` + `cacheTag(userId)` para dados |
| UI | Opção A primeiro (client-side), migração para Server Components depois |
| Ordem | Auth fundação → UI → proteção → BYOK → persistência → endurecimento |
