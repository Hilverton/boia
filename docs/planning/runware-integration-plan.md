# Planejamento: Integração Real com a API Runware

**Projeto:** Boia (clone do Boia.space)
**Data:** 2026-11-24
**Objetivo:** Substituir os dados mockados de modelos e a geração simulada por integração real com a API Runware — listagem completa do catálogo, preço real, e execução real de gerações (imagem e vídeo).

---

## 1. Diagnóstico do estado atual

### O que já existe (mockado)

| Arquivo | Conteúdo | Status |
|---|---|---|
| `src/data/models.ts` | `AVAILABLE_MODELS` — 14 modelos hardcoded (8 imagem, 6 vídeo) com `costPerGen` fixo | **Mock** |
| `src/data/models.ts` | `STANDARD_SIZES` — mapa fixo 1K/2K/4K × 10 aspect ratios | **Mock** |
| `src/data/models.ts` | `INITIAL_GENERATIONS`, `INITIAL_PROJECTS`, `INITIAL_ELEMENTS` | Mock (ok p/ demo) |
| `src/app/page.tsx` | `handleGenerate` — `setTimeout(1800)` + URLs do Unsplash | **Simulação** |
| `src/app/page.tsx` | `balance` = `5.4218` hardcoded | **Mock** |
| `src/components/RunwareConfigModal.tsx` | Salva a chave em `localStorage` (`boia_runware_key`) | Parcial — chave nunca é usada |
| `src/components/PromptComposer.tsx` | Picker de modelo, custo calculado por multiplicador fixo (`1.35` / `2.1`) | **Mock** |

### Lacunas críticas

1. **A chave de API nunca sai do navegador.** Hoje ela vai para `localStorage`. Se chamarmos `api.runware.ai` direto do client, a chave fica exposta e **usável por qualquer pessoa** que abrir o devtools. Precisa de um backend.
2. **CORS:** a API Runware não documenta CORS para browsers. `https://api.runware.ai/v1` chamado do client provavelmente falha.
3. **Preço está errado.** O app assume `costPerGen × multiplicador de qualidade`. Na API real o preço depende de `unit` (`output`, `durationSecond`, `inputToken`…) e de `label` (ex.: Seedream 5.0 Pro cobra `$0.0481` em `1.5K` e `$0.0963` em `2K` — não 1× e 2×).
4. **Tamanho de saída é livre** (min/max/step por modelo), não um enum de 30 combinações.
5. **Balanço é inventado** — existe `accountManagement` → `getDetails` → `balance` real.

### Fatos apurados na API (verificados ao vivo)

**Endpoints**
- REST: `POST https://api.runware.ai/v1` — payload é **sempre um array JSON**
- WebSocket: `wss://ws-api.runware.ai/v1`
- Catálogo público (sem auth): `https://runware.ai/docs/models/index.json`
- Schema por modelo: `https://runware.ai/docs/models/<id>/schema.json`
- Exemplos (requisição real + preço): `https://runware.ai/docs/models/<id>/examples.json`

**Autenticação** — `Authorization: Bearer <API_KEY>` no header, ou `{"taskType":"authentication","apiKey":"..."}` como primeiro elemento do array.

**Catálogo (`index.json`)** — 5289 linhas ≈ **~180 modelos** com campos: `id`, `air`, `name`, `status` (`live`/`deprecated`), `capabilities[]`, `creator`, `architecture`, `schema`. Alguns modelos (LLMs) **não têm `air`** — são endereçados por `name`.

**Preço (`info["x-pricing"]`)** — 4 formatos:
| Formato | Campos | Como calcular |
|---|---|---|
| Por unidade | `rates[]` com `amount`, `unit`, `label`, `display`, `after?` | `amount × unidades` |
| Por token | `rates[]` + `basis: "token"` | `amount` é por token; `display` é por 1M |
| Por tempo de compute | `measured[]` (sem `rates`) | preço só conhecido **depois** |
| Exemplos | `examples[]` com `price`, `latencyMs`, `configuration` | referência |

