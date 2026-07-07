# ClickBeard

Sistema completo de agendamento para barbearia.

## Tecnologias
- **Backend:** Node.js, Express, TypeScript, Prisma (PostgreSQL)
- **Frontend:** React, Vite, TypeScript, React Router
- **Banco de Dados:** PostgreSQL 15
- **Infraestrutura:** Docker e Docker Compose

## Arquitetura (Padrão Pleno/Sênior)
Este projeto foi construído seguindo boas práticas de engenharia de software para garantir escalabilidade e segurança:
- **Clean Architecture (Service Layer):** Toda a regra de negócio está isolada em `services/`, deixando os Controllers responsáveis apenas pelo roteamento HTTP.
- **RBAC (Role-Based Access Control):** Sistema de permissões por cargos (ADMIN/CLIENT) protegendo rotas sensíveis (ex: Deleção de barbeiros).
- **Validação Rigorosa (Zod):** Todos os payloads (`req.body`) são interceptados e validados pelo Zod antes de tocarem a lógica do banco de dados, prevenindo injeções e erros de formatação.
- **Frontend Componentizado:** Interface limpa no React, sem "God Components", dividindo lógicas em pequenas *Tabs* e modais gerenciáveis.

## Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (apenas se for rodar localmente sem Docker)

## Variáveis de Ambiente
Na raiz do projeto existe o arquivo `.env.example`.
Faça uma cópia do conteúdo dele para criar o arquivo `.env` dentro da pasta `backend/` e da pasta `frontend/`.

## Como Rodar via Docker Compose (Recomendado)

O projeto já está totalmente configurado para rodar através de containers. 
Na raiz do projeto, execute:

```bash
docker-compose up --build
```

O Docker irá compilar o Frontend e o Backend e subirá também a instância do PostgreSQL.
- O Frontend ficará disponível em: `http://localhost:5173`
- A API do Backend ficará em: `http://localhost:3001/api`

## Seed / Credenciais

Um script de *seed* foi executado para popular o banco de dados inicial (isso é feito automaticamente durante a compilação do Backend, caso rode localmente).
**Usuário Administrador (Acesso Total):**
- Email: `admin@clickbeard.com`
- Senha: `admin123`

## Rodando Localmente (Sem Docker)

Caso prefira rodar localmente, levante apenas o banco de dados via docker e instale as dependências.

### Backend
1. `cd backend`
2. `npm install`
3. Crie o `.env` baseado no `.env.example`
4. `npx prisma migrate dev`
5. `npx prisma db seed`
6. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Crie o `.env` baseado no `.env.example`
4. `npm run dev`

## Regras de Negócio Implementadas
- Validação no backend previne conflitos de horários (dois agendamentos não podem ocorrer no mesmo momento para o mesmo barbeiro).
- Cancelamentos respeitam o prazo de limite mínimo de 120 minutos (2 horas) de antecedência.
- Exclusão em cascata tratada a nível de Serviço (Barbeiros e Especialidades).
