# ClickBeard

Sistema completo de agendamento para barbearia.

## Tecnologias
- **Backend:** Node.js, NestJS, TypeScript, Prisma (PostgreSQL)
- **Frontend:** React, Vite, TypeScript, React Router
- **Banco de Dados:** PostgreSQL 15
- **Infraestrutura:** Docker e Docker Compose

## Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (apenas se for rodar localmente sem Docker)

## Variáveis de Ambiente
O projeto possui um sistema centralizado de configuração para o Docker.
Na raiz do projeto, existe o arquivo `.env.docker.example`.
Faça uma cópia dele e renomeie para `.env` na própria raiz do projeto. O Docker Compose irá ler este arquivo automaticamente para injetar as credenciais seguras (banco de dados, JWT, etc) nos containers.

## Como Rodar via Docker Compose (Recomendado)

O projeto já está totalmente configurado para rodar através de containers. 
Na raiz do projeto, execute:

```bash
docker-compose up --build
```

O Docker irá compilar o Frontend e o Backend e subirá também a instância do PostgreSQL.
- O Frontend ficará disponível em: `http://localhost:5173`
- A API do Backend ficará em: `http://localhost:3001/api`
- A Documentação Swagger da API (DevMode) ficará em: `http://localhost:3001/api-docs`

## Seed / Credenciais

Um script de *seed* foi executado para popular o banco de dados inicial (isso é feito automaticamente durante a compilação do Backend, caso rode localmente).
**Usuário Administrador (Acesso Total):**
- Email: `admin@clickbeard.com`
- Senha: `admin123`

## Rodando Localmente (Sem Docker)

> **Nota Importante:** Ao rodar sem Docker, o arquivo `.env` da raiz não é lido. Você precisará dos arquivos `.env` específicos dentro de cada pasta!

Caso prefira rodar localmente na sua máquina (útil para comandos do Prisma CLI), levante apenas o banco de dados e instale as dependências.

### Backend
1. `cd backend`
2. `npm install` (Caso dê erro no Prisma depois, rode `npx prisma generate`)
3. Crie o `.env` baseado no `.env.example` **que está dentro da pasta backend/**
4. `npx prisma migrate dev`
5. `npx prisma db seed`
6. `npm run start:dev`

## Como criar uma nova Migration no Prisma

Sempre que você alterar o arquivo `backend/prisma/schema.prisma` (adicionando novas tabelas ou colunas), você precisará gerar uma nova migration para atualizar o banco de dados.

1. Acesse a pasta do backend: `cd backend`
2. Certifique-se de que o banco de dados está rodando (via Docker ou localmente).
3. Execute o comando de migration passando um nome descritivo:
   ```bash
   npx prisma migrate dev --name nome_da_sua_alteracao
   ```
4. O Prisma irá gerar automaticamente o arquivo SQL da migration e atualizar o seu Client (`@prisma/client`) com as novas tipagens.

### Frontend
1. `cd frontend`
2. `npm install`
3. Crie o `.env` baseado no `.env.example` **que está dentro da pasta frontend/**
4. `npm run dev`

## Regras de Negócio Implementadas
- Validação no backend previne conflitos de horários (dois agendamentos não podem ocorrer no mesmo momento para o mesmo barbeiro).
- Cancelamentos respeitam o prazo de limite mínimo de 120 minutos (2 horas) de antecedência.
- Exclusão em cascata tratada a nível de Serviço (Barbeiros e Especialidades).