Unidades: `output`, `durationSecond`, `computeSecond`, `step`, `inputImage`, `inputMegapixel`, `outputMegapixel`, `character`, `utf8Byte`, `inputToken`, `outputToken`, `cachedInputToken`, `cacheWriteToken`.

**Schema do modelo** (`components.schemas.RequestBody.items`):
- `required`: `positivePrompt`, `width`, `height`, `taskType`, `taskUUID`, `model`
- `inputs.*`: `referenceImages`, `referenceVideos`, `referenceAudios`, `frameImages`, `image`, `images`, `seedImage`, `maskImage`
- `settings.*`: parâmetros específicos do modelo (não há `settings` no FLUX.2 dev, mas há em outros)
- Parâmetros **não declarados são rejeitados** — não dá para mandar `steps` num modelo sem `steps`
- `allOf`: regras de dependência entre parâmetros (ex.: com `frameImages`, `width`/`height` são proibidos)
- `x-constraints`: limites que dependem do arquivo (ratio, fileSize, duration) — **não validados por JSON Schema**, precisam de checagem manual

**Modos (`info["x-modes"]`)** — cada combinação válida de inputs. Ex. Seedream 5.0 Pro: `text` e `reference-images`. H3 (vídeo) tem 9 modos.

**Resposta** — `data[]` com `imageURL`/`videoURL`, `cost`, `seed`; `errors[]` à parte. `status`: `processing` | `success` | `error`. `progress` 0–100.

**Polling** — `deliveryMethod: "async"` → `{"taskType":"getResponse","taskUUID":"..."}`. Sync espera até 120s e pode devolver `status: "processing"`. Backoff exponencial recomendado.

**Saldo real** — `accountManagement` com `operation: "getDetails"` → `balance` (float USD).

**Custo real da requisição** — adicionar `includeCost: true` na task devolve o `cost` cobrado no `data[]`.

**SDK oficial** — `@runware/sdk@1.10.0` (npm). Faz polling automático e validação de schema (a partir da v1.8.1).

---

## 2. Decisões de arquitetura

### Decisão A — Backend com proxy (OBRIGATÓRIA)

Chamar a Runware direto do browser expõe a chave. A chave do Runware é da conta que paga pelas gerações — vazamento significa consumo por terceiros.

**Implementação:** rotas Route Handlers do Next.js (o projeto já é Next.js 16.4.6 com App Router).

```
src/app/api/runware/
  models/route.ts        GET  → catálogo filtrado + cache
  schemas/[id]/route.ts  GET  → schema de um modelo (parâmetros + pricing)
  generate/route.ts      POST → dispara geração (poll server-side)
  account/route.ts       GET  → balance real
```

A chave vive **apenas** em `.env.local` (`RUNWARE_API_KEY`), lida no servidor. O browser nunca a vê.

### Decisão B — WebSocket vs REST

| | WebSocket | REST (HTTP) |
|---|---|---|
| Latência | Menor | Maior |
| Setup no server | Precisa de lib WS + ciclo de vida no serverless | `fetch` puro |
| Polling vídeo | Automático (SDK) | Manual com `getResponse` |
| Compatibilidade Vercel/serverless | Problemático (sem conexão longa) | ✅ |

**Escolhido: REST.** O deploy alvo é serverless (Vercel). O SDK oficial usa WebSocket por padrão, o que complica serverless. Vamos usar REST + polling com backoff, reaproveitando a lógica do SDK como referência.

**Reconsiderar** se o uso de WebSocket for necessário (streaming de vídeo ao vivo).

### Decisão C — Catálogo: fonte de verdade = `index.json` público, enriquecido com `schema.json`

`index.json` é público (sem auth), leve, e já traz `id`, `air`, `name`, `capabilities`, `status`. Faltam preço e parâmetros — que vêm do `schema.json` de cada modelo.

