// Dados do painel do administrador, vindos da API (/api-docs). Rotas usadas (todas GET, com Bearer JWT):
//   /auth/perfil, /clinicas, /profissionais, /pacientes, /administradores, /agendamentos, /disponibilidades
//
// A API NÃO tem rotas de estatísticas, relatórios nem log de atividades. Por isso:
//   - os totais são contagens das listas;
//   - "Especialidades" conta as especialidades distintas dos profissionais cadastrados (não há /especialidades);
//   - "Usuários" = pacientes + profissionais + administradores;
//   - a data/hora de um agendamento vem do horário (disponibilidade) ligado a ele;
//   - "Atividade recente" é montada a partir de registros que tragam data de cadastro (data_cadastro,
//     created_at, ...). Sem essa data, o item aparece sem horário, ordenado pelo id;
//   - o relatório (CSV) é gerado aqui no navegador a partir dos agendamentos.
// Os campos de resposta quase não são documentados, então as funções "ler..." aceitam nomes comuns.
// Se algo não aparecer, rode com `npm run dev` e veja no console as respostas cruas "[API] ...".

import { buscar, comoLista, comoObjeto, lerData, lerHora, formatarNomeProfissional } from './profissional'
import { dataLocal, paraISO } from './datas'
import { carregarEspecialidades } from './especialidades'

const CAMPOS_DATA_CRIACAO = ['data_cadastro', 'created_at', 'createdAt', 'data_criacao', 'criado_em', 'data_agendamento']

function lerMomento(item) {
  for (const campo of CAMPOS_DATA_CRIACAO) {
    const valor = item[campo]
    if (typeof valor === 'string' && valor) {
      const momento = new Date(valor.length === 10 ? `${valor}T00:00:00` : valor)
      if (!Number.isNaN(momento.getTime())) return momento
    }
  }
  return null
}

const ativo = (item) => item.ativo !== false && item.ativo !== 0

async function tentar(caminho, token) {
  try {
    return { lista: comoLista(await buscar(caminho, token)), falhou: false }
  } catch {
    return { lista: [], falhou: true }
  }
}

// Busca tudo o que o painel e o relatório precisam, em paralelo.
export async function carregarBaseAdmin(usuario) {
  const token = usuario.token
  const [clinicas, profissionais, pacientes, administradores, agendamentos, disponibilidades] = await Promise.all([
    tentar('/clinicas', token),
    tentar('/profissionais', token),
    tentar('/pacientes', token),
    tentar('/administradores', token),
    tentar('/agendamentos', token),
    tentar('/disponibilidades', token),
  ])

  // Cadastro de especialidades; se a consulta falhar, contamos pelos profissionais
  let cadastroEspecialidades = null
  try {
    cadastroEspecialidades = await carregarEspecialidades(token)
  } catch {
    // mantém a contagem pelos profissionais
  }

  let nomeAdmin = usuario.nome ?? usuario.name ?? ''
  if (!nomeAdmin) {
    try {
      const perfil = comoObjeto(await buscar('/auth/perfil', token))
      nomeAdmin = perfil.nome ?? perfil.name ?? ''
    } catch {
      // segue sem o nome
    }
  }

  const falhas = Object.entries({ clinicas, profissionais, pacientes, administradores, agendamentos, disponibilidades })
    .filter(([, r]) => r.falhou)
    .map(([nome]) => nome)

  return {
    nomeAdmin,
    clinicas: clinicas.lista,
    profissionais: profissionais.lista,
    pacientes: pacientes.lista,
    administradores: administradores.lista,
    cadastroEspecialidades,
    agendamentos: agendamentos.lista,
    disponibilidades: disponibilidades.lista,
    falhas,
  }
}

// ---------- Leitura dos registros ----------

function nomeEspecialidade(profissional) {
  return (
    profissional.especialidade_nome ??
    profissional.nome_especialidade ??
    (typeof profissional.especialidade === 'string' ? profissional.especialidade : profissional.especialidade?.nome) ??
    null
  )
}

function idEspecialidade(profissional) {
  return profissional.id_especialidade ?? profissional.especialidade?.id_especialidade ?? null
}

