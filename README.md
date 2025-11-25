# 💰 DividAí — Divisor de Despesas

Aplicação web moderna para dividir despesas em grupo, com autenticação, API REST e persistência via banco de dados. Este README traz instruções claras de instalação/uso e mapeia os requisitos técnicos obrigatórios do projeto.

## Funcionalidades

- 👥 Criação e gestão de grupos
- 💵 Registro de despesas com pagador e valor
- 📊 Cálculo automático de totais por grupo
- ✅ Instruções de acerto (quem paga quem) baseadas nos saldos
- 🔐 Login com Clerk e rotas protegidas (escrita exige autenticação)
- 🌙 Tema claro/escuro e UI responsiva (Tailwind)

## 🌐 Acesso Online

Acesse a versão hospedada: https://dividai-livid.vercel.app

## Arquitetura (Visão Geral)

```mermaid
flowchart LR
	A[Cliente Web<br/>React + Vite + Tailwind] -->|HTTP/JSON| B(API REST<br/>Express)
	B -->|Auth (Bearer)| C[Clerk<br/>Auth as a Service]
	B -->|Prisma ORM| D[(SQLite - SQL)]
	subgraph Opcional
		B -->|Driver| E[(MongoDB - NoSQL)]
		B --> F[IA (HuggingFace/OpenAI)]
	end
```

## Instalação e Execução (Dev)

Pré-requisitos:
- Node.js 18+ e npm
- Windows PowerShell (padrão deste projeto)

1) Instalar dependências

```powershell
npm install
```

2) Configurar variáveis de ambiente

Crie/edite o arquivo `.env` na raiz (já existe um exemplo neste repositório):

```env
DATABASE_URL="file:./dev.db"
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

3) Preparar o banco de dados (SQLite via Prisma)

```powershell
npx prisma migrate deploy
```

4) Subir a API (Express em `server/index.js`)

```powershell
npm run server
```

5) Iniciar o Frontend (Vite)

Em um novo terminal:

```powershell
npm run dev
```

Aplicação padrão:
- Frontend: http://localhost:5173
- API: http://localhost:4000

## Autenticação e Proteção de Rotas

- O projeto usa Clerk para autenticação. No frontend, o usuário se autentica e obtém um token.
- No backend (`server/index.js`), as rotas de escrita (POST/DELETE) usam `ClerkExpressRequireAuth()` para exigir token válido via `Authorization: Bearer <token>`.
- Senhas não são armazenadas localmente; o Clerk gerencia credenciais e hashing seguro em seu provedor (evitando exposição no nosso banco).

## Banco de Dados

- SQL: Prisma + SQLite (arquivo `dev.db`) para entidades principais: `User`, `Group`, `Expense`, `Settlement` (ver `prisma/schema.prisma`).
- NoSQL (opcional): o projeto está preparado para adicionar MongoDB para logs/atividades. Consulte a seção “Extensões Futuras” para um guia rápido de como integrar.

## Endpoints Principais (API REST)

Base: `http://localhost:4000`

- `GET /` → status da API
- `GET /users` → lista usuários
- `POST /users` (auth) → cria usuário `{ email, name }`
- `GET /groups` → lista grupos
- `POST /groups` (auth) → cria grupo `{ name, members }` (members como string separada por vírgulas)
- `DELETE /groups/:id` (auth) → remove grupo e despesas
- `GET /expenses` → lista despesas
- `POST /expenses` (auth) → cria despesa `{ description, amount, paidBy, groupId }`
- `DELETE /expenses/:id` (auth) → remove despesa e ajusta total do grupo
- `GET /settlements` → lista registros de acertos
- `POST /settlements` (auth) → cria registro de acerto `{ fromUser, toUser, amount, groupId }`

Observação: rotas com “(auth)” exigem token do Clerk no header `Authorization`.

## Tecnologias

- React 18 + Vite + Tailwind CSS (UI responsiva)
- Express (API REST)
- Prisma ORM + SQLite (SQL)
- Clerk (autenticação e proteção de rotas)
- Lucide React (ícones)

## 👥 Equipe

- Felipe Battarra
- Gabriel Assed
- Gabriel Pacheco
- João Luiz
- Richardy Gabriel

## 📝 Licença

MIT

---

Observação histórica: este fork adicionou o schema de banco (Prisma) para integração com o app, garantindo persistência segura das informações lançadas no sistema.
