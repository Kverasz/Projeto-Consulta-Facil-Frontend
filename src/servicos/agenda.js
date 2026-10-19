// Monta o que a tela "Minha Agenda" mostra, a partir dos dados do profissional logado
// (painel = resultado de carregarPainelProfissional).
//
//  - Horário com consulta marcada (não cancelada)  -> cartão da consulta
//  - Horário cadastrado e ainda DISPONIVEL         -> "Horário disponível"
//  - Dia sem consultas                             -> só os horários disponíveis
//  - Intervalo de 1h ou mais entre dois horários   -> divisor "Intervalo"

export const situacoes = {
  AGENDADO: { rotulo: 'Aguardando', classe: 'aguardando' },
  CONFIRMADO: { rotulo: 'Confirmada', classe: 'confirmada' },
  REALIZADO: { rotulo: 'Realizada', classe: 'realizada' },
  CANCELADO: { rotulo: 'Cancelada', classe: 'cancelada' },
}

export function situacaoDe(status) {
  return situacoes[status] ?? { rotulo: status || 'Sem status', classe: 'realizada' }
}

function emMinutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function consultasAtivas(painel, data) {
  return painel.agendamentos.filter((a) => a.data === data && a.status !== 'CANCELADO')
}

// Consultas de um dia, em ordem de horário
export function consultasDoDia(painel, data) {
  return consultasAtivas(painel, data).sort((a, b) => a.hora.localeCompare(b.hora))
}

// Datas ("AAAA-MM-DD") que têm consulta, para marcar no calendário
export function datasComConsulta(painel) {
  return new Set(painel.agendamentos.filter((a) => a.status !== 'CANCELADO' && a.data).map((a) => a.data))
}

// Datas que têm algum horário cadastrado ou consulta
export function datasComAgenda(painel) {
  return new Set([
    ...painel.disponibilidades.map((d) => d.data),
    ...painel.agendamentos.filter((a) => a.status !== 'CANCELADO').map((a) => a.data)
  ])
}

// Linha do tempo de um dia: consultas, horários livres e intervalos
export function montarDia(painel, data) {
  const ativas = consultasAtivas(painel, data)
  const usadas = new Set()
  const itens = []

  painel.disponibilidades
    .filter((d) => d.data === data)
    .forEach((d) => {
      const consulta = ativas.find((a) => a.idDisponibilidade != null && String(a.idDisponibilidade) === String(d.id))
      if (consulta) {
        usadas.add(consulta.id)
        itens.push({ tipo: 'consulta', chave: `c${consulta.id}`, hora: d.horaInicio, horaFim: d.horaFim, consulta })
      } else if (d.status === 'DISPONIVEL') {
        itens.push({ tipo: 'livre', chave: `d${d.id}`, hora: d.horaInicio, horaFim: d.horaFim })
      }
    })

  // Consultas que não casaram com nenhum horário cadastrado continuam aparecendo
  ativas
    .filter((a) => !usadas.has(a.id))
    .forEach((a) => itens.push({ tipo: 'consulta', chave: `c${a.id}`, hora: a.hora, horaFim: null, consulta: a }))

  itens.sort((a, b) => a.hora.localeCompare(b.hora))

  const comIntervalos = []
  itens.forEach((item, indice) => {
    const anterior = itens[indice - 1]
    if (anterior?.horaFim && item.hora && emMinutos(item.hora) - emMinutos(anterior.horaFim) >= 60) {
      comIntervalos.push({ tipo: 'intervalo', chave: `i${indice}`, hora: anterior.horaFim })
    }
    comIntervalos.push(item)
  })
  return comIntervalos
}