// Agendamento + horário + nomes, pronto para contar e exportar
function montarAgendamentos(base) {
  const horarios = new Map(base.disponibilidades.map((d) => [String(d.id_disponibilidade ?? d.id), d]))
  const profissionais = new Map(base.profissionais.map((p) => [String(p.id_profissional ?? p.id), p]))
  const pacientes = new Map(base.pacientes.map((p) => [String(p.id_paciente ?? p.id), p]))
  const clinicas = new Map(base.clinicas.map((c) => [String(c.id_clinica ?? c.id), c]))

  return base.agendamentos.map((item) => {
    const id = item.id_agendamento ?? item.id
    const horario = horarios.get(String(item.id_disponibilidade ?? item.disponibilidade?.id_disponibilidade))
    const profissional = profissionais.get(String(item.id_profissional ?? item.profissional?.id_profissional))
    const paciente = pacientes.get(String(item.id_paciente ?? item.paciente?.id_paciente))
    const clinica = profissional ? clinicas.get(String(profissional.id_clinica ?? profissional.clinica?.id_clinica)) : undefined

    return {
      id,
      data: lerData(item.data ?? item.disponibilidade?.data ?? horario?.data ?? ''),
      hora: lerHora(item.hora_inicio ?? item.disponibilidade?.hora_inicio ?? horario?.hora_inicio ?? ''),
      status: String(item.status || '').toUpperCase(),
      paciente: paciente?.nome ?? item.paciente_nome ?? item.nome_paciente ?? item.paciente?.nome ?? '',
      profissional: formatarNomeProfissional(
        profissional?.nome ?? item.profissional_nome ?? item.nome_profissional ?? item.profissional?.nome ?? ''
      ),
      especialidade: (profissional && nomeEspecialidade(profissional)) ?? item.especialidade_nome ?? '',
      clinica: clinica?.nome ?? item.clinica_nome ?? item.nome_clinica ?? '',
      observacao: item.observacao ?? '',
      momento: lerMomento(item),
    }
  })
}

// ---------- Números do painel ----------

export function calcularPainelAdmin(base, hoje = paraISO(new Date())) {
  const clinicas = base.clinicas.filter(ativo)
  const profissionais = base.profissionais.filter(ativo)

  const especialidades = new Set(
    profissionais.map((p) => nomeEspecialidade(p) ?? idEspecialidade(p)).filter((v) => v != null && v !== '')
  )

  // Só mostramos o total de usuários quando as três listas foram carregadas
  const usuariosCompletos = !['pacientes', 'profissionais', 'administradores'].some((n) => base.falhas.includes(n))

  const doDia = montarAgendamentos(base).filter((a) => a.data === hoje)
  const dados = {
    clinicas: base.falhas.includes('clinicas') ? null : clinicas.length,
    profissionais: base.falhas.includes('profissionais') ? null : profissionais.length,
    especialidades: base.cadastroEspecialidades
      ? base.cadastroEspecialidades.filter((e) => e.ativo).length
      : base.falhas.includes('profissionais') ? null : especialidades.size,
    usuarios: usuariosCompletos ? base.pacientes.length + base.profissionais.length + base.administradores.length : null,
  }

  const hojeOk = !base.falhas.includes('agendamentos') && !base.falhas.includes('disponibilidades')
  const resumoHoje = {
    agendamentos: hojeOk ? doDia.length : null,
    consultas: hojeOk ? doDia.filter((a) => a.status === 'CONFIRMADO' || a.status === 'REALIZADO').length : null,
    cancelamentos: hojeOk ? doDia.filter((a) => a.status === 'CANCELADO').length : null,
  }

  return { totais: dados, resumoHoje }
}

// ---------- Atividade recente ----------

function rotuloTempo(momento, agora) {
  const minutos = Math.floor((agora - momento) / 60000)
  if (minutos < 60) return 'Agora'
  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `${horas}h atrás`
  const dias = Math.round((dataLocal(paraISO(agora)) - dataLocal(paraISO(momento))) / 86400000)
  if (dias === 1) return 'Ontem'
  if (dias < 30) return `${dias} dias`
  return momento.toLocaleDateString('pt-BR')
}

