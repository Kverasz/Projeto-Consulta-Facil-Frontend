# 🏥 Consulta Fácil

**Aplicação web responsiva voltada à facilitação do acesso aos serviços de saúde na cidade do Recife, Pernambuco.**

Projeto Integrado desenvolvido por estudantes do **3º período do curso de Análise e Desenvolvimento de Sistemas (ADS) da Faculdade SENAC Pernambuco**.

O projeto busca reunir, em uma única plataforma, recursos de orientação inicial ao paciente, pré-triagem, agendamento de consultas e acompanhamento de atendimentos.

> ⚠️ **Aviso:** O Saúde Recife é um projeto acadêmico em desenvolvimento e não substitui avaliação, diagnóstico ou atendimento médico. Em situações de emergência, ligue **192 (SAMU)**.

---

## 📌 Sobre o projeto

O **Consulta Fácil** nasceu da proposta de utilizar a tecnologia para tornar o acesso aos serviços de saúde mais simples, organizado e acessível.

A aplicação foi planejada para atender diferentes perfis de usuários:

- **Paciente:** acesso a serviços, pré-triagem, agendamentos, histórico de consultas e gerenciamento de perfil.
- **Profissional de saúde:** visualização de agenda, consultas e informações relacionadas aos atendimentos.
- **Administrador:** acesso a uma interface administrativa para gerenciamento da plataforma.

O desenvolvimento prioriza uma experiência intuitiva, interfaces responsivas e organização modular do código, facilitando futuras integrações com serviços externos.

## 🎯 Objetivos

### Objetivo geral

Desenvolver uma aplicação web que facilite o acesso da população aos serviços de saúde, oferecendo ferramentas digitais de orientação e gerenciamento de consultas.

### Objetivos específicos

- Facilitar a identificação de especialidades médicas.
- Oferecer um fluxo inicial de pré-triagem orientativa.
- Simplificar o processo de agendamento de consultas.
- Permitir o acompanhamento de consultas agendadas e realizadas.
- Disponibilizar interfaces específicas para pacientes, profissionais e administradores.
- Integrar o front-end a uma API REST.
- Desenvolver uma interface responsiva e acessível.

---

## 🚀 Funcionalidades

### 👤 Área do paciente

| Funcionalidade | Situação |
|---|---|
| Tela de boas-vindas | ✅ Implementada |
| Login com autenticação via API | ✅ Integrado |
| Cadastro de paciente | 🟡 Interface e requisição implementadas; validação pendente |
| Recuperação de senha | 🟡 Interface implementada |
| Página inicial personalizada | ✅ Implementada |
| Navegação entre telas | ✅ Implementada |
| Pré-triagem por questionário | 🟡 Interface implementada |
| Gravação de áudio na pré-triagem | 🟡 Captura local implementada |
| Recomendação automatizada de especialidade | 🔜 Pendente |
| Seleção de especialidade | ✅ Implementada |
| Seleção de clínica e profissional | 🟡 Fluxo demonstrativo |
| Seleção de data e horário | 🟡 Fluxo demonstrativo |
| Confirmação de agendamento | 🟡 Confirmação local |
| Visualização de agendamentos | 🟡 Dados locais |
| Detalhes da consulta | ✅ Interface implementada |
| Cancelamento de consulta | 🟡 Atualização local |
| Reagendamento | 🟡 Atualização local |
| Histórico de consultas | 🟡 Dados locais |
| Perfil do paciente | ✅ Interface implementada |
| Central de notificações | 🟡 Interface implementada, sem notificações reais |
| Integração completa dos agendamentos com a API | 🔜 Em desenvolvimento |

### 🩺 Área do profissional

A aplicação possui interfaces voltadas ao profissional de saúde, incluindo:

- Página inicial do profissional.
- Agenda de atendimentos.
- Visualização de consultas.
- Detalhes dos atendimentos.
- Gerenciamento visual de horários.
- Perfil profissional.

A integração dessas funcionalidades com dados reais depende dos respectivos serviços do back-end.

