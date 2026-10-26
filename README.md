# Consulta Fácil - Documentação Técnica do Frontend

[![Institution](https://img.shields.io/badge/Institution-Senac%20Pernambuco-blue)](https://www.senac.br/)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white) ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)

> **Idiomas:** Português (Brasil) e English
>
> **Aviso:** o Consulta Fácil é um projeto acadêmico em desenvolvimento e não substitui avaliação, diagnóstico ou atendimento médico. Em situações de emergência, ligue **192 (SAMU)**.

---

PT-BR

## 1. Visão geral

Front-end da plataforma de gerenciamento e agendamento de consultas médicas Consulta Fácil, desenvolvido como Projeto Integrador do SENAC Pernambuco (curso de Análise e Desenvolvimento de Sistemas). A aplicação é uma Single Page Application (SPA) responsiva, instalável como PWA, que consome a API REST do back-end e atende três perfis de usuário: paciente, profissional de saúde e administrador.

O projeto foi pensado para um público que inclui pessoas idosas, por isso prioriza telas simples, textos claros, opção de letras maiores e de alto contraste.

O escopo implementado no código inclui:

- tela de boas-vindas, cadastro de paciente e login único (e-mail e senha) para os três perfis;
- área do paciente: pré-triagem orientativa, agendamento de consultas, lista de agendamentos, detalhes, reagendamento, cancelamento, histórico, notificações e perfil;
- área do profissional: início, agenda (calendário mensal e lista do dia), consultas, cadastro de horários disponíveis, notificações e perfil;
- área do administrador: início com totais e atividade recente, exportação de relatório em CSV, gerenciamento de clínicas, de profissionais (com disponibilidade semanal) e de especialidades;
- preferências de acessibilidade (letras maiores e alto contraste), salvas no aparelho;
- menu em abas inferiores no celular e menu lateral no desktop;
- instalação como aplicativo (PWA) com manifesto e service worker;
- integração com a API hospedada no Render, com tratamento de erros por status HTTP.

Back-end e documentação da API: `https://back-end-pi-ihs1.onrender.com` (Swagger em `/api-docs/`).

---

## 2. Stack tecnológica verificada

Versões conforme `package.json`.

| Item | Tecnologia | Versão |
|---|---|---|
| Biblioteca de interface | React e React DOM | `^18.3.1` |
| Build e servidor de desenvolvimento | Vite | `^6.0.0` |
| Integração React com Vite | `@vitejs/plugin-react` | `^4.3.4` |
| PWA (manifesto e service worker) | `vite-plugin-pwa` | `^2.0.0` |
| Fonte | `@fontsource/plus-jakarta-sans` | `^5.1.0` |
| Linguagem | JavaScript (módulos ES e JSX) | n/a |
| Estilos | CSS puro, um arquivo por componente e um global com variáveis | n/a |
| Comunicação com a API | `fetch` nativo | n/a |
| Armazenamento local | `localStorage` (preferências e notificações lidas) | n/a |
| Captura de áudio na pré-triagem | `getUserMedia` e `MediaRecorder` | n/a |

Não utilizados: roteador (React Router), biblioteca de gerenciamento de estado, biblioteca de componentes visuais, TypeScript, ESLint e testes automatizados versionados no repositório.

---

## 3. Arquitetura

### 3.1 Estilo arquitetural

SPA em React com navegação controlada por estado, sem roteador. O componente `App.jsx` guarda a tela atual em `telaAtual` e renderiza o componente correspondente. Os dados da sessão (usuário, paciente, catálogo e consultas) também ficam no `App.jsx` e descem para as telas por props.

```text
main.jsx
   |
App.jsx  (estado global: telaAtual, usuario, paciente, catalogo, consultas)
   |
paginas/  (uma pasta por tela)
   |
componentes/  (peças reutilizáveis)      servicos/  (acesso à API e regras de dados)
                                                |
                                         API REST (back-end)
```

Consequências dessa escolha:

- simples de entender e sem dependências extras;
- não há URL por tela: o botão voltar do navegador e links diretos para uma tela não funcionam;
- atualizar a página encerra a sessão (ver seção 8).

### 3.2 Responsabilidades das camadas

| Camada | Pasta | Responsabilidade |
|---|---|---|
| Entrada | `src/main.jsx` | Monta o React, importa estilos e fonte, aplica as preferências de acessibilidade salvas |
| Orquestração | `src/App.jsx` | Estado global, escolha da tela e ações que envolvem várias telas |
| Telas | `src/paginas/` | Interface e comportamento de cada tela |
| Componentes | `src/componentes/` | Botões, campos, menus, cartões, painel de notificações, logo e outros |
| Serviços | `src/servicos/` | Chamadas à API, leitura dos campos recebidos, validações e regras de dados |
| Estilos globais | `src/estilos/global.css` | Variáveis de cor, fonte, alto contraste e letras maiores |
| Recursos | `src/assets/` e `public/` | Logo, favicon e ícones do aplicativo |

### 3.3 Padrões observados

- **Serviços sem interface:** as telas não chamam `fetch` diretamente. Toda comunicação passa por `src/servicos/`.
- **Funções "ler":** funções como `lerProfissional`, `lerClinica` e `lerEspecialidade` convertem o formato da API para o formato usado nas telas, aceitando nomes alternativos de campo.
- **Verificação após escrita:** ao ativar ou desativar uma clínica, profissional ou especialidade, o app consulta a lista de novo e só informa sucesso se o servidor realmente aplicou a mudança.
- **Mensagens do servidor:** em respostas 400 e 409, a mensagem enviada pelo back-end (campo `erro`) é exibida ao usuário. Nos demais status, o app usa mensagens próprias.
- **CSS por tela com prefixo:** cada tela usa um prefixo de classe (`admin-`, `clinicas-`, `equipe-`, `menu-admin-` e outros) para evitar colisão, já que o CSS é global.
- **Armazenamento tolerante a falhas:** leituras e escritas no `localStorage` ficam dentro de `try/catch`, e o app funciona sem ele.

### 3.4 Estrutura de pastas

```text
.
|-- index.html
|-- package.json
|-- vite.config.js              # React + PWA (manifesto e service worker)
|-- public/                     # favicon, apple-touch-icon e ícones do PWA
`-- src/
    |-- main.jsx
    |-- App.jsx
    |-- assets/                 # logo.png
    |-- estilos/
    |   `-- global.css          # variáveis de cor, fonte, alto contraste, letras maiores
    |-- componentes/
    |   |-- AvisoToast/         # aviso temporário de sucesso ou erro
    |   |-- BarraNavegacao/     # abas inferiores (paciente e profissional)
    |   |-- Botao/  BotaoVoltar/  CampoTexto/  Cabecalho/
    |   |-- CartaoAcao/  CartaoAtendimento/  CartaoEspecialidade/  LinhaInfo/
    |   |-- FolhaConfirmacao/   # confirmação de ações (ativar, desativar, cancelar)
    |   |-- Logo/
    |   |-- MenuAdmin/          # abas inferiores no celular e botão do menu no desktop
    |   |-- MenuLateral/        # menu lateral aberto pelo botão de três linhas
    |   |-- PainelNotificacoes/
    |   `-- TelaEmConstrucao/
    |-- paginas/
    |   |-- BoasVindas/  Login/  Cadastro/Paciente/  EsqueciSenha/
    |   |-- Inicio/  PreTriagem/  NovoAgendamento/  Agendamentos/
    |   |-- Detalhes/  Reagendar/  HorariosDisponiveis/  Historico/  PerfilPaciente/
    |   |-- InicioProfissional/  Agenda/  Consultas/  DetalhesConsulta/  Horarios/  Perfil/
    |   `-- InicioAdmin/  ClinicasAdmin/  EquipeAdmin/  EspecialidadesAdmin/
    `-- servicos/
        |-- autenticacao.js     # login, perfil, URL da API
        |-- paciente.js  consultas.js  catalogo.js  preferencias.js  notificacoesPaciente.js
        |-- profissional.js  agenda.js  disponibilidade.js  notificacoes.js
        |-- admin.js  clinicasAdmin.js  equipeAdmin.js  especialidades.js
        `-- datas.js  datasConsultas.js  formatos.js
```

---

## 4. Configuração e execução

### 4.1 Pré-requisitos

- Node.js 18 ou superior (requisito do Vite 6). O build foi verificado com Node.js 22.
- npm.
- Acesso à internet, pois a API é a instância publicada no Render.

### 4.2 Endereço da API

Não há variáveis de ambiente lidas pelo código (o `.env` está no `.gitignore`, mas nenhum arquivo o utiliza). O endereço da API está escrito diretamente em três pontos:

| Arquivo | Uso |
|---|---|
| `src/servicos/autenticacao.js` | constante `URL_API`, usada por quase todas as chamadas |
| `src/paginas/Cadastro/Paciente/CadastroPaciente.jsx` | cadastro de paciente |
| `src/paginas/EsqueciSenha/EsqueciSenha.jsx` | recuperação de senha |

Para apontar o front-end para outra API (por exemplo, o back-end rodando em `http://localhost:3000`), altere os três pontos. Centralizar tudo em uma variável de ambiente do Vite (`import.meta.env.VITE_API_URL`) é uma melhoria recomendada.

### 4.3 Instalação e execução

```bash
npm install
npm run dev
```

O Vite informa o endereço no terminal (por padrão, `http://localhost:5173`).

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com recarga automática |
| `npm run build` | Gera a versão de produção na pasta `dist/`, incluindo o service worker |
| `npm run preview` | Serve a pasta `dist/` localmente para testar o build |

Em modo de desenvolvimento, as respostas cruas da API são registradas no console do navegador com o prefixo `[API]`, o que ajuda a conferir nomes de campo.

### 4.4 Contas de teste

Criadas pelo `seed.js` do back-end (ver a documentação do back-end, seção 4.5). Valem apenas para o ambiente de teste.

| Perfil | E-mail | Senha |
|---|---|---|
| ADMIN | `admin@consultafacil.com` | `Admin@123` |
| PROFISSIONAL | `mariana.costa@consulta.com.br` | `Profissional@123` |
| PACIENTE | `lucas.ferreira@consulta.com.br` | `123456` |

Os dados de exemplo têm datas entre `2026-10-05` e `2026-10-12`. Para testar o agendamento com datas futuras, cadastre disponibilidades na área do profissional ou do administrador.

### 4.5 PWA

O `vite.config.js` usa o `vite-plugin-pwa` com atualização automática (`registerType: 'autoUpdate'`). O manifesto define nome "Consulta Fácil", modo `standalone` e os ícones de 192 e 512 pixels da pasta `public/`. O service worker guarda em cache os arquivos estáticos (JavaScript, CSS, HTML, imagens e fontes). As chamadas à API não são guardadas em cache, então o app exige conexão para listar e alterar dados. A instalação como aplicativo exige que o site seja servido por HTTPS (ou `localhost`).

---

## 5. Telas e fluxos por perfil

O identificador abaixo é o valor de `telaAtual` em `App.jsx`.

### 5.1 Acesso (todos os perfis)

| Tela | Identificador | Função |
|---|---|---|
| Boas-vindas | `boas-vindas` | Entrada do app, com acesso ao cadastro e ao login |
| Cadastro de paciente | `cadastro-paciente` | Cria o paciente (`POST /pacientes`) |
| Login | `login` | Autentica e direciona para a área do perfil retornado pela API |
| Esqueci minha senha | `esqueci-senha`, `email-enviado` | Interface pronta, mas depende de rota inexistente no back-end (seção 10) |

### 5.2 Paciente

| Tela | Identificador | Função |
|---|---|---|
| Início | `inicio` | Próximo atendimento, acesso à pré-triagem, busca e especialidades rápidas |
| Pré-triagem | `pre-triagem` | Questionário orientativo de 5 etapas (resposta escrita ou em áudio gravado no aparelho), com alerta de emergência (SAMU 192) e atalho para agendar |
| Novo agendamento | `novo-agendamento` | Escolha de especialidade, profissional, data e horário e confirmação |
| Agendamentos | `agendamentos` | Lista das consultas futuras ainda ativas |
| Detalhes | `detalhes-agendamento` | Dados da consulta, cancelamento e reagendamento |
| Reagendar | `reagendar`, `horarios-disponiveis` | Escolha de nova data e horário |
| Histórico | `historico` | Consultas realizadas, canceladas ou já passadas, com filtro por período |
| Notificações e perfil | `notificacoes`, `perfil-paciente` | Dados pessoais, troca de senha, letras maiores, alto contraste, lembretes |

### 5.3 Profissional

| Tela | Identificador | Função |
|---|---|---|
| Início | `inicio-profissional` | Resumo do dia e notificações |
| Agenda | `agenda-profissional` | Calendário mensal e lista do dia |
| Consultas | `consultas-profissional` | Lista com filtros de situação |
| Detalhes da consulta | `detalhes-consulta` | Confirmar ou cancelar a consulta |
| Horários | `horarios-profissional` | Cadastro e exclusão de horários de atendimento |
| Perfil | `perfil-profissional` | Dados cadastrais e edição de telefone e e-mail |

### 5.4 Administrador

| Tela | Identificador | Função |
|---|---|---|
| Início | `inicio-admin` | Totais de clínicas, profissionais, especialidades e usuários, atividade recente e exportação de relatório CSV por período |
| Clínicas | `clinicas-admin` | Listar, cadastrar, editar, ativar e desativar |
| Equipe | `equipe-admin` | Listar, cadastrar e editar profissionais (com senha de acesso), ativar e desativar, e definir disponibilidade em grade semanal |
| Especialidades | `especialidades-admin` | Listar, cadastrar, editar, ativar e desativar |

---

## 6. Integração com a API

### 6.1 Convenções

- URL base: `https://back-end-pi-ihs1.onrender.com`.
- Formato: JSON.
- Rotas protegidas recebem `Authorization: Bearer <token>`. O token é o JWT retornado pelo login.
- Erros do back-end seguem o formato `{ "erro": "mensagem" }`.
- As listas podem vir como vetor direto ou dentro de um objeto; o app aceita os dois formatos (`comoLista` em `servicos/profissional.js`).

### 6.2 Rotas consumidas

| Rota | Método | Uso no front-end | Arquivo |
|---|---|---|---|
| `/auth/login` | POST | Login dos três perfis | `autenticacao.js` |
| `/auth/perfil` | GET | Descobrir id e nome do usuário quando o login não traz | `autenticacao.js`, `paciente.js`, `profissional.js` |
| `/pacientes` | POST | Cadastro de paciente | `CadastroPaciente.jsx` |
| `/pacientes` | GET | Contagem de usuários e relatório (admin) | `admin.js` |
| `/pacientes/{id}` | GET, PUT | Perfil, edição de dados e troca de senha | `paciente.js` |
| `/administradores` | GET | Contagem de usuários (admin) | `admin.js` |
| `/especialidades` | GET, POST | Listar e cadastrar | `especialidades.js` |
| `/especialidades/{id}` | PUT | Editar e ativar ou desativar | `especialidades.js` |
| `/clinicas` | GET, POST | Listar e cadastrar | `clinicasAdmin.js`, `catalogo.js` |
| `/clinicas/{id}` | GET, PUT | Detalhe, edição e ativar ou desativar | `profissional.js`, `clinicasAdmin.js` |
| `/profissionais` | GET, POST | Listar e cadastrar | `catalogo.js`, `equipeAdmin.js` |
| `/profissionais/{id}` | GET, PUT | Detalhe, edição, ativar ou desativar e perfil do profissional | `profissional.js`, `equipeAdmin.js` |
| `/disponibilidades` | GET, POST | Listar e cadastrar horários | `catalogo.js`, `disponibilidade.js` |
| `/disponibilidades/{id}` | GET, DELETE | Detalhe e exclusão | `paciente.js`, `disponibilidade.js` |
| `/disponibilidades/profissional/{id}` | GET | Horários de um profissional | `catalogo.js`, `profissional.js` |
| `/agendamentos` | GET, POST | Listar e criar agendamento | `profissional.js`, `admin.js`, `catalogo.js` |
| `/agendamentos/{id}` | GET, PUT | Detalhe e confirmação (`status: CONFIRMADO`) | `profissional.js` |
| `/agendamentos/{id}/cancelar` | PATCH | Cancelar | `profissional.js` |
| `/agendamentos/paciente/{id}` | GET | Consultas do paciente | `consultas.js` |

### 6.3 Funcionalidades que o front-end resolve sozinho

A API não oferece estas rotas, então o front-end as implementa por conta própria:

| Funcionalidade | Como é resolvida |
|---|---|
| Reagendamento | Cria o novo agendamento e, em seguida, cancela o antigo. Se a criação falhar, nada muda |
| Notificações (paciente e profissional) | Geradas no navegador a partir dos agendamentos; o estado "lida" fica no `localStorage` |
| Preferências de acessibilidade | Guardadas no `localStorage` (`consultaFacil:preferencias`) |
| Relatório CSV | Gerado no navegador a partir da lista de agendamentos, com separador `;` e proteção contra injeção de fórmulas |
| Disponibilidade semanal do profissional | A API guarda disponibilidade por data. A grade Seg a Sáb cria um registro em cada data correspondente nas próximas 4 semanas (`HORIZONTE_DIAS`) |
| Troca de senha do paciente | Confere a senha atual fazendo login e depois envia a nova por `PUT /pacientes/{id}` |

### 6.4 Tratamento de erros

| Situação | Comportamento |
|---|---|
| Falha de rede | "Não foi possível conectar ao servidor." |
| 400 e 409 | Mostra a mensagem do campo `erro` do back-end, quando existe |
| 401 | Mensagem de sessão expirada ou credenciais incorretas, conforme a tela |
| 403 | Conta inativa (login) ou falta de permissão |
| 404 e demais | Mensagens próprias de cada fluxo |
| Carregamento parcial | Telas com várias consultas informam o que não carregou, em vez de mostrar uma lista vazia |

---

## 7. Regras de negócio aplicadas no front-end

- **Clínica desativada:** não aparece para o paciente no agendamento, e os profissionais dela somem junto. Consultas já marcadas nela não podem ser reagendadas, apenas canceladas.
- **Especialidade desativada:** não aparece para o paciente nem na lista de opções do cadastro de profissional. Consultas já marcadas não podem ser reagendadas.
- **Profissional desativado:** não aparece para o paciente. O back-end também bloqueia o login dele.
- **Opções de especialidade:** os seletores usam apenas as especialidades ativas do cadastro do administrador. Na edição, a especialidade atual aparece marcada como inativa, se for o caso.
- **Cadastro de profissional:** exige nome, CPF (11 números), conselho, registro, especialidade, clínica, e-mail e senha de pelo menos 8 caracteres. O telefone é opcional.
- **Horários reservados:** nunca são alterados nem excluídos pela grade de disponibilidade. A exclusão de um horário que já teve consulta marcada é recusada pelo servidor.
- **Cancelamento:** consulta já cancelada ou realizada não pode ser cancelada (o servidor responde 409 e o app exibe o motivo).
- **Validações de formulário:** CPF, telefone e e-mail são conferidos no navegador antes do envio (`servicos/formatos.js`), e o back-end repete as validações.

---

## 8. Autenticação, sessão e segurança

### 8.1 Fluxo

1. A tela de login envia `POST /auth/login` com e-mail e senha.
2. A API devolve `{ mensagem, token, usuario: { id, nome, email, perfil } }`, com `perfil` igual a `PACIENTE`, `PROFISSIONAL` ou `ADMIN`.
3. O `App.jsx` guarda o usuário (com o token) no estado e abre a área do perfil.
4. Cada chamada protegida envia `Authorization: Bearer <token>`.
5. Ao sair, o estado é limpo.

O token JWT tem validade configurada no back-end (8 horas por padrão, segundo a documentação do back-end).

### 8.2 O que fica guardado no navegador

| Dado | Onde | Observação |
|---|---|---|
| Token e dados do usuário | Memória do React | Não são gravados no navegador. Atualizar a página encerra a sessão |
| Preferências de acessibilidade e lembretes | `localStorage` | Valem também antes do login |
| Notificações lidas | `localStorage` | Uma chave por usuário |

### 8.3 Segurança e limitações

- Esconder telas ou botões no front-end é apenas experiência de uso. A segurança real depende de validação no servidor (autenticação e perfil por rota).
- Na versão do back-end analisada, apenas as rotas de administradores e `/auth/perfil` exigem autenticação. As demais rotas (pacientes, clínicas, profissionais, especialidades, disponibilidades e agendamentos) respondem sem token. Esse ponto deve ser tratado no back-end.
- O token não é gravado no `localStorage`, o que reduz a exposição a scripts maliciosos, ao custo de exigir novo login após recarregar a página.
- O React escapa o conteúdo exibido por padrão e o código não usa `dangerouslySetInnerHTML`.
- Os relatórios CSV neutralizam células que começam com caracteres de fórmula.

---

## 9. Responsividade, acessibilidade e PWA

### 9.1 Responsividade

O CSS parte do layout de celular e amplia com `@media (min-width)`.

| Largura | Layout |
|---|---|
| Abaixo de 700 px | Coluna única de até 430 px, abas de navegação na parte inferior |
| 700 px a 1023 px | Conteúdo centralizado com até 700 px, abas inferiores mantidas |
| 1024 px ou mais | Conteúdo de até 960 px, abas inferiores somem e o botão de três linhas abre o menu lateral |

### 9.2 Acessibilidade

- **Letras maiores:** altera o tamanho-base do texto (unidade `rem`), então o app inteiro acompanha. Ativada por `html[data-fonte="grande"]`.
- **Alto contraste:** troca as cores por um tema de maior contraste e reforça o contorno de foco. Ativado por `html[data-contraste="alto"]`.
- Botões de ícone com `aria-label`, campos com rótulo e mensagens de erro com `role="alert"`.
- Menu lateral fechado fora da ordem de tabulação.

Referência: [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/). O projeto não passou por auditoria formal de acessibilidade.

---

## 10. Limitações conhecidas e próximos passos

| Item | Situação |
|---|---|
| Recuperação de senha | A tela existe, mas a rota `POST /recuperar-senha` não existe no back-end. O app mostra uma mensagem orientando a procurar a unidade de saúde |
| Proteção das rotas | Rotas sem autenticação no back-end (seção 8.3) |
| Sessão | Perdida ao atualizar a página (token só em memória) |
| Navegação | Sem URLs por tela. Migrar para React Router permitiria links diretos e botão voltar do navegador |
| Endereço da API | Escrito em três arquivos (seção 4.2). Ideal: variável de ambiente |
| Notificações | Geradas no front-end, sem envio real (push, e-mail ou SMS) |
| Pré-triagem | Questionário orientativo. Não há recomendação automática de especialidade |
| Reagendamento | Feito em duas etapas (agenda e cancela), pois a API não tem rota de reagendamento |
| Testes | Não há testes automatizados versionados no repositório |
| Exclusão | O app desativa, mas não exclui clínicas, profissionais e especialidades |
| Áudio da pré-triagem | É gravado apenas no aparelho e não é enviado |
| Manifesto PWA | O idioma do manifesto gerado é `en`. Pode ser ajustado com a opção `lang: 'pt-BR'` no `vite.config.js` |

---

## 11. Implantação

| Componente | Situação |
|---|---|
| Código-fonte | GitHub (repositório do front-end da equipe) |
| Back-end | Render: `https://back-end-pi-ihs1.onrender.com` |
| Documentação da API | Swagger em `/api-docs/` |
| Publicação do front-end | A informar pela equipe |
| Build | `npm run build` gera a pasta `dist/` com arquivos estáticos, que podem ser servidos por qualquer hospedagem estática com HTTPS |

---

## Integrantes

Projeto desenvolvido para a disciplina de Projeto Integrador, SENAC Pernambuco.

**Backend**

- Rejane Ferreira de Mendonça
- Ericha Tainá

**Frontend**

- Kennedy Veras
- Flávio Gonçalves
- Felipe Mitchell

---


---

ENG

## 1. Overview

Front end of Consulta Fácil, a platform for managing and booking medical appointments, developed as an Integrated Project at SENAC Pernambuco (Systems Analysis and Development program). The application is a responsive Single Page Application (SPA), installable as a PWA, that consumes the back-end REST API and serves three user profiles: patient, healthcare professional and administrator.

The project was designed for an audience that includes elderly people, so it favors simple screens, clear text, and options for larger text and high contrast.

The scope implemented in the code includes:

- welcome screen, patient sign-up and a single login (e-mail and password) for the three profiles;
- patient area: guidance-only pre-triage, appointment booking, appointment list, details, rescheduling, cancellation, history, notifications and profile;
- professional area: home, schedule (monthly calendar and daily list), appointments, availability management, notifications and profile;
- administrator area: home with totals and recent activity, CSV report export, management of clinics, professionals (with weekly availability) and specialties;
- accessibility preferences (larger text and high contrast), saved on the device;
- bottom tab navigation on mobile and a side menu on desktop;
- installation as an app (PWA) with a manifest and a service worker;
- integration with the API hosted on Render, with error handling by HTTP status.

Back end and API documentation: `https://back-end-pi-ihs1.onrender.com` (Swagger at `/api-docs/`).

---

## 2. Verified technology stack

Versions according to `package.json`.

| Item | Technology | Version |
|---|---|---|
| UI library | React and React DOM | `^18.3.1` |
| Build tool and dev server | Vite | `^6.0.0` |
| React integration for Vite | `@vitejs/plugin-react` | `^4.3.4` |
| PWA (manifest and service worker) | `vite-plugin-pwa` | `^2.0.0` |
| Font | `@fontsource/plus-jakarta-sans` | `^5.1.0` |
| Language | JavaScript (ES modules and JSX) | n/a |
| Styling | Plain CSS, one file per component plus a global file with variables | n/a |
| API communication | Native `fetch` | n/a |
| Local storage | `localStorage` (preferences and read notifications) | n/a |
| Audio capture in pre-triage | `getUserMedia` and `MediaRecorder` | n/a |

Not used: a router (React Router), a state management library, a visual component library, TypeScript, ESLint, and automated tests versioned in the repository.

---

## 3. Architecture

### 3.1 Architectural style

React SPA with state-driven navigation and no router. The `App.jsx` component keeps the current screen in `telaAtual` and renders the matching component. Session data (user, patient, catalog and appointments) also lives in `App.jsx` and is passed down to the screens through props.

```text
main.jsx
   |
App.jsx  (global state: telaAtual, usuario, paciente, catalogo, consultas)
   |
paginas/  (one folder per screen)
   |
componentes/  (reusable pieces)          servicos/  (API access and data rules)
                                                |
                                         REST API (back end)
```

Consequences of this choice:

- simple to understand, with no extra dependencies;
- there is no URL per screen: the browser back button and direct links to a screen do not work;
- reloading the page ends the session (see section 8).

### 3.2 Layer responsibilities

| Layer | Folder | Responsibility |
|---|---|---|
| Entry | `src/main.jsx` | Mounts React, imports styles and font, applies saved accessibility preferences |
| Orchestration | `src/App.jsx` | Global state, screen selection and actions spanning several screens |
| Screens | `src/paginas/` | Interface and behavior of each screen |
| Components | `src/componentes/` | Buttons, fields, menus, cards, notification panel, logo and others |
| Services | `src/servicos/` | API calls, reading of received fields, validations and data rules |
| Global styles | `src/estilos/global.css` | Color variables, font, high contrast and larger text |
| Assets | `src/assets/` and `public/` | Logo, favicon and app icons |

### 3.3 Observed patterns

- **Services without UI:** screens do not call `fetch` directly. All communication goes through `src/servicos/`.
- **"ler" (read) functions:** functions such as `lerProfissional`, `lerClinica` and `lerEspecialidade` convert the API format into the format used by the screens, accepting alternative field names.
- **Verification after write:** when activating or deactivating a clinic, professional or specialty, the app reloads the list and only reports success if the server actually applied the change.
- **Server messages:** on 400 and 409 responses, the message sent by the back end (the `erro` field) is shown to the user. For other statuses, the app uses its own messages.
- **Prefixed CSS per screen:** each screen uses a class prefix (`admin-`, `clinicas-`, `equipe-`, `menu-admin-` and others) to avoid collisions, since the CSS is global.
- **Failure-tolerant storage:** reads and writes to `localStorage` are wrapped in `try/catch`, and the app works without it.

### 3.4 Folder structure

```text
.
|-- index.html
|-- package.json
|-- vite.config.js              # React + PWA (manifest and service worker)
|-- public/                     # favicon, apple-touch-icon and PWA icons
`-- src/
    |-- main.jsx
    |-- App.jsx
    |-- assets/                 # logo.png
    |-- estilos/
    |   `-- global.css          # color variables, font, high contrast, larger text
    |-- componentes/
    |   |-- AvisoToast/         # temporary success or error notice
    |   |-- BarraNavegacao/     # bottom tabs (patient and professional)
    |   |-- Botao/  BotaoVoltar/  CampoTexto/  Cabecalho/
    |   |-- CartaoAcao/  CartaoAtendimento/  CartaoEspecialidade/  LinhaInfo/
    |   |-- FolhaConfirmacao/   # action confirmation (activate, deactivate, cancel)
    |   |-- Logo/
    |   |-- MenuAdmin/          # bottom tabs on mobile and menu button on desktop
    |   |-- MenuLateral/        # side menu opened by the three-line button
    |   |-- PainelNotificacoes/
    |   `-- TelaEmConstrucao/
    |-- paginas/
    |   |-- BoasVindas/  Login/  Cadastro/Paciente/  EsqueciSenha/
    |   |-- Inicio/  PreTriagem/  NovoAgendamento/  Agendamentos/
    |   |-- Detalhes/  Reagendar/  HorariosDisponiveis/  Historico/  PerfilPaciente/
    |   |-- InicioProfissional/  Agenda/  Consultas/  DetalhesConsulta/  Horarios/  Perfil/
    |   `-- InicioAdmin/  ClinicasAdmin/  EquipeAdmin/  EspecialidadesAdmin/
    `-- servicos/
        |-- autenticacao.js     # login, profile, API URL
        |-- paciente.js  consultas.js  catalogo.js  preferencias.js  notificacoesPaciente.js
        |-- profissional.js  agenda.js  disponibilidade.js  notificacoes.js
        |-- admin.js  clinicasAdmin.js  equipeAdmin.js  especialidades.js
        `-- datas.js  datasConsultas.js  formatos.js
```

---

## 4. Setup and execution

### 4.1 Prerequisites

- Node.js 18 or later (a Vite 6 requirement). The build was verified with Node.js 22.
- npm.
- Internet access, since the API is the instance published on Render.

### 4.2 API address

No environment variables are read by the code (`.env` is listed in `.gitignore`, but no file uses it). The API address is written directly in three places:

| File | Use |
|---|---|
| `src/servicos/autenticacao.js` | `URL_API` constant, used by almost every call |
| `src/paginas/Cadastro/Paciente/CadastroPaciente.jsx` | patient sign-up |
| `src/paginas/EsqueciSenha/EsqueciSenha.jsx` | password recovery |

To point the front end to another API (for example, the back end running at `http://localhost:3000`), change the three places. Centralizing them in a Vite environment variable (`import.meta.env.VITE_API_URL`) is a recommended improvement.

### 4.3 Installation and execution

```bash
npm install
npm run dev
```

Vite prints the address in the terminal (by default, `http://localhost:5173`).

| Command | Purpose |
|---|---|
| `npm run dev` | Development server with automatic reload |
| `npm run build` | Generates the production build in `dist/`, including the service worker |
| `npm run preview` | Serves `dist/` locally to test the build |

In development mode, raw API responses are logged to the browser console with the `[API]` prefix, which helps checking field names.

### 4.4 Test accounts

Created by the back end `seed.js` (see the back-end documentation, section 4.5). Valid only for the test environment.

| Profile | E-mail | Password |
|---|---|---|
| ADMIN | `admin@consultafacil.com` | `Admin@123` |
| PROFISSIONAL | `mariana.costa@consulta.com.br` | `Profissional@123` |
| PACIENTE | `lucas.ferreira@consulta.com.br` | `123456` |

The sample data has dates between `2026-10-05` and `2026-10-12`. To test booking with future dates, create availability slots in the professional or administrator area.

### 4.5 PWA

`vite.config.js` uses `vite-plugin-pwa` with automatic updates (`registerType: 'autoUpdate'`). The manifest defines the name "Consulta Fácil", `standalone` display mode and the 192 and 512 pixel icons from `public/`. The service worker caches static files (JavaScript, CSS, HTML, images and fonts). API calls are not cached, so the app needs a connection to list and change data. Installing it as an app requires the site to be served over HTTPS (or `localhost`).

---

## 5. Screens and flows by profile

The identifier below is the value of `telaAtual` in `App.jsx`.

### 5.1 Access (all profiles)

| Screen | Identifier | Purpose |
|---|---|---|
| Welcome | `boas-vindas` | App entry, with access to sign-up and login |
| Patient sign-up | `cadastro-paciente` | Creates the patient (`POST /pacientes`) |
| Login | `login` | Authenticates and routes to the area of the profile returned by the API |
| Forgot password | `esqueci-senha`, `email-enviado` | Interface ready, but depends on a route that does not exist in the back end (section 10) |

### 5.2 Patient

| Screen | Identifier | Purpose |
|---|---|---|
| Home | `inicio` | Next appointment, access to pre-triage, search and quick specialties |
| Pre-triage | `pre-triagem` | Guidance-only questionnaire in 5 steps (written answer or audio recorded on the device), with an emergency alert (SAMU 192) and a shortcut to book |
| New appointment | `novo-agendamento` | Choice of specialty, professional, date and time, and confirmation |
| Appointments | `agendamentos` | List of active upcoming appointments |
| Details | `detalhes-agendamento` | Appointment data, cancellation and rescheduling |
| Reschedule | `reagendar`, `horarios-disponiveis` | Choice of a new date and time |
| History | `historico` | Completed, cancelled or past appointments, with a period filter |
| Notifications and profile | `notificacoes`, `perfil-paciente` | Personal data, password change, larger text, high contrast, reminders |

### 5.3 Professional

| Screen | Identifier | Purpose |
|---|---|---|
| Home | `inicio-profissional` | Daily summary and notifications |
| Schedule | `agenda-profissional` | Monthly calendar and daily list |
| Appointments | `consultas-profissional` | List with status filters |
| Appointment details | `detalhes-consulta` | Confirm or cancel the appointment |
| Availability | `horarios-profissional` | Create and delete service time slots |
| Profile | `perfil-profissional` | Registration data and editing of phone and e-mail |

### 5.4 Administrator

| Screen | Identifier | Purpose |
|---|---|---|
| Home | `inicio-admin` | Totals of clinics, professionals, specialties and users, recent activity and CSV report export by period |
| Clinics | `clinicas-admin` | List, create, edit, activate and deactivate |
| Team | `equipe-admin` | List, create and edit professionals (with an access password), activate and deactivate, and set availability in a weekly grid |
| Specialties | `especialidades-admin` | List, create, edit, activate and deactivate |

---

## 6. API integration

### 6.1 Conventions

- Base URL: `https://back-end-pi-ihs1.onrender.com`.
- Format: JSON.
- Protected routes receive `Authorization: Bearer <token>`. The token is the JWT returned by the login.
- Back-end errors follow the format `{ "erro": "message" }`.
- Lists may come as a plain array or inside an object; the app accepts both (`comoLista` in `servicos/profissional.js`).

### 6.2 Consumed routes

| Route | Method | Use in the front end | File |
|---|---|---|---|
| `/auth/login` | POST | Login for the three profiles | `autenticacao.js` |
| `/auth/perfil` | GET | Find the user id and name when the login does not provide them | `autenticacao.js`, `paciente.js`, `profissional.js` |
| `/pacientes` | POST | Patient sign-up | `CadastroPaciente.jsx` |
| `/pacientes` | GET | User count and report (admin) | `admin.js` |
| `/pacientes/{id}` | GET, PUT | Profile, data editing and password change | `paciente.js` |
| `/administradores` | GET | User count (admin) | `admin.js` |
| `/especialidades` | GET, POST | List and create | `especialidades.js` |
| `/especialidades/{id}` | PUT | Edit and activate or deactivate | `especialidades.js` |
| `/clinicas` | GET, POST | List and create | `clinicasAdmin.js`, `catalogo.js` |
| `/clinicas/{id}` | GET, PUT | Detail, edit and activate or deactivate | `profissional.js`, `clinicasAdmin.js` |
| `/profissionais` | GET, POST | List and create | `catalogo.js`, `equipeAdmin.js` |
| `/profissionais/{id}` | GET, PUT | Detail, edit, activate or deactivate and professional profile | `profissional.js`, `equipeAdmin.js` |
| `/disponibilidades` | GET, POST | List and create time slots | `catalogo.js`, `disponibilidade.js` |
| `/disponibilidades/{id}` | GET, DELETE | Detail and deletion | `paciente.js`, `disponibilidade.js` |
| `/disponibilidades/profissional/{id}` | GET | Time slots of one professional | `catalogo.js`, `profissional.js` |
| `/agendamentos` | GET, POST | List and create appointments | `profissional.js`, `admin.js`, `catalogo.js` |
| `/agendamentos/{id}` | GET, PUT | Detail and confirmation (`status: CONFIRMADO`) | `profissional.js` |
| `/agendamentos/{id}/cancelar` | PATCH | Cancel | `profissional.js` |
| `/agendamentos/paciente/{id}` | GET | Patient appointments | `consultas.js` |

### 6.3 Features the front end solves on its own

The API does not offer these routes, so the front end implements them itself:

| Feature | How it is solved |
|---|---|
| Rescheduling | Creates the new appointment and then cancels the old one. If creation fails, nothing changes |
| Notifications (patient and professional) | Generated in the browser from appointments; the "read" state is kept in `localStorage` |
| Accessibility preferences | Stored in `localStorage` (`consultaFacil:preferencias`) |
| CSV report | Generated in the browser from the appointment list, with `;` as separator and protection against formula injection |
| Professional weekly availability | The API stores availability by date. The Mon to Sat grid creates one record on each matching date over the next 4 weeks (`HORIZONTE_DIAS`) |
| Patient password change | Checks the current password by logging in, then sends the new one through `PUT /pacientes/{id}` |

### 6.4 Error handling

| Situation | Behavior |
|---|---|
| Network failure | "Could not connect to the server." (shown in Portuguese in the app) |
| 400 and 409 | Shows the back end `erro` message, when present |
| 401 | Expired session or wrong credentials message, depending on the screen |
| 403 | Inactive account (login) or lack of permission |
| 404 and others | Messages specific to each flow |
| Partial loading | Screens that load several resources report what failed to load instead of showing an empty list |

---

## 7. Business rules applied in the front end

- **Deactivated clinic:** it does not appear to the patient when booking, and its professionals disappear with it. Appointments already booked there cannot be rescheduled, only cancelled.
- **Deactivated specialty:** it does not appear to the patient or in the specialty options of the professional form. Appointments already booked cannot be rescheduled.
- **Deactivated professional:** it does not appear to the patient. The back end also blocks their login.
- **Specialty options:** the selectors use only the active specialties from the administrator registry. When editing, the current specialty is shown as inactive, if applicable.
- **Professional registration:** requires name, CPF (11 digits), council, registration number, specialty, clinic, e-mail and a password of at least 8 characters. Phone is optional.
- **Booked slots:** they are never changed or deleted by the availability grid. Deleting a slot that has had an appointment is refused by the server.
- **Cancellation:** an appointment that is already cancelled or completed cannot be cancelled (the server answers 409 and the app shows the reason).
- **Form validation:** CPF, phone and e-mail are checked in the browser before submission (`servicos/formatos.js`), and the back end repeats the validations.

---

## 8. Authentication, session and security

### 8.1 Flow

1. The login screen sends `POST /auth/login` with e-mail and password.
2. The API returns `{ mensagem, token, usuario: { id, nome, email, perfil } }`, where `perfil` is `PACIENTE`, `PROFISSIONAL` or `ADMIN`.
3. `App.jsx` keeps the user (with the token) in state and opens the profile area.
4. Every protected call sends `Authorization: Bearer <token>`.
5. On logout, the state is cleared.

The JWT lifetime is configured in the back end (8 hours by default, according to the back-end documentation).

### 8.2 What is stored in the browser

| Data | Where | Note |
|---|---|---|
| Token and user data | React memory | Not written to the browser. Reloading the page ends the session |
| Accessibility preferences and reminders | `localStorage` | Also apply before login |
| Read notifications | `localStorage` | One key per user |

### 8.3 Security and limitations

- Hiding screens or buttons in the front end is only a usability measure. Real security depends on server-side validation (authentication and profile per route).
- In the back-end version analyzed, only the administrators routes and `/auth/perfil` require authentication. The other routes (patients, clinics, professionals, specialties, availability and appointments) respond without a token. This must be addressed in the back end.
- The token is not stored in `localStorage`, which reduces exposure to malicious scripts, at the cost of requiring a new login after reloading the page.
- React escapes displayed content by default and the code does not use `dangerouslySetInnerHTML`.
- CSV reports neutralize cells that start with formula characters.

---

## 9. Responsiveness, accessibility and PWA

### 9.1 Responsiveness

The CSS starts from the mobile layout and expands with `@media (min-width)`.

| Width | Layout |
|---|---|
| Below 700 px | Single column up to 430 px, navigation tabs at the bottom |
| 700 px to 1023 px | Centered content up to 700 px, bottom tabs kept |
| 1024 px or more | Content up to 960 px, bottom tabs disappear and the three-line button opens the side menu |

### 9.2 Accessibility

- **Larger text:** changes the base text size (`rem` unit), so the whole app follows. Enabled by `html[data-fonte="grande"]`.
- **High contrast:** swaps colors for a higher-contrast theme and strengthens the focus outline. Enabled by `html[data-contraste="alto"]`.
- Icon buttons with `aria-label`, labeled fields and error messages with `role="alert"`.
- Closed side menu kept out of the tab order.

Reference: [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/). The project has not gone through a formal accessibility audit.

---

## 10. Known limitations and next steps

| Item | Status |
|---|---|
| Password recovery | The screen exists, but the `POST /recuperar-senha` route does not exist in the back end. The app shows a message telling the user to contact the health unit |
| Route protection | Routes without authentication in the back end (section 8.3) |
| Session | Lost on page reload (token only in memory) |
| Navigation | No URL per screen. Migrating to React Router would allow direct links and the browser back button |
| API address | Written in three files (section 4.2). Ideal: an environment variable |
| Notifications | Generated in the front end, with no real delivery (push, e-mail or SMS) |
| Pre-triage | Guidance questionnaire. There is no automatic specialty recommendation |
| Rescheduling | Done in two steps (book and cancel), since the API has no reschedule route |
| Tests | There are no automated tests versioned in the repository |
| Deletion | The app deactivates, but does not delete, clinics, professionals and specialties |
| Pre-triage audio | Recorded only on the device and not uploaded |
| PWA manifest | The generated manifest language is `en`. It can be adjusted with the `lang: 'pt-BR'` option in `vite.config.js` |

---

## 11. Deployment

| Component | Status |
|---|---|
| Source code | GitHub (the team front-end repository) |
| Back end | Render: `https://back-end-pi-ihs1.onrender.com` |
| API documentation | Swagger at `/api-docs/` |
| Front-end publication | To be provided by the team |
| Build | `npm run build` generates the `dist/` folder with static files, which can be served by any static host with HTTPS |

---

## Contributors

Project developed for the Integrated Project course, SENAC Pernambuco.

**Backend**

- Rejane Ferreira de Mendonça
- Ericha Tainá

**Frontend**

- Kennedy Veras
- Flávio Gonçalves
- Felipe Mitchell
