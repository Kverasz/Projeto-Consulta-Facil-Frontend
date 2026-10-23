// Equipe (profissionais) no painel do administrador. Rotas (Bearer JWT):
//   GET  /profissionais                 lista, com clinica_nome, especialidade_nome e ativo
//   POST /profissionais                 obrigatórios: nome, cpf (11 números), conselho, registro_profissional,
//                                       id_clinica, id_especialidade, e-mail e senha (mínimo 8 caracteres).
//                                       Opcionais: telefone e ativo (padrão: true). A senha é a que o
//                                       profissional usará para entrar no app.
//   PUT  /profissionais/{id}            atualização parcial. "senha" só é trocada se vier preenchida.
//                                       telefone vazio vira nulo. "ativo" é aceito.
//   Duplicidade devolve 409 com a mensagem do servidor (CPF, e-mail ou conselho + registro).
//   GET  /clinicas                      clínicas para o campo "Clínica vinculada"
//   GET  /disponibilidades/profissional/{id}, POST /disponibilidades, DELETE /disponibilidades/{id}
//
// Pontos em que o desenho da tela e a API não coincidem:
//   - As opções do campo Especialidade são as especialidades ATIVAS do cadastro (servicos/especialidades.js).
//   - A API guarda disponibilidade por DATA, não por dia da semana. A grade Seg a Sáb vale para as próximas
//     HORIZONTE_DIAS: ativar um horário cria um registro em cada data daquele dia da semana, e desativar
//     exclui os registros livres. Horários já reservados nunca são alterados nem excluídos.

import { buscar, comoLista, enviar } from './profissional'
import { completarEspecialidades, lerClinica, lerProfissional, buscarHorariosDoProfissional } from './catalogo'
import { aplicarAlteracao } from './disponibilidade'
import { dataLocal, paraISO } from './datas'
import { somenteDigitos } from './clinicasAdmin'
import { carregarEspecialidades } from './especialidades'

export const CONSELHOS_COMUNS = ['CRM-PE', 'CRO-PE', 'COREN-PE', 'CREFITO-PE']

// ---------- Leitura ----------

export function iniciaisDoNome(nome) {
  const palavras = String(nome || '')
    .replace(/^dra?\.?\s+/i, '')
    .split(/\s+/)
    .filter((p) => p && !['da', 'de', 'do', 'das', 'dos', 'e'].includes(p.toLowerCase()))
  if (palavras.length === 0) return '?'
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase()
  return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase()
}

function lerProfissionalAdmin(item, clinicas) {
  const base = lerProfissional(item)
  const clinica = clinicas.find((c) => String(c.id) === String(base.idClinica))
  return {
    ...base,
    nomeCadastro: item.nome ?? '',
    cpf: somenteDigitos(item.cpf),
    conselho: item.conselho ?? '',
    registro: item.registro_profissional ?? '',
    telefone: item.telefone ?? '',
    email: item.email ?? '',
    clinicaNome: clinica?.nome ?? base.clinicaNome ?? '',
    bruto: item,
  }
}

// Mostra todos os profissionais, inclusive os inativos (o paciente é que só vê os ativos).
export async function carregarEquipe(token) {
  const profissionais = comoLista(await buscar('/profissionais', token))
  let clinicas = []
  try {
    clinicas = comoLista(await buscar('/clinicas', token)).map(lerClinica).filter((c) => c.id != null)
  } catch {
    // sem a lista de clínicas, o campo "Clínica vinculada" fica vazio e a tela avisa
  }

  // As opções do campo Especialidade vêm do cadastro. Se ele não carregar, a tela avisa em vez de
  // oferecer códigos soltos (um código errado vincularia o profissional à especialidade errada).
  const especialidades = (await carregarEspecialidades(token)).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  const nomesCadastro = new Map(especialidades.map((e) => [String(e.id), e.nome]))

  const lista = profissionais
    .map((item) => lerProfissionalAdmin(item, clinicas))
    .filter((p) => p.id != null)
  await completarEspecialidades(lista, token)
  lista.forEach((p) => {
    const nome = nomesCadastro.get(String(p.idEspecialidade))
    if (nome) p.especialidade = nome
  })

  lista.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  return { profissionais: lista, clinicas, especialidades }
}

// ---------- Cadastro e edição ----------

// 400 e 409 mostram a mensagem do próprio servidor (ver enviar em profissional.js)
const MENSAGENS = {
  400: 'Confira os dados informados. Algum campo está inválido.',
  401: 'Sua sessão expirou. Entre novamente.',
  403: 'Sua conta não tem permissão para alterar profissionais.',
  404: 'Esse profissional não existe mais. Atualize a lista.',
  409: 'Já existe um profissional com esses dados.',
}

export const TAMANHO_MINIMO_SENHA = 8