### ⚙️ Área administrativa

O projeto também contempla uma interface específica para usuários administradores, com expansão e integração previstas conforme a evolução da plataforma.

**Legenda:** ✅ Implementado · 🟡 Implementado parcialmente ou em modo demonstrativo · 🔜 Pendente ou em desenvolvimento.

---

## 🔄 Fluxo de atendimento

O fluxo principal do paciente contempla duas possibilidades.

### Fluxo com pré-triagem

```text
Paciente
   ↓
Login / Cadastro
   ↓
Página inicial
   ↓
Preciso de atendimento
   ↓
Pré-triagem
   ↓
Orientação de especialidade (integração futura)
   ↓
Agendamento
   ↓
Confirmação
```

### Fluxo direto de agendamento

```text
Paciente
   ↓
Página inicial
   ↓
Já sei o que preciso
   ↓
Especialidade
   ↓
Clínica / Unidade
   ↓
Profissional
   ↓
Data
   ↓
Horário
   ↓
Revisão dos dados
   ↓
Confirmação
```

Atualmente, o fluxo visual de agendamento está implementado com dados demonstrativos. O registro persistente das consultas no back-end está em desenvolvimento.

---

## 🤖 Pré-triagem e inteligência artificial

A pré-triagem foi concebida como uma ferramenta de **orientação inicial**, auxiliando o paciente na identificação de possíveis especialidades de atendimento.

O módulo atualmente contempla:

- Questionário inicial com perguntas sobre o atendimento.
- Interface para entrada de informações pelo paciente.
- Recurso de gravação de áudio pelo navegador.

A transcrição de áudio e a recomendação baseada em inteligência artificial ainda dependem de implementação e integração com serviços específicos.

**A inteligência artificial não deve realizar diagnósticos médicos.**

Exemplo de comunicação adequada:

> Com base nas suas respostas, essa pode ser uma especialidade adequada para o seu atendimento.

A orientação fornecida não substitui a avaliação de um profissional de saúde.

---

## 🛠️ Tecnologias utilizadas

### Front-end

- **React:** construção das interfaces e componentes.
- **Vite:** ambiente de desenvolvimento e ferramenta de build.
- **JavaScript (JSX):** lógica da aplicação.
- **CSS:** estilização dos componentes e responsividade.
- **Fetch API:** comunicação HTTP com o back-end.
- **Plus Jakarta Sans:** tipografia utilizada na interface.

### Back-end e integração

O front-end se comunica com uma API REST externa, responsável por funcionalidades como autenticação e gerenciamento de dados.

**URL da API:**

`https://back-end-pi-ihs1.onrender.com`

**Documentação Swagger:**

`https://back-end-pi-ihs1.onrender.com/api-docs/`

A autenticação utiliza os endpoints:

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticação de usuários |
| GET | `/auth/perfil` | Consulta do perfil autenticado |

O serviço de autenticação contempla os perfis de paciente, profissional e administrador, com suporte a token JWT.

### Endpoints de agendamento

A API disponibiliza:

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/agendamentos` | Listar agendamentos |
| GET | `/agendamentos/paciente/{idPaciente}` | Listar agendamentos do paciente |
| GET | `/agendamentos/{id}` | Consultar agendamento específico |
| POST | `/agendamentos` | Criar agendamento |
| PUT | `/agendamentos/{id}` | Atualizar agendamento |
| PATCH | `/agendamentos/{id}/cancelar` | Cancelar agendamento |
| DELETE | `/agendamentos/{id}` | Excluir agendamento |

**Observação:** A existência desses endpoints na API não significa que todos já estejam integrados ao front-end. A integração de agendamentos está em andamento.

---

## 📁 Estrutura do projeto

A estrutura principal segue a organização:

```text
src/
├── main.jsx
├── App.jsx
│
├── estilos/
│   └── global.css
│
├── componentes/
│   ├── BarraNavegacao/
│   ├── Botao/
│   ├── BotaoVoltar/
│   ├── Cabecalho/
│   ├── CampoTexto/
│   ├── CartaoAcao/
│   ├── CartaoAtendimento/
│   └── CartaoEspecialidade/
│
├── paginas/
│   ├── Login/
│   ├── Cadastro/
│   ├── EsqueciSenha/
│   ├── Inicio/
│   ├── Agendamentos/
│   ├── NovoAgendamento/
│   ├── PreTriagem/
│   ├── PerfilPaciente/
│   └── ... outras telas
│
└── servicos/
    ├── autenticacao.js
    └── consultas.js
