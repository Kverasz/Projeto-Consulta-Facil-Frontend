// Dados do paciente logado, vindos da API (/api-docs):
//   GET  /pacientes/{id}                 cadastro
//   PUT  /pacientes/{id}                 atualizar cadastro (e senha, ver alterarSenha)
//   GET  /agendamentos/paciente/{id}     consultas do paciente
//   POST /agendamentos                   agendar (ver catalogo.js)
//   PATCH /agendamentos/{id}/cancelar    cancelar
//
// Os agendamentos são os mesmos registros que o profissional vê: ele filtra GET /agendamentos
// pelo seu id_profissional. Por isso, agendar/cancelar aqui já aparece na agenda do profissional.

import { URL_API, realizarLogin } from './autenticacao'
import { buscarAgendamentosPaciente } from './consultas'
import { buscar, comoLista, comoObjeto, enviar, lerData, lerHora, cancelarAgendamento } from './profissional'
import { carregarCatalogo, criarAgendamento, iconeDaEspecialidade, lerDisponibilidade } from './catalogo'
import { dataCompleta, dataCurta } from './datas'

// ---------- Quem é o paciente logado ----------

function lerPayloadDoToken(token) {
  try {
    const parte = String(token).split('.')[1]
    return JSON.parse(atob(parte.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}

function comoIdValido(valor) {
  const numero = Number(valor)
  return Number.isInteger(numero) && numero > 0 ? numero : null
}

const idsEmCache = new Map()

// Procura o id do paciente na resposta do login, no token (JWT) e, por último, em GET /auth/perfil.
export async function descobrirIdPaciente(usuario) {
  if (usuario.token && idsEmCache.has(usuario.token)) return idsEmCache.get(usuario.token)

  const payload = usuario.token ? lerPayloadDoToken(usuario.token) : {}
  let id = [
    usuario.id_paciente,
    usuario.paciente?.id_paciente,
    payload.id_paciente,
    usuario.id,
    payload.id,
    payload.sub,
  ]
    .map(comoIdValido)
    .find((valor) => valor !== null)

  if (id == null) {
    const perfil = comoObjeto(await buscar('/auth/perfil', usuario.token))
    id = [perfil.id_paciente, perfil.paciente?.id_paciente, perfil.id].map(comoIdValido).find((valor) => valor !== null)
  }

  if (id == null) throw new Error('Não foi possível identificar o paciente logado.')
  if (usuario.token) idsEmCache.set(usuario.token, id)
  return id
}

// ---------- Cadastro ----------

export async function carregarPaciente(id, token) {
  const bruto = comoObjeto(await buscar(`/pacientes/${id}`, token))
  return {
    id,
    cadastro: bruto,
    nome: bruto.nome ?? '',
    email: bruto.email ?? '',
    telefone: bruto.telefone ?? '',
    dataNascimento: lerData(bruto.data_nascimento ?? bruto.dataNascimento ?? ''),
  }
}

// O PUT não tem corpo documentado. Enviamos o cadastro completo (campos do POST) com as alterações,
// para nada ser apagado.
function corpoDoCadastro(paciente, alteracoes) {
  const c = paciente.cadastro ?? {}
  const corpo = {
    nome: paciente.nome,
    cpf: c.cpf,
    data_nascimento: paciente.dataNascimento || lerData(c.data_nascimento ?? ''),
    email: paciente.email,
    telefone: paciente.telefone,
    endereco: c.endereco,
    ...alteracoes,
  }
  Object.keys(corpo).forEach((chave) => (corpo[chave] == null || corpo[chave] === '') && delete corpo[chave])
  return corpo
}

const MENSAGENS_PUT_PACIENTE = {
  400: 'Confira os dados informados.',
  401: 'Sua sessão expirou. Entre novamente.',
  409: 'Este e-mail já está em uso por outro cadastro.',
}

export async function salvarPaciente(paciente, { nome, email, telefone, dataNascimento }, token) {
  await enviar(
    `/pacientes/${paciente.id}`,
    'PUT',
    corpoDoCadastro(paciente, {
      nome,
      email,
      telefone,
      data_nascimento: dataNascimento || undefined,
    }),
    token,
    'Não foi possível salvar seus dados.',
    MENSAGENS_PUT_PACIENTE
  )
}

// A API não documenta uma rota própria de troca de senha. Tentamos pelo PUT do cadastro e CONFERIMOS
// o resultado entrando com a senha nova: só dizemos que deu certo se o servidor realmente aceitou.
export async function alterarSenha(paciente, senhaAtual, senhaNova, token) {
  try {
    await realizarLogin(paciente.email, senhaAtual)
  } catch (e) {
    throw new Error(e.message === 'E-mail ou senha incorretos.' ? 'A senha atual está incorreta.' : e.message)
  }

  await enviar(
    `/pacientes/${paciente.id}`,
    'PUT',
    corpoDoCadastro(paciente, { senha: senhaNova }),
    token,
    'Não foi possível alterar a senha.',
    MENSAGENS_PUT_PACIENTE
  )

  try {
    await realizarLogin(paciente.email, senhaNova)
  } catch {
    throw new Error('O servidor não aplicou a nova senha. Sua senha continua a mesma.')
  }
}

// ---------- Consultas ----------

const ROTULOS_STATUS = {
  AGENDADO: 'Aguardando',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado',
  REALIZADO: 'Realizado',
}

function montarConsulta(item, { profissionais, clinicas, disponibilidades }) {
  const idProfissional = item.id_profissional ?? item.profissional?.id_profissional ?? null
  const idDisponibilidade = item.id_disponibilidade ?? item.disponibilidade?.id_disponibilidade ?? null
  const profissional = profissionais.get(String(idProfissional))
  const clinica = profissional ? clinicas.get(String(profissional.idClinica)) : undefined
  const disponibilidade = disponibilidades.get(String(idDisponibilidade))

  const dataISO = lerData(item.data ?? item.data_agendamento ?? item.disponibilidade?.data) || disponibilidade?.data || ''
  const hora =
    lerHora(item.hora_inicio ?? item.hora ?? item.horario ?? item.disponibilidade?.hora_inicio) ||
    disponibilidade?.horaInicio ||
    ''
  const statusApi = String(item.status || '').toUpperCase()
  const id = item.id_agendamento ?? item.id
  const especialidade = item.especialidade_nome ?? item.nome_especialidade ?? profissional?.especialidade ?? 'Consulta'

  return {
    id,
    codigo: `AG-${String(id).padStart(5, '0')}`,
    idProfissional,
    idDisponibilidade,
    icone: iconeDaEspecialidade(especialidade),
    nome: profissional?.nome ?? item.profissional_nome ?? item.nome_profissional ?? 'Profissional',
    especialidade,
    crm: profissional?.crm ?? '',
    clinica: item.clinica_nome ?? item.nome_clinica ?? clinica?.nome ?? profissional?.clinicaNome ?? '',
    endereco: clinica?.endereco ?? '',
    dataISO,
    data: dataCurta(dataISO) || 'Data não informada',
    dataCompleta: dataCompleta(dataISO) || 'Data não informada',
    hora,
    statusApi,
    status: ROTULOS_STATUS[statusApi] ?? (item.status || 'Aguardando'),
  }
}

// Consultas do paciente, já com nome do profissional, especialidade, clínica e endereço.
export async function carregarConsultasPaciente(idPaciente, token, catalogoPronto) {
  let brutos
  try {
    brutos = comoLista(await buscarAgendamentosPaciente(idPaciente, token))
  } catch (erro) {
    // Se a rota do paciente responder 404, confere na lista geral antes de desistir
    if (erro.message !== 'Paciente não encontrado.') throw erro
    brutos = comoLista(await buscar('/agendamentos', token)).filter(
      (a) => String(a.id_paciente ?? a.paciente?.id_paciente) === String(idPaciente)
    )
  }
  if (brutos.length === 0) return []

  const catalogo = catalogoPronto ?? (await carregarCatalogo(token))
  const contexto = {
    profissionais: new Map(catalogo.profissionais.map((p) => [String(p.id), p])),
    clinicas: new Map(catalogo.clinicas.map((c) => [String(c.id), c])),
    disponibilidades: new Map(catalogo.disponibilidades.map((d) => [String(d.id), d])),
  }

  // Horário que não veio na lista geral (ex.: já reservado): busca um a um
  const semHorario = brutos.filter((item) => {
    const id = item.id_disponibilidade ?? item.disponibilidade?.id_disponibilidade
    return id != null && !contexto.disponibilidades.has(String(id)) && !(item.data ?? item.disponibilidade?.data)
  })
  await Promise.all(
    semHorario.map(async (item) => {
      const id = item.id_disponibilidade ?? item.disponibilidade?.id_disponibilidade
      try {
        contexto.disponibilidades.set(String(id), lerDisponibilidade(comoObjeto(await buscar(`/disponibilidades/${id}`, token))))
      } catch {
        // fica "Data não informada"
      }
    })
  )

  return brutos.map((item) => montarConsulta(item, contexto))
}

// Reagendar: a API só permite mudar observação e status no PUT, então a troca é feita em duas etapas:
// 1) agenda o novo horário; 2) cancela o antigo. Se a etapa 1 falhar, nada muda.
export async function reagendarConsulta(consulta, idNovaDisponibilidade, idPaciente, token) {
  await criarAgendamento(
    { idPaciente, idProfissional: consulta.idProfissional, idDisponibilidade: idNovaDisponibilidade },
    token
  )

  try {
    await cancelarAgendamento(consulta.id, token)
  } catch {
    throw new Error(
      'O novo horário foi agendado, mas não foi possível cancelar o anterior. Cancele o agendamento antigo na lista.'
    )
  }
}

export { cancelarAgendamento, criarAgendamento, URL_API }