**Estratégia de carregamento em 2 níveis:**
1. **Catálogo base**: `index.json` → lista completa, cacheada (revalidate ~6h). Sem auth, rápido.
2. **Detalhe sob demanda**: `schema.json` do modelo selecionado → parâmetros válidos, pricing, modos. Buscado só quando o usuário abre o modelo / seleciona.

Isso evita baixar ~180 schemas de uma vez. **Não** usar `modelSearch` para a listagem principal: ele é paginado (20/página), busca por texto, e é o endpoint para *comunidade*; o `index.json` é o catálogo oficial completo.

**Complementar com `modelSearch`** para: modelos privados da própria organização, LoRAs/checkpoints da comunidade, e busca textual quando o catálogo oficial não basta.

### Decisão D — Preço: calcular por `rates`, fallback para `measured`

- Modelo com `rates` → calculamos pelo `unit` e `label`corresponding à configuração escolhida
- Modelo com `measured` (tempo de compute) → exibir "preço varia" + mostrar os `examples` como referência; o valor exato vem de `includeCost: true` na resposta
- `after` → taxa só se aplica além de N unidades (ex.: `$0.00321` por imagem de input além da 1ª)
- `basis` → `token`, `passthrough`, `floor`, `plusTokens` alteram o cálculo

### Decisão E — Modelo de dados unificado

Substituir `AIModel` hardcoded por um tipo derivado do schema real. O schema de cada modelo é diferente, então o modelo interno precisa ser um **normalizador**:

```ts
interface RunwareModel {
  id: string;              // id do index.json
  air?: string;            // nem todo modelo tem (LLMs)
  name: string;
  creator?: string;
  status: "live" | "deprecated" | "coming-soon";
  capabilities: string[];  // do index.json
  // derivado do schema (carregado sob demanda)
  pricing?: ModelPricing;
  modes?: ModelMode[];     // x-modes
  params?: ModelParams;    // parametros aceitos
  constraints?: Constraint[];
}
```

O `AIModel` atual (`type: "image" | "video"`, `sizes`, `caps`, `promptMax`, `negativePrompt`) precisa ser **derivado** ou **substituído**. Manter `type` mas derivá-lo de `capabilities` (`text-to-image` → image; `text-to-video` → video).

### Decisão F — Dimensões: deixar o modelo mandar

Hoje o app força `STANDARD_SIZES` (30 combinações fixas). Na API real, cada modelo declara seu próprio `width`/`height` (`minimum`, `maximum`, `multipleOf`) ou uma **lista fechada** (`oneOf` com `title`).

**Novo comportamento:**
- Se o schema tem `oneOf` de dimensões → mostrar essas opções com o `title` ("768p (~16:9)")
- Se tem `minimum`/`maximum` → manter aspect ratio picker, mas derivar width/height do ratio dentro dos limites, respeitando `multipleOf`
- Aspect ratio passa a ser um **hint**, não uma imposição

---

## 3. Escopo do trabalho

### Fase 1 — Fundação (backend + catálogo)
**Objetivo:** o app lista os modelos reais com preço real, sem quebrar a UI existente.

1. `.env.local` com `RUNWARE_API_KEY` + `.env.example` documentando
2. `src/lib/runware/client.ts` — wrapper REST: `runwareFetch(tasks)` com header `Authorization: Bearer`, `Content-Type: application/json`, body = array, tratamento de `errors[]`
3. `src/lib/runware/catalog.ts` — fetch de `index.json` com cache (`revalidate: 21600`) + normalização para `RunwareModel`
4. `src/app/api/runware/models/route.ts` — GET com filtros (`capability`, `creator`, `q`, `status`)
5. `src/app/api/runware/schemas/[id]/route.ts` — GET do schema + pricing de um modelo, com cache
6. `src/app/api/runware/account/route.ts` — GET `accountManagement`/`getDetails` → `balance` real
7. Tipos novos em `src/types/index.ts` (`RunwareModel`, `ModelPricing`, `ModelMode`, `Constraint`)
8. Testes: contrato do wrapper contra a API real (marcados como integração)

