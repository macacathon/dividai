# 💰 DividAí - Divisor de Despesas

Aplicativo web para dividir despesas entre amigos de forma simples e eficiente.

## ✨ Funcionalidades

- 👥 Criar grupos de divisão
- 💵 Adicionar despesas
- 📊 Visualizar resumos
- ✅ Calcular acertos de contas
- 🌙 Modo escuro/claro

## 🚀 Como Usar

Acesse: [https://Macacathon.github.io/dividai/](https://Macacathon.github.io/dividai/)

## 🛠️ Tecnologias

- React 18
- Vite
- Tailwind CSS
- Lucide React

## 👥 Equipe

- [Felipe Battarra]
- [Gabriel Assed]
- [Gabriel Pacheco]
- [João Luiz]
- [Richardy Gabriel]

## 📝 Licença

MIT

## Objetivo do fork

Criado o schema database para integração com o aplicativo, onde será guardado as informações lançadas no app em um local seguro.

## 📦 Deploy (Vercel / Production)

Se você está usando Vercel e está vendo uma página em branco após o deploy, o motivo mais comum é que o `base` do Vite está configurado para um caminho fixo (ex.: `/dividai/`) — isso faz com que o app tente carregar os assets em caminhos errados no domínio raiz do Vercel.

Correções / checklist para Vercel:

- Altere o `vite.config.ts` para deixar o `base` configurável (o projeto já foi atualizado para ler a variável `VITE_BASE_PATH`).
  - No painel do Vercel defina `VITE_BASE_PATH` para `/` (ou deixe em branco) antes do build, assim os arquivos são referenciados a partir da raiz.
- Build command recomendado no Vercel (quando só for front-end):

  - Build Command: npm run build
  - Output Directory: dist

- Se você está tentando publicar _também_ o backend Express (`server/index.js`) no mesmo projeto Vercel, saiba que o Express rodando como processo separado não é suportado diretamente — você precisará:

  - Mover rotas para funções serverless em `/api/*` (Vercel Functions), ou
  - Publicar o servidor em outro host (Heroku, Railway, Render, Fly, DigitalOcean App Platform, ou um VPS) e apontar o frontend para essa URL.

- Se o backend usa Prisma, rode `npx prisma generate` no processo de build onde for necessário (por exemplo CI / servidor) e configure `DATABASE_URL` corretamente no ambiente de runtime. Em Vercel é comum executar generation steps no build step, mas se você hospedar o servidor em outro provedor, garanta `PRISMA` steps são executados lá.

Com isso você deve evitar a tela branca — o problema mais comum é que o HTML pede /dividai/assets/... mas o site está servido em /, resultando em 404 e um app sem JS.
