# EasyWorkshop

## 📋 Descrição do problema

 Oficinas mecânicas de pequeno e médio porte frequentemente controlam veículos, clientes e manutenções em planilhas ou cadernos, o que gera perda de informações, dificuldade de rastrear o histórico de manutenção de cada veículo e falta de organização entre múltiplas oficinas.

## 💡 Descrição da solução

O **EasyWorkshop** é uma aplicação web que permite oficinas mecânicas gerenciarem seus veículos, clientes e manutenções de forma centralizada. O sistema conta com dois perfis de acesso — **Administrador** (dono/gestor da oficina) e **Usuário** (cliente) — e permite o cadastro completo do ciclo de manutenção: da oficina, do veículo e dos serviços realizados, com histórico vinculado a cada carro.

## 👥 Integrantes do grupo

- Caique Espindula Tullio
- Gabriel Cunhanski
- Lucas André Delmonico

## 🛠️ Tecnologias utilizadas

**Backend**
- Node.js
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken) para autenticação
- bcryptjs para hash de senhas
- cors
- dotenv

**Frontend**
-  React + Vite + TypeScript + Tailwind CSS

**Infraestrutura**
- MongoDB Atlas (banco de dados na nuvem)
- Render (hospedagem do backend)
- Vercel (Hospedagem do frontEnd)

## ⚙️ Instruções para instalação

Clone os dois repositórios (backend e frontend):

```bash
git clone https://github.com/kiketullio-sketch/TCC-Lions-Back-End.git
git clone https://github.com/kiketullio-sketch/TCC-Lions-Front-End.git
```

Em cada um dos projetos, instale as dependências:

```bash
npm install
```

## ▶️ Instruções para execução do backend

1. Dentro da pasta do backend, crie um arquivo `.env` na raiz com as variáveis descritas na seção [Variáveis de ambiente](#-variáveis-de-ambiente-necessárias)
2. Rode o servidor:

```bash
node --watch src/index.js
```

3. O servidor estará disponível em `http://localhost:3000` (ou na porta definida na variável `DOOR`)

## ▶️ Instruções para execução do frontend

1. Dentro da pasta do frontend, crie um arquivo `.env` (se aplicável) apontando para a URL da API
2. Rode o projeto:

```bash
npm run dev
```

3. Acesse `http://localhost:[PORTA]` no navegador

## 🔗 Links dos repositórios

- **Backend:** https://github.com/kiketullio-sketch/TCC-Lions-Back-End
- **Frontend:** https://github.com/kiketullio-sketch/TCC-Lions-Front-End.git

## 🌐 URLs públicas do deploy

- **Backend (API):** https://tcc-lions-back-end.onrender.com
- **Frontend (aplicação):** https://easy-workshop.vercel.app/login

> ⚠️ O backend está hospedado no plano gratuito do Render. Após períodos de inatividade, a primeira requisição pode levar de 30 a 50 segundos para responder, enquanto o servidor "acorda".

## 🔐 Variáveis de ambiente necessárias

Veja o arquivo [`.env.example`](./.env.example) para o modelo completo. Resumo:

| Variável | Descrição |
|---|---|
| `MONGODB_URI` | String de conexão do MongoDB Atlas |
| `JWT_SECRET` | Chave secreta usada para assinar os tokens JWT |
| `DOOR` | Porta em que o servidor irá rodar (padrão: 3000) |

## ✨ Principais funcionalidades

- Cadastro e autenticação de **usuários (clientes)** e **administradores (oficinas)** via JWT
- Renovação de sessão via refresh token
- Cadastro, edição, exclusão e listagem de **oficinas (workshops)**
- Cadastro, edição, exclusão e listagem de **veículos**
- Cadastro, edição, exclusão e listagem de **manutenções**, vinculando veículo, oficina e serviços realizados
- Cálculo e registro do valor final de cada manutenção
- Controle de acesso por papel (rotas restritas a administradores)
- Validação de CPF, CNPJ e e-mail no cadastro

## 📡 Rotas da API

Base URL: `https://tcc-lions-back-end.onrender.com`

### Autenticação

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | `/login` | Não | Login de usuário ou admin. Body: `{ email, senha, type: "admin" \| "user" }` |
| POST | `/refresh` | Não | Renova o token. Body: `{ refreshToken }` |
| GET | `/me` | Sim | Retorna os dados do usuário/admin autenticado |

### Usuário

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | `/user` | Não | Cadastra um novo usuário. Body: `{ name, email, senha, CPF, phone? }` |
| PUT | `/user/:id` | Sim | Atualiza um usuário |
| DELETE | `/user/:id` | Sim | Remove um usuário |
| GET | `/users` | Sim (admin) | Lista todos os usuários |

### Admin (Oficina - conta de acesso)

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | `/admin` | Não | Cadastra um novo admin. Body: `{ workshopName, email, senha, CNPJ }` |
| PUT | `/admin/:id` | Sim (admin) | Atualiza um admin |
| DELETE | `/admin/:id` | Sim (admin) | Remove um admin |
| GET | `/admins` | Sim (admin) | Lista todos os admins |

### Workshop (dados operacionais da oficina)

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | `/workshop` | Sim (admin) | Cadastra uma oficina. Body: `{ name, address, specialties: string[] }` |
| PUT | `/workshop/:id` | Sim (admin) | Atualiza uma oficina |
| DELETE | `/workshop/:id` | Sim (admin) | Remove uma oficina |
| GET | `/workshop` | Não | Lista todas as oficinas |

### Veículo

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | `/veiculo` | Sim (admin) | Cadastra um veículo. Body: `{ plate, model, year, owner }` |
| PUT | `/veiculo/:id` | Sim (admin) | Atualiza um veículo |
| DELETE | `/veiculo/:id` | Sim (admin) | Remove um veículo |
| GET | `/veiculo` | Não | Lista todos os veículos |

### Manutenção

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| POST | `/maintenance` | Sim (admin) | Cadastra uma manutenção. Body: `{ workshop, veiculo, services: [{ name, price }], finalPrice }` |
| PUT | `/maintenance/:id` | Sim (admin) | Atualiza uma manutenção |
| DELETE | `/maintenance/:id` | Sim (admin) | Remove uma manutenção |
| GET | `/maintenance` | Não | Lista todas as manutenções |

### Utilitário

| Método | Rota | Protegida | Descrição |
|---|---|---|---|
| GET | `/health` | Não | Verifica se a API está no ar |

> Rotas protegidas exigem o header `Authorization: Bearer {token}`.

## 🔑 Credenciais de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Admin (oficina) | oficinaABC@gmail.com| 123456 |
| Usuário (cliente) | caique@gmail.com | 123456 |