**Critério de aceite:** a tela de modelos mostra o catálogo real com preços corretos; o saldo mostrado é o real.

### Fase 2 — Geração real (imagem)
**Objetivo:** gerar imagens de verdade.

1. `src/lib/runware/generate.ts` — monta a task: `taskType: "imageInference"`, `model: air`, `positivePrompt`, `width`/`height` derivados do schema, `includeCost: true`, `deliveryMethod` conforme latência
2. Polling com backoff exponencial para `getResponse` (imagem costuma ser sync; vídeo precisa de async)
3. `src/app/api/runware/generate/route.ts` — POST
4. Mapeamento da resposta → `GenerationItem` (`imageURL`, `cost` real, `seed`, `dimensions`)
5. Substituir `handleGenerate` em `page.tsx` pela chamada real
6. Estados de erro: chave inválida, saldo insuficiente, erro do modelo, timeout — cada um com mensagem em PT-BR
7. Indicador de progresso (`progress` 0–100) durante a geração

**Critério de aceite:** uma geração real retorna uma imagem servida pelo Runware, com `cost` coincidente com o previsto.

### Fase 3 — Geração real (vídeo)
**Objetivo:** gerar vídeos de verdade (assíncrono).

1. `taskType: "videoInference"`, `duration`, `resolution` — conforme o schema do modelo (vídeo usa `resolution` em vez de `width`/`height` em muitos modelos)
2. `deliveryMethod: "async"` + polling de `getResponse` com backoff e timeout maior (vídeo pode levar minutos)
3. Progresso via `progress` no polling
4. Tratamento de `status: "error"` com `errors[]`
5. Cancelamento (o app tem um botão de gerar; deve poder abortar)

**Critério de aceite:** vídeo real gerado e reproduzido na galeria.

### Fase 4 — Integração com a UI
**Objetivo:** a UI reflete os dados reais.

1. `PromptComposer` — picker passa a listar do catálogo real; busca usa o filtro do backend; custo calculado do pricing real
2. Dimensões — picker de aspect ratio passa a respeitar os limites do modelo selecionado
3. `negativePrompt` — só aparece se o schema do modelo declarar o parâmetro
4. `RunwareConfigModal` — valida a chave na hora (chamada de teste), mostra saldo real, deixa de esconder a chave no `localStorage`
5. `Sidebar` / header — saldo real, indicadores de conexão
6. `MediaGallery` / `ImageDetailModal` — exibe `cost` real e dimensões reais
7. `HelpPricingView` — tabela de preços real

**Critério de aceite:** nenhum valor de preço no app é hardcoded.

### Fase 5 — Referências e mídia
**Objetivo:** habilitar image-to-image e os elementos.

1. Upload de mídia → `mediaStorage` / `imageUpload` (as tasks da API)
2. `inputs.referenceImages` / `inputs.seedImage` conforme o `x-modes` do modelo
3. Elementos (`@Rapaz`, `@Vista-aerea`) → referência via `referenceImages`
4. Validação de `x-constraints` (ratio, fileSize, duration) **no cliente**, antes de enviar

**Critério de aceite:** image-to-image funciona com imagens do usuário.

---