export function montarAtividades(base, agora = new Date(), limite = 6) {
  const horasDe = (momento) => (momento ? (agora - momento) / 3600000 : null)
  const eventos = []

  const adicionar = (lista, idCampo, titulo, detalhe, icone) => {
    lista.forEach((item) => {
      const momento = lerMomento(item)
      const id = Number(item[idCampo] ?? item.id)
      eventos.push({ chave: `${idCampo}-${id}`, titulo, detalhe: detalhe(item), icone, momento, id: Number.isFinite(id) ? id : 0 })
    })
  }

  adicionar(base.clinicas, 'id_clinica', 'Nova clínica cadastrada', (c) => c.nome ?? '', '🏥')
  adicionar(
    base.profissionais,
    'id_profissional',
    'Novo profissional cadastrado',
    (p) => [formatarNomeProfissional(p.nome ?? ''), nomeEspecialidade(p)].filter(Boolean).join(' — '),
    '🧑‍⚕️'
  )
  adicionar(base.pacientes, 'id_paciente', 'Novo usuário cadastrado', (p) => (p.nome ? `${p.nome} — Paciente` : 'Paciente'), '👤')

  const agendados = montarAgendamentos(base)
  agendados.forEach((a) => {
    const cancelado = a.status === 'CANCELADO'
    eventos.push({
      chave: `agendamento-${a.id}`,
      titulo: cancelado ? 'Agendamento cancelado' : 'Novo agendamento',
      detalhe: [a.paciente, a.profissional].filter(Boolean).join(' com '),
      icone: cancelado ? '❌' : '📅',
      momento: a.momento,
      id: Number(a.id) || 0,
    })
  })

  // Quem tem data vem primeiro (do mais novo ao mais antigo); quem não tem, pelo maior id, no máximo 2 por tipo
  const comData = eventos.filter((e) => e.momento).sort((a, b) => b.momento - a.momento)
  const contagem = {}
  const semData = eventos
    .filter((e) => !e.momento)
    .sort((a, b) => b.id - a.id)
    .filter((e) => {
      contagem[e.titulo] = (contagem[e.titulo] ?? 0) + 1
      return contagem[e.titulo] <= 2
    })

  return [...comData, ...semData].slice(0, limite).map((e) => {
    const horas = horasDe(e.momento)
    return {
      chave: e.chave,
      titulo: e.titulo,
      detalhe: e.detalhe,
      icone: e.icone,
      tempo: e.momento ? rotuloTempo(e.momento, agora) : '',
      cor: horas == null ? 'cinza' : horas < 24 ? 'verde' : horas < 72 ? 'azul' : 'cinza',
    }
  })
}

// ---------- Relatório CSV ----------

export const STATUS_ROTULOS = { AGENDADO: 'Aguardando', CONFIRMADO: 'Confirmado', CANCELADO: 'Cancelado', REALIZADO: 'Realizado' }

// Evita que o Excel execute uma célula que comece com = + - @ (injeção de fórmula)
function celula(valor) {
  let texto = String(valor ?? '')
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

function dataBr(iso) {
  return iso ? iso.split('-').reverse().join('/') : ''
}

// Período de cada opção do modal. "personalizado" começa igual a "este mês".
export function periodoPadrao(tipo, hoje = paraISO(new Date())) {
  if (tipo === '7') {
    const inicio = dataLocal(hoje)
    inicio.setDate(inicio.getDate() - 6)
    return { inicio: paraISO(inicio), fim: hoje }
  }
  return { inicio: `${hoje.slice(0, 8)}01`, fim: hoje }
}

// Devolve { csv, total } com os agendamentos cujo horário cai entre inicio e fim (inclusive).
export function gerarRelatorioCsv(base, inicio, fim) {
  const linhas = montarAgendamentos(base)
    .filter((a) => a.data && a.data >= inicio && a.data <= fim)
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))

  const cabecalho = ['Código', 'Data', 'Hora', 'Status', 'Paciente', 'Profissional', 'Especialidade', 'Clínica', 'Observação']
  const corpo = linhas.map((a) =>
    [
      `AG-${String(a.id).padStart(5, '0')}`,
      dataBr(a.data),
      a.hora,
      STATUS_ROTULOS[a.status] ?? a.status,
      a.paciente,
      a.profissional,
      a.especialidade,
      a.clinica,
      a.observacao,
    ]
      .map(celula)
      .join(';')
  )

  // BOM + ";" + CRLF: abre direto no Excel em português
  return { csv: '﻿' + [cabecalho.join(';'), ...corpo].join('\r\n') + '\r\n', total: linhas.length }
}

export function baixarArquivo(nome, conteudo) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function nomeDoRelatorio(inicio, fim) {
  return `relatorio-consulta-facil_${inicio}_a_${fim}.csv`
}