```

### Organização do código

O projeto utiliza componentes reutilizáveis e separação por responsabilidades.

- `App.jsx`: controle principal de navegação e estado da aplicação.
- `componentes/`: elementos visuais compartilhados entre páginas.
- `paginas/`: interfaces organizadas por funcionalidade.
- `servicos/`: comunicação com a API e regras de integração.
- `estilos/global.css`: estilos globais, tipografia e variáveis de cores.

Cada componente ou página utiliza, preferencialmente, uma pasta própria com arquivos `.jsx` e `.css`.

---

## 💻 Como executar o projeto

### Pré-requisitos

- Node.js (versão LTS recomendada).
- npm.
- Git.
- Visual Studio Code ou outro editor de código.

### 1. Clonar o repositório

```bash
git clone https://github.com/felipemitchell/Projeto-Consulta-Facil-Frontend.git
```

### 2. Acessar a pasta

```bash
cd Projeto-Consulta-Facil-Frontend
```

### 3. Instalar as dependências

```bash
npm install
```

### 4. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse o endereço informado no terminal, geralmente:

`http://localhost:5173`

> O projeto utiliza React e Vite. Portanto, não deve ser executado pelo Live Server do VS Code.

### Gerar a versão de produção

```bash
npm run build
```

### Visualizar a versão de produção

```bash
npm run preview
```

### Possível erro no PowerShell

Caso o Windows bloqueie a execução de scripts, verifique a política de execução configurada. Se for apropriado para o seu ambiente, utilize:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

## 🗺️ Próximas etapas

O desenvolvimento continuará com foco nas seguintes entregas:

- [ ] Integrar a listagem de consultas do paciente à API.
- [ ] Persistir novos agendamentos no back-end.
- [ ] Integrar o cancelamento de consultas.
- [ ] Integrar o reagendamento.
- [ ] Carregar especialidades, clínicas, profissionais e horários reais.
- [ ] Implementar a lógica de recomendação da pré-triagem.
- [ ] Integrar recursos de transcrição de áudio, quando disponíveis.
- [ ] Integrar notificações reais.
- [ ] Aprimorar validações, tratamento de erros e estados de carregamento.
- [ ] Realizar testes funcionais e de responsividade.
- [ ] Avaliar a configuração completa como Progressive Web App (PWA).

---

## 🔐 Segurança e responsabilidade

O projeto utiliza autenticação para diferenciar os perfis de acesso.

As funcionalidades que envolvem dados de saúde devem observar requisitos de privacidade, segurança da informação e proteção de dados pessoais, especialmente as disposições aplicáveis da **Lei Geral de Proteção de Dados Pessoais (LGPD)**.

O uso da plataforma para fins reais depende de validações técnicas, operacionais e de segurança adicionais.

---

## 👥 Equipe

Projeto desenvolvido por estudantes de **Análise e Desenvolvimento de Sistemas — Faculdade SENAC Pernambuco**.

| Nome | Atuação |
|---|---|
| Felipe Mitchell | Desenvolvimento Front-end |
| Kennedy Veras | Desenvolvimento Front-end |

**Professor(a) orientador(a):** A preencher.

---

## 📚 Contexto acadêmico

**Instituição:** Faculdade SENAC Pernambuco  
**Curso:** Análise e Desenvolvimento de Sistemas  
**Período:** 3º período  
**Disciplina:** Projeto Integrado  
**Natureza:** Projeto acadêmico em desenvolvimento

---

**Saúde Recife | Consulta Fácil** — Tecnologia para facilitar o acesso à saúde.