function corpoDoProfissional(dados) {
  const editando = dados.id != null
  const corpo = {
    id_clinica: Number(dados.idClinica),
    id_especialidade: Number(dados.idEspecialidade),
    nome: dados.nome.trim(),
    cpf: somenteDigitos(dados.cpf),
    registro_profissional: dados.registro.trim(),
    conselho: dados.conselho.trim(),
    email: dados.email.trim(),
    // Telefone vazio limpa o que existia (o servidor grava nulo)
    telefone: dados.telefone.trim(),
    ativo: Boolean(dados.ativo),
  }
  // No cadastro a senha é obrigatória; na edição só é enviada se o administrador digitou uma nova
  if (dados.senha) corpo.senha = dados.senha
  if (!editando && !corpo.senha) delete corpo.senha
  return corpo
}

// dados: { id?, nome, cpf, conselho, registro, idEspecialidade, telefone, email, senha, idClinica, ativo }
export async function salvarProfissional(dados, token) {
  const editando = dados.id != null
  await enviar(
    editando ? `/profissionais/${dados.id}` : '/profissionais',
    editando ? 'PUT' : 'POST',
    corpoDoProfissional(dados),
    token,
    editando ? 'Não foi possível salvar as alterações.' : 'Não foi possível cadastrar o profissional.',
    MENSAGENS
  )
}

// ---------- Grade de disponibilidade (Seg a Sáb) ----------

export const DIAS_DA_GRADE = [
  { numero: 1, rotulo: 'Seg' },
  { numero: 2, rotulo: 'Ter' },
  { numero: 3, rotulo: 'Qua' },
  { numero: 4, rotulo: 'Qui' },
  { numero: 5, rotulo: 'Sex' },
  { numero: 6, rotulo: 'Sáb' },
]

function horariosEntre(inicio, fim) {
  const lista = []
  for (let m = inicio * 60; m < fim * 60; m += 30) {
    lista.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`)
  }
  return lista
}

// Manhã 07:00 a 10:30 e tarde 14:00 a 16:30 (último horário começa às 16:30)
export const HORARIOS_DA_GRADE = [...horariosEntre(7, 11), ...horariosEntre(14, 17)]

export const HORIZONTE_DIAS = 28

const chave = (dia, hora) => `${dia}|${hora}`
export { chave as chaveDaCelula }

function datasDoHorizonte(hoje) {
  const datas = []
  const inicio = dataLocal(hoje)
  for (let i = 0; i < HORIZONTE_DIAS; i++) {
    const d = new Date(inicio)
    d.setDate(d.getDate() + i)
    datas.push(paraISO(d))
  }
  return datas
}

function horaAgoraTexto(agora) {
  return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
}

// Estado atual da grade: quais células têm horário cadastrado nas próximas semanas.
export async function carregarGrade(idProfissional, token, agora = new Date()) {
  const hoje = paraISO(agora)
  const fim = datasDoHorizonte(hoje).at(-1)
  const todos = await buscarHorariosDoProfissional(idProfissional, token)
  const noPeriodo = todos.filter((d) => d.data >= hoje && d.data <= fim && HORARIOS_DA_GRADE.includes(d.horaInicio))

  const ativas = new Set()
  const reservadas = new Set()
  noPeriodo.forEach((d) => {
    const dia = dataLocal(d.data).getDay()
    if (dia === 0) return
    if (d.status === 'DISPONIVEL' || d.status === 'RESERVADO') ativas.add(chave(dia, d.horaInicio))
    if (d.status === 'RESERVADO') reservadas.add(chave(dia, d.horaInicio))
  })
  return { ativas, reservadas, registros: noPeriodo }
}

// O que criar e excluir para sair do estado "inicial" e chegar ao "desejado".
export function planejarGrade(registros, inicial, desejado, agora = new Date()) {
  const hoje = paraISO(agora)
  const horaAgora = horaAgoraTexto(agora)
  const datas = datasDoHorizonte(hoje)
  const criar = []
  const excluir = []
  let mantidasPorReserva = 0

  const celulas = new Set([...inicial, ...desejado])
  celulas.forEach((celula) => {
    const antes = inicial.has(celula)
    const depois = desejado.has(celula)
    if (antes === depois) return

    const [dia, hora] = celula.split('|')
    const numero = Number(dia)
    const doDia = registros.filter((d) => dataLocal(d.data).getDay() === numero && d.horaInicio === hora)

    if (depois) {
      const existentes = new Set(doDia.map((d) => d.data))
      datas
        .filter((data) => dataLocal(data).getDay() === numero && !existentes.has(data) && (data > hoje || hora > horaAgora))
        .forEach((data) => {
          const [h, m] = hora.split(':').map(Number)
          const fimMin = h * 60 + m + 30
          const horaFim = `${String(Math.floor(fimMin / 60)).padStart(2, '0')}:${String(fimMin % 60).padStart(2, '0')}`
          criar.push({ data, horaInicio: hora, horaFim })
        })
    } else {
      doDia.filter((d) => d.status === 'DISPONIVEL').forEach((d) => excluir.push(d.id))
      if (doDia.some((d) => d.status === 'RESERVADO')) mantidasPorReserva += 1
    }
  })

  return { criar, excluir, mantidasPorReserva }
}

export function aplicarGrade(plano, idProfissional, token) {
  return aplicarAlteracao(plano, idProfissional, token)
}
