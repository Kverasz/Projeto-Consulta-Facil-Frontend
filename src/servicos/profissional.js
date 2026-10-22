// Dados do painel do profissional, vindos da API (/api-docs).
//
// A API não tem filtro de agendamentos por profissional (só /agendamentos e /agendamentos/paciente/{id}),
// então buscamos GET /agendamentos e filtramos aqui pelo id do profissional logado.
// A documentação não descreve os campos de resposta da maioria dos endpoints, por isso as funções
// "ler..." abaixo aceitam alguns nomes comuns. Se algum dado não aparecer, rode o app em modo de
// desenvolvimento (npm run dev) e veja no console do navegador as respostas cruas "[API] ...".
// Ajustar um nome de campo é só mexer nas funções ler... deste arquivo.

import { URL_API } from './autenticacao'
import { mapaDeEspecialidades } from './especialidades'

export async function buscar(caminho, token) {
  const resposta = await fetch(`${URL_API}${caminho}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  })
  if (!resposta.ok) {
    throw new Error(`Falha em ${caminho} (${resposta.status})`)
  }
  const dados = await resposta.json()
  if (import.meta.env.DEV) console.debug('[API]', caminho, dados)
  return dados
}

// Algumas APIs devolvem a lista direto, outras dentro de { dados: [...] } etc.
export function comoLista(dados) {
  if (Array.isArray(dados)) return dados
  const lista = dados?.dados ?? dados?.data ?? dados?.items ?? dados?.resultado
  return Array.isArray(lista) ? lista : []
}

export function comoObjeto(dados) {
  return dados?.dados ?? dados?.data ?? dados ?? {}
}

// "2026-10-20T00:00:00.000Z" ou "2026-10-20" -> "2026-10-20" (sem converter fuso, para não mudar o dia)
export function lerData(valor) {
  return typeof valor === 'string' ? valor.slice(0, 10) : ''
}

// "08:00:00" -> "08:00"
export function lerHora(valor) {
  return typeof valor === 'string' ? valor.slice(0, 5) : ''
}

// "dr kennedy" / "DR. KENNEDY" -> "Dr. Kennedy". Não inventa o "Dr." quando o cadastro não tem.
export function formatarNomeProfissional(nome) {
  const palavrasMinusculas = ['da', 'de', 'do', 'das', 'dos', 'e']
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean)

  return partes
    .map((palavra, indice) => {
      const minuscula = palavra.toLowerCase()
      if (indice === 0 && /^dra?\.?$/.test(minuscula)) return minuscula.startsWith('dra') ? 'Dra.' : 'Dr.'
      if (indice > 0 && palavrasMinusculas.includes(minuscula)) return minuscula
      return minuscula.charAt(0).toUpperCase() + minuscula.slice(1)
    })
    .join(' ')
}

export function dataDeHoje() {
  const agora = new Date()
  const mes = String(agora.getMonth() + 1).padStart(2, '0')
  const dia = String(agora.getDate()).padStart(2, '0')
  return `${agora.getFullYear()}-${mes}-${dia}`
}

export function horaAgora() {
  const agora = new Date()
  return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
}

// Descobre o id do profissional logado: primeiro no que o login devolveu,
// depois em GET /auth/perfil.
async function descobrirIdProfissional(usuario) {
  const direto = usuario.id_profissional ?? usuario.profissional?.id_profissional ?? usuario.id
  if (direto != null) return direto

  const perfil = comoObjeto(await buscar('/auth/perfil', usuario.token))
  const id = perfil.id_profissional ?? perfil.profissional?.id_profissional ?? perfil.id
  if (id == null) throw new Error('Não foi possível identificar o profissional logado.')
  return id
}

function lerDisponibilidade(item) {
  return {
    id: item.id_disponibilidade ?? item.id,
    data: lerData(item.data),
    horaInicio: lerHora(item.hora_inicio),
    horaFim: lerHora(item.hora_fim),
    status: String(item.status || '').toUpperCase()
  }
}

function lerAgendamento(item, disponibilidadePorId) {
  const idDisponibilidade = item.id_disponibilidade ?? item.disponibilidade?.id_disponibilidade
  const disponibilidade = disponibilidadePorId.get(idDisponibilidade)

  return {
    id: item.id_agendamento ?? item.id,
    idProfissional: item.id_profissional ?? item.profissional?.id_profissional ?? item.profissional?.id,
    idDisponibilidade,
    idPaciente: item.id_paciente ?? item.paciente?.id_paciente ?? item.paciente?.id,
    pacienteNome: item.paciente_nome ?? item.nome_paciente ?? item.paciente?.nome ?? null,
    especialidade: item.especialidade_nome ?? item.nome_especialidade ?? item.especialidade?.nome ?? null,
    clinica: item.clinica_nome ?? item.nome_clinica ?? item.clinica?.nome ?? null,
    data: lerData(item.data_consulta ?? item.data ?? item.data_agendamento ?? item.disponibilidade?.data) || disponibilidade?.data || '',
    hora:
      lerHora(item.hora_consulta ?? item.hora_inicio ?? item.hora ?? item.horario ?? item.disponibilidade?.hora_inicio) ||
      disponibilidade?.horaInicio ||
      '',
    status: String(item.status || '').toUpperCase(),
    criadoEm: item.criado_em ?? item.created_at ?? item.data_criacao ?? item.data_cadastro ?? null,
    atualizadoEm: item.atualizado_em ?? item.updated_at ?? item.data_atualizacao ?? null
  }
}

async function buscarNomePaciente(idPaciente, token) {
  try {
    const paciente = comoObjeto(await buscar(`/pacientes/${idPaciente}`, token))
    return paciente.nome ?? null
  } catch {
    return null
  }
}

export async function carregarPainelProfissional(usuario) {
  const token = usuario.token
  const idProfissional = await descobrirIdProfissional(usuario)

  const [dadosProfissional, dadosDisponibilidades, dadosAgendamentos] = await Promise.all([
    buscar(`/profissionais/${idProfissional}`, token),
    buscar(`/disponibilidades/profissional/${idProfissional}`, token),
    buscar('/agendamentos', token)
  ])

  const profissional = comoObjeto(dadosProfissional)
  const disponibilidades = comoLista(dadosDisponibilidades).map(lerDisponibilidade)
  const disponibilidadePorId = new Map(disponibilidades.map((d) => [d.id, d]))

  // Só os agendamentos deste profissional
  const agendamentos = comoLista(dadosAgendamentos)
    .map((item) => lerAgendamento(item, disponibilidadePorId))
    .filter(
      (a) =>
        String(a.idProfissional) === String(idProfissional) ||
        (a.idProfissional == null && disponibilidadePorId.has(a.idDisponibilidade))
    )

  // Nome da clínica
  let clinica = profissional.clinica_nome ?? profissional.nome_clinica ?? profissional.clinica?.nome ?? null
  const idClinica = profissional.id_clinica ?? profissional.clinica?.id_clinica
  if (!clinica && idClinica != null) {
    try {
      clinica = comoObjeto(await buscar(`/clinicas/${idClinica}`, token)).nome ?? null
    } catch {
      clinica = null
    }
  }

  const registroEspecialidades = await mapaDeEspecialidades(token)
  const especialidade =
    registroEspecialidades.get(String(profissional.id_especialidade ?? profissional.especialidade?.id_especialidade))?.nome ??
    profissional.especialidade_nome ??
    profissional.nome_especialidade ??
    (typeof profissional.especialidade === 'string' ? profissional.especialidade : profissional.especialidade?.nome) ??
    null

  // Nome do paciente, quando o agendamento não traz
  const idsSemNome = [...new Set(agendamentos.filter((a) => !a.pacienteNome && a.idPaciente != null).map((a) => a.idPaciente))]
  const nomes = new Map(
    await Promise.all(idsSemNome.map(async (id) => [id, await buscarNomePaciente(id, token)]))
  )
  agendamentos.forEach((a) => {
    if (!a.pacienteNome) a.pacienteNome = nomes.get(a.idPaciente) ?? 'Paciente'
  })

  return {
    profissional: {
      id: idProfissional,
      nome: formatarNomeProfissional(profissional.nome ?? usuario.nome ?? 'Profissional'),
      especialidade,
      clinica
    },
    disponibilidades,
    agendamentos
  }
}

// ---------- Ações sobre um agendamento ----------

// Situação atual do agendamento (GET /agendamentos/{id}), para a tela de detalhes não mostrar dado velho
export async function buscarStatusAgendamento(id, token) {
  const agendamento = comoObjeto(await buscar(`/agendamentos/${id}`, token))
  const status = agendamento.status ?? agendamento.agendamento?.status
  return status ? String(status).toUpperCase() : null
}

// mensagensPorStatus: textos específicos por código de erro, ex.: { 409: 'E-mail já em uso.' }
export async function enviar(caminho, metodo, corpo, token, mensagemErro, mensagensPorStatus = {}) {
  let resposta
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      method: metodo,
      headers: {
        ...(corpo ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: corpo ? JSON.stringify(corpo) : undefined
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }
  if (!resposta.ok) {
    // O back end responde { erro: "..." } com mensagens em português e específicas (por exemplo,
    // "CPF já cadastrado" ou "A senha deve possuir pelo menos 8 caracteres"). Em 400 e 409 elas são
    // mais úteis que um texto genérico, então têm prioridade.
    const doServidor = resposta.status === 400 || resposta.status === 409 ? await mensagemDoServidor(resposta) : null
    throw new Error(doServidor ?? mensagensPorStatus[resposta.status] ?? mensagemErro)
  }
}

export async function mensagemDoServidor(resposta) {
  try {
    const corpo = await resposta.json()
    const texto = typeof corpo?.erro === 'string' ? corpo.erro.trim() : ''
    return texto && texto.length <= 200 ? texto : null
  } catch {
    return null
  }
}

// PUT /agendamentos/{id} com { status: 'CONFIRMADO' }
export function confirmarAgendamento(id, token) {
  return enviar(`/agendamentos/${id}`, 'PUT', { status: 'CONFIRMADO' }, token, 'Não foi possível confirmar a consulta.')
}

// PATCH /agendamentos/{id}/cancelar
export function cancelarAgendamento(id, token) {
  return enviar(`/agendamentos/${id}/cancelar`, 'PATCH', null, token, 'Não foi possível cancelar a consulta.')
}

// ---------- Perfil ----------

// Dados do cadastro do profissional logado (GET /profissionais/{id}).
export async function carregarPerfil(usuario) {
  const token = usuario.token
  const id = await descobrirIdProfissional(usuario)
  const bruto = comoObjeto(await buscar(`/profissionais/${id}`, token))

  let clinica = bruto.clinica_nome ?? bruto.nome_clinica ?? bruto.clinica?.nome ?? null
  const idClinica = bruto.id_clinica ?? bruto.clinica?.id_clinica
  if (!clinica && idClinica != null) {
    try {
      clinica = comoObjeto(await buscar(`/clinicas/${idClinica}`, token)).nome ?? null
    } catch {
      clinica = null
    }
  }

  const registroEspecialidades = await mapaDeEspecialidades(token)
  const especialidade =
    registroEspecialidades.get(String(bruto.id_especialidade ?? bruto.especialidade?.id_especialidade))?.nome ??
    bruto.especialidade_nome ??
    bruto.nome_especialidade ??
    (typeof bruto.especialidade === 'string' ? bruto.especialidade : bruto.especialidade?.nome) ??
    null

  const ativo = bruto.ativo ?? bruto.status
  return {
    id,
    cadastro: bruto,
    nome: formatarNomeProfissional(bruto.nome ?? usuario.nome ?? ''),
    cpf: bruto.cpf ?? null,
    registro: bruto.registro_profissional ?? null,
    conselho: bruto.conselho ?? null,
    especialidade,
    clinica,
    telefone: bruto.telefone ?? '',
    email: bruto.email ?? '',
    // true, false ou null (a API não informou)
    ativo: ativo == null ? null : ativo === true || ativo === 1 || String(ativo).toUpperCase() === 'ATIVO'
  }
}

// PUT /profissionais/{id} é parcial no servidor: enviamos só telefone e e-mail, o resto fica como está.
// (O e-mail é o login do profissional e é obrigatório; telefone vazio é gravado como nulo.)
export function salvarContato(perfil, { telefone, email }, token) {
  const corpo = { telefone, email }

  return enviar(`/profissionais/${perfil.id}`, 'PUT', corpo, token, 'Não foi possível salvar suas alterações.', {
    400: 'Confira o telefone e o e-mail informados.',
    409: 'Este e-mail já está em uso por outro cadastro.'
  })
}
