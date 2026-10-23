// Catálogo para agendar consultas: especialidades, clínicas, profissionais e horários livres.
// Tudo vem da API (/api-docs). As especialidades vêm do cadastro do administrador (servicos/especialidades.js);
// especialidade desativada some do agendamento. Se a rota /especialidades não existir no servidor, a lista
// é montada a partir dos profissionais cadastrados (cada profissional informa a sua).
//
// A documentação não descreve os campos de resposta. As funções "ler..." aceitam nomes comuns;
// em desenvolvimento (npm run dev) o console mostra as respostas cruas "[API] ...".

import { URL_API } from './autenticacao'
import { buscar, comoLista, comoObjeto, lerData, lerHora, formatarNomeProfissional } from './profissional'
import { mapaDeEspecialidades } from './especialidades'

function semAcento(texto) {
  return String(texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Ícone só decorativo, escolhido pelo nome da especialidade
const ICONES = [
  ['cardio', '❤️'], ['ortoped', '🦴'], ['oftalmo', '👁️'], ['neuro', '🧠'], ['pediatr', '🧒'],
  ['dermat', '🔬'], ['geriat', '🩺'], ['odonto', '🦷'], ['pneumo', '🫁'], ['otorrino', '👂'],
  ['reumat', '🦵'], ['ginec', '🌸'], ['psiquiat', '🧠'], ['clinic', '🏥'], ['geral', '🏥'],
]

export function iconeDaEspecialidade(nome) {
  const alvo = semAcento(nome)
  return ICONES.find(([trecho]) => alvo.includes(trecho))?.[1] ?? '🩺'
}

// "24.501" + "CRM-PE" -> "CRM-PE 24.501" (sem repetir o conselho se o registro já o trouxer)
export function registroCompleto(registro, conselho) {
  if (!registro) return ''
  return conselho && !String(registro).toUpperCase().includes(String(conselho).toUpperCase())
    ? `${conselho} ${registro}`
    : String(registro)
}

export function lerProfissional(item) {
  const idEspecialidade = item.id_especialidade ?? item.especialidade?.id_especialidade ?? null
  const nomeEspecialidade =
    item.especialidade_nome ??
    item.nome_especialidade ??
    (typeof item.especialidade === 'string' ? item.especialidade : item.especialidade?.nome) ??
    null

  return {
    id: item.id_profissional ?? item.id,
    nome: formatarNomeProfissional(item.nome ?? ''),
    idClinica: item.id_clinica ?? item.clinica?.id_clinica ?? null,
    especialidade: nomeEspecialidade,
    idEspecialidade,
    crm: registroCompleto(item.registro_profissional, item.conselho),
    ativo: item.ativo !== false && item.ativo !== 0,
    clinicaNome: item.clinica_nome ?? item.nome_clinica ?? item.clinica?.nome ?? null,
  }
}

export function lerClinica(item) {
  return {
    id: item.id_clinica ?? item.id,
    nome: item.nome ?? '',
    endereco: item.endereco ?? '',
    telefone: item.telefone ?? '',
    ativo: item.ativo !== false && item.ativo !== 0,
  }
}

export function lerDisponibilidade(item) {
  return {
    id: item.id_disponibilidade ?? item.id,
    idProfissional: item.id_profissional ?? item.profissional?.id_profissional ?? null,
    data: lerData(item.data),
    horaInicio: lerHora(item.hora_inicio),
    horaFim: lerHora(item.hora_fim),
    status: String(item.status || '').toUpperCase(),
  }
}

async function buscarLista(caminho, token) {
  try {
    return { lista: comoLista(await buscar(caminho, token)), falhou: false }
  } catch {
    return { lista: [], falhou: true }
  }
}

// Quando a lista de profissionais não traz o nome da especialidade, consulta o cadastro de cada um
export async function completarEspecialidades(profissionais, token) {
  const faltando = profissionais.filter((p) => !p.especialidade && p.id != null).slice(0, 40)
  await Promise.all(
    faltando.map(async (p) => {
      try {
        const detalhe = lerProfissional(comoObjeto(await buscar(`/profissionais/${p.id}`, token)))
        p.especialidade = detalhe.especialidade
        p.crm = p.crm || detalhe.crm
      } catch {
        // continua sem o nome
      }
    })
  )
  profissionais.forEach((p) => {
    if (!p.especialidade) {
      p.especialidade = p.idEspecialidade != null ? `Especialidade ${p.idEspecialidade}` : 'Clínica Geral'
    }
  })
}

// Uma consulta por tela: profissionais, clínicas e horários, buscados juntos.
// "falhas" diz o que não pôde ser carregado, para a tela avisar em vez de mostrar uma lista vazia.
export async function carregarCatalogo(token) {
  const [profs, clins, disps, registro] = await Promise.all([
    buscarLista('/profissionais', token),
    buscarLista('/clinicas', token),
    buscarLista('/disponibilidades', token),
    mapaDeEspecialidades(token),
  ])

  const todosProfissionais = profs.lista.map(lerProfissional).filter((p) => p.id != null)
  // Nome oficial da especialidade (cadastro do admin) e se ela está ativa
  todosProfissionais.forEach((p) => {
    const cadastro = registro.get(String(p.idEspecialidade))
    p.especialidadeAtiva = cadastro ? cadastro.ativo : true
    if (cadastro) p.especialidade = cadastro.nome
  })
  const todasClinicas = clins.lista.map(lerClinica).filter((c) => c.id != null)

  // Clínica desativada pelo administrador: some do agendamento. Os profissionais dela somem junto,
  // para não sobrarem especialidades ou horários que levem a uma clínica inacessível.
  const idsClinicasInativas = new Set(todasClinicas.filter((c) => !c.ativo).map((c) => String(c.id)))
  const profissionais = todosProfissionais.filter(
    (p) => p.ativo && p.especialidadeAtiva && !(p.idClinica != null && idsClinicasInativas.has(String(p.idClinica)))
  )
  await completarEspecialidades(profissionais, token)

  return {
    profissionais,
    clinicas: todasClinicas.filter((c) => c.ativo),
    // Listas completas, só para mostrar nomes em consultas que o paciente já tem
    todosProfissionais,
    todasClinicas,
    disponibilidades: disps.lista.map(lerDisponibilidade).filter((d) => d.id != null),
    falhas: [profs.falhou && 'profissionais', clins.falhou && 'clinicas', disps.falhou && 'horários'].filter(Boolean),
  }
}

// Horários livres de um profissional, do mais próximo para o mais distante (só no futuro)
export function horariosLivres(disponibilidades, idProfissional, hoje, agora) {
  return disponibilidades
    .filter(
      (d) =>
        String(d.idProfissional) === String(idProfissional) &&
        d.status === 'DISPONIVEL' &&
        d.data &&
        (d.data > hoje || (d.data === hoje && d.horaInicio > agora))
    )
    .sort((a, b) => `${a.data} ${a.horaInicio}`.localeCompare(`${b.data} ${b.horaInicio}`))
}

// Horários livres de vários profissionais juntos (para "próximo horário" da clínica)
export function primeiroHorarioLivre(disponibilidades, idsProfissionais, hoje, agora) {
  const ids = new Set(idsProfissionais.map(String))
  return disponibilidades
    .filter(
      (d) =>
        ids.has(String(d.idProfissional)) &&
        d.status === 'DISPONIVEL' &&
        d.data &&
        (d.data > hoje || (d.data === hoje && d.horaInicio > agora))
    )
    .sort((a, b) => `${a.data} ${a.horaInicio}`.localeCompare(`${b.data} ${b.horaInicio}`))[0]
}

// Busca de novo os horários de um profissional (para conferir antes de reservar)
export async function buscarHorariosDoProfissional(idProfissional, token) {
  const dados = await buscar(`/disponibilidades/profissional/${idProfissional}`, token)
  return comoLista(dados).map((d) => lerDisponibilidade({ id_profissional: idProfissional, ...d }))
}

// POST /agendamentos { id_paciente, id_profissional, id_disponibilidade }. Devolve o que a API respondeu.
export async function criarAgendamento({ idPaciente, idProfissional, idDisponibilidade }, token) {
  let resposta
  try {
    resposta = await fetch(`${URL_API}/agendamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        id_paciente: idPaciente,
        id_profissional: idProfissional,
        id_disponibilidade: idDisponibilidade,
      }),
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor.')
  }

  if (!resposta.ok) {
    const mensagens = {
      400: 'Não foi possível agendar com os dados informados.',
      401: 'Sua sessão expirou. Entre novamente.',
      403: 'Sua conta não tem permissão para agendar.',
      404: 'Esse horário não existe mais. Escolha outro.',
      409: 'Esse horário acabou de ser reservado por outra pessoa. Escolha outro.',
    }
    throw new Error(mensagens[resposta.status] ?? 'Não foi possível concluir o agendamento. Tente novamente.')
  }

  try {
    return await resposta.json()
  } catch {
    return {}
  }
}

// Especialidades que existem no sistema (as dos profissionais cadastrados), com quantos horários livres têm.
// As que têm mais horários livres vêm primeiro.
export function especialidadesDoCatalogo(catalogo, hoje, agora) {
  const grupos = new Map()
  catalogo.profissionais.forEach((p) => {
    const grupo = grupos.get(p.especialidade) ?? { nome: p.especialidade, ids: [] }
    grupo.ids.push(p.id)
    grupos.set(p.especialidade, grupo)
  })

  return [...grupos.values()]
    .map((g) => ({
      nome: g.nome,
      icone: iconeDaEspecialidade(g.nome),
      livres: catalogo.disponibilidades.filter(
        (d) =>
          g.ids.some((id) => String(id) === String(d.idProfissional)) &&
          d.status === 'DISPONIVEL' &&
          d.data &&
          (d.data > hoje || (d.data === hoje && d.horaInicio > agora))
      ).length,
    }))
    .sort((a, b) => b.livres - a.livres || a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function mesmaEspecialidade(a, b) {
  return semAcento(a) === semAcento(b)
}
