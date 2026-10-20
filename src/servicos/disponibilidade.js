// Disponibilidade do profissional (aba Horários).
//
// A API guarda cada disponibilidade como um registro de uma data e um intervalo:
//   POST   /disponibilidades        { id_profissional, data, hora_inicio, hora_fim }
//   DELETE /disponibilidades/{id}
// Aqui o profissional cadastra um período (ex.: 08:00 a 12:00 no dia 26/10) e ele é dividido em
// horários de 30 minutos, um registro para cada. Na lista, horários livres e colados voltam a
// aparecer como um bloco só. Horários já reservados (RESERVADO) nunca são alterados nem excluídos.

import { enviar } from './profissional'

export const MINUTOS_POR_HORARIO = 30

function emMinutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function paraHora(minutos) {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
}

// Opções de horário para os campos Início e Fim: 06:00, 06:30 ... 22:00
export const opcoesDeHora = Array.from({ length: 33 }, (_, i) => paraHora(6 * 60 + i * MINUTOS_POR_HORARIO))

// Horários de 30 min dentro de um período: ("08:00", "09:30") -> 08:00, 08:30, 09:00
function dividirPeriodo(inicio, fim) {
  const horarios = []
  for (let m = emMinutos(inicio); m < emMinutos(fim); m += MINUTOS_POR_HORARIO) {
    horarios.push({ horaInicio: paraHora(m), horaFim: paraHora(m + MINUTOS_POR_HORARIO) })
  }
  return horarios
}

// Blocos mostrados na lista: horários livres da mesma data e colados viram um bloco só
export function montarBlocos(disponibilidades, hoje) {
  const livres = disponibilidades
    .filter((d) => d.status === 'DISPONIVEL' && d.data >= hoje)
    .sort((a, b) => `${a.data} ${a.horaInicio}`.localeCompare(`${b.data} ${b.horaInicio}`))

  const blocos = []
  livres.forEach((d) => {
    const ultimo = blocos[blocos.length - 1]
    if (ultimo && ultimo.data === d.data && ultimo.horaFim === d.horaInicio) {
      ultimo.horaFim = d.horaFim
      ultimo.horarios.push(d)
    } else {
      blocos.push({ chave: `${d.data}-${d.id}`, data: d.data, horaInicio: d.horaInicio, horaFim: d.horaFim, horarios: [d] })
    }
  })
  return blocos
}

// Decide o que criar e o que excluir para salvar o formulário.
// "bloco" é o bloco que está sendo editado (ou undefined, se for um horário novo).
export function planejarAlteracao(disponibilidades, { data, inicio, fim }, bloco) {
  const desejados = dividirPeriodo(inicio, fim)

  // Horários que já existem na data escolhida (livres ou reservados), por hora de início
  const existentes = new Set(
    disponibilidades.filter((d) => d.data === data).map((d) => d.horaInicio)
  )

  const criar = desejados
    .filter((h) => !existentes.has(h.horaInicio))
    .map((h) => ({ data, ...h }))

  const mantidos = new Set(desejados.map((h) => h.horaInicio))
  const excluir = (bloco?.horarios ?? [])
    .filter((h) => data !== bloco.data || !mantidos.has(h.horaInicio))
    .map((h) => h.id)

  return { criar, excluir }
}

// Faz as chamadas em grupos pequenos, para não sobrecarregar o servidor. Devolve quantas falharam.
async function emLotes(tarefas, tamanho = 6) {
  let falhas = 0
  for (let i = 0; i < tarefas.length; i += tamanho) {
    const resultados = await Promise.allSettled(tarefas.slice(i, i + tamanho).map((tarefa) => tarefa()))
    falhas += resultados.filter((r) => r.status === 'rejected').length
  }
  return falhas
}

// Cria primeiro e exclui depois, para nunca ficar sem horário se algo falhar no meio.
export async function aplicarAlteracao(plano, idProfissional, token) {
  const falhasCriar = await emLotes(
    plano.criar.map((h) => () =>
      enviar(
        '/disponibilidades',
        'POST',
        { id_profissional: idProfissional, data: h.data, hora_inicio: `${h.horaInicio}:00`, hora_fim: `${h.horaFim}:00` },
        token,
        'Não foi possível cadastrar o horário.'
      )
    )
  )
  const falhasExcluir = await emLotes(
    plano.excluir.map((id) => () => enviar(`/disponibilidades/${id}`, 'DELETE', null, token, 'Não foi possível excluir o horário.'))
  )
  return falhasCriar + falhasExcluir
}

// Exclui só os horários livres do bloco
export async function excluirBloco(bloco, token) {
  return aplicarAlteracao({ criar: [], excluir: bloco.horarios.map((h) => h.id) }, null, token)
}
