# Saúde Recife

Aplicativo mobile (PWA) que ajuda o paciente a encontrar um caminho para o seu atendimento de saúde na cidade do Recife.

Projeto Integrado do curso de Análise e Desenvolvimento de Sistemas (3º período) da Faculdade SENAC Pernambuco.

> Este é um protótipo acadêmico e não substitui atendimento médico. Em caso de emergência, ligue 192 (SAMU).

## Sobre o projeto

O objetivo é criar uma solução tecnológica que facilite o acesso à saúde no Recife, reunindo em um só aplicativo a pré-triagem, o agendamento de consultas, a ligação para o SAMU e outras funcionalidades.

A entrega é um MVP visual: um protótipo navegável de alta fidelidade para apresentação acadêmica, com foco na experiência do paciente. O aplicativo deve ser simples, acessível e realista. Não é uma landing page nem um dashboard corporativo.

## Fluxo principal

```
Paciente → Pré-triagem → Recomendação de especialidade → Clínica
→ Profissional → Data → Horário → Confirmação do agendamento
```

## Pré-triagem com IA

A pré-triagem usa IA apenas como ferramenta de orientação. **A IA não diagnostica doenças.**

Linguagem a ser usada nas telas:

- Correto: "Com base nas suas respostas, essa pode ser uma especialidade adequada para o seu atendimento."
- Nunca: "Você tem X."

## Funcionalidades

- [x] Tela de login
- [ ] Cadastro
- [ ] Pré-triagem
- [ ] Recomendação de especialidade
- [ ] Agendamento (clínica, profissional, data, horário e confirmação)
- [ ] Ligação para o SAMU
- [ ] Outras funcionalidades a definir

## Tecnologias

- React 18
- Vite
- CSS puro (um arquivo `.css` por componente)
- Fonte Plus Jakarta Sans (`@fontsource`, funciona offline)
- PWA (a configurar com `vite-plugin-pwa`)

## Estrutura de pastas

```
src/
  main.jsx                 ponto de entrada
  App.jsx                  componente principal
  estilos/
    global.css             cores, fonte e estilos globais
  componentes/             peças reutilizáveis
    Botao/
    BotaoVoltar/
    CampoTexto/
  paginas/                 uma pasta por tela
    Login/
```

Padrão do projeto: cada componente e cada página ficam em uma pasta própria, com o `.jsx` e o `.css` juntos. As cores ficam como variáveis em `global.css`.

## Como rodar

Requisito: [Node.js](https://nodejs.org) (versão LTS).

```
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

O projeto não roda com o Live Server do VS Code, porque usa React. É preciso usar o `npm run dev`.

Para gerar a versão final:

```
npm run build
npm run preview
```

### Erro no PowerShell (Windows)

Se aparecer a mensagem de que a execução de scripts foi desabilitada, rode uma vez:

```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Equipe

| Nome | Função |
| ---- | ------ |
| Felipe Mitchell | Front-end |
| [Nome] | [Função] |
| [Nome] | [Função] |

Professor(a) orientador(a): [Nome]