## 4. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Chave exposta no client | 🔴 Alto | Backend proxy; chave só em `.env.local`; nunca `NEXT_PUBLIC_*` |
| Schema varia por modelo | 🟡 Médio | Nunca montar payload "na mão"; derivar do schema e validar antes de enviar |
| `measured` (tempo de compute) sem preço prévio | 🟡 Médio | Exibir faixa dos `examples`; preço exato via `includeCost` |
| Vídeo demora / estoura timeout | 🟡 Médio | `deliveryMethod: async` + polling com backoff; se o deploy não suportar request longa, mover o polling para o client (SSE/interval) |
| WebSocket em serverless | 🟡 Médio | REST (decisão B). Se mudar de deploy, reavaliar |
| Rate limits | 🟡 Médio | Backoff exponencial; cache agressivo do catálogo; não buscar schema de todos os modelos |
| Catálogo muda (modelo sai do ar) | 🟢 Baixo | Filtrar `status !== "live"`; tratar `deprecated` com `x-replaced-by` |
| CORS se alguém tentar chamar do browser | 🟢 Baixo | Não chamar do browser; a rota do proxy é o único caminho |

---

## 5. Dependências

```bash
npm i @runware/sdk     # opcional: referência de polling/validação (REST é manual)
npm i -D ajv ajv-formats   # validação de JSON Schema contra o schema do modelo
```

**Nota sobre `ajv`:** a doc oficial recomenda validar o payload contra o schema do modelo antes de enviar. Com ~180 modelos e schemas diferentes, essa validação é o que impede erros de "parâmetro não declarado". O SDK já faz isso — se adotarmos o SDK, não precisamos do `ajv`.

---

## 6. Como o GitHub Rea foi usado (contexto)

A aplicação foi construída com o **GitHub Rea** (agente de IA do GitHub), que gera a base do clone do Boia.space: layout, componentes, tokens de cor, os dados mockados e a estrutura do App Router. Ou seja, a camada de UI e o *look and feel* já estão prontos e consistentes.

**O que o Rea não fez:** a integração real com a Runware. Tudo que é específico da API — catálogo dinâmico, pricing por `rates`, schema-driven payload, polling, saldo real — é trabalho novo, e é o escopo deste plano.

**Implicação para o planejamento:** o plano **não** reescreve a UI. Ele troca a *fonte dos dados* por trás dela e conecta o botão de gerar ao backend. A camada de apresentação (PromptComposer, MediaGallery, Sidebar, modais) permanece e só passa a consumir dados reais.

---

## 7. Perguntas em aberto (precisam de decisão)

1. **Chave por usuário ou chave única do servidor?** O modal atual sugere "cada usuário coloca a sua chave" (BYOK). Se for BYOK, a chave precisa ir para o servidor de qualquer forma (para o proxy) — ou o app passa a ser 100% client-side com a chave exposta. **Recomendação:** chave do servidor (single-tenant) por enquanto; BYOK multi-tenant exige autenticação de usuário.
2. **Escopo de modelos na UI:** todos os ~180 (imagem, vídeo, áudio, LLM, 3D, upscale) ou só imagem + vídeo? **Recomendação:** começar com imagem + vídeo; as outras modalidades têm requisitos de UI distintos.
3. **Onde persistir as gerações?** Hoje ficam em `useState` (somem ao recarregar). **Recomendação:** `localStorage` como mínimo, ou um banco se o app for multi-usuário.
4. **Deploy alvo?** Vercel (serverless, timeout curto) ou Node persistente? Muda a estratégia de polling de vídeo.
5. **Sjinn models:** o catálogo hardcoded tem `provider: "Sjinn"` (Kling 4, Sora 2) que **não existe** no catálogo oficial da Runware. Verificar se foram removidos ou se são outra integração.

---

## 8. Ordem de execução sugerida

1. **Fase 1.1** — `client.ts` + `.env.local` + rota `/api/runware/models` → validar com `curl` que a chave funciona
2. **Fase 1.2** — rota de schema + pricing → validar preço de um modelo contra o doc
3. **Fase 1.3** — rota de account → saldo real no header
4. **Fase 1.4** — UI: picker de modelo consome o catálogo real
5. **Fase 2** — geração de imagem real (sync) + polling
6. **Fase 3** — geração de vídeo real (async)
7. **Fase 4** — polimento da UI (custos, saldo, erros, dimensões)
8. **Fase 5** — upload / image-to-image / elementos
