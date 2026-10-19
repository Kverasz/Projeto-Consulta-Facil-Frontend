// Notificações do profissional.
//
// A API não tem endpoint de notificações. Elas são montadas aqui a partir dos dados do próprio
// profissional logado (agendamentos e horários já carregados em servicos/profissional.js):
//   - Lembrete de agenda: há consultas hoje.
//   - Nova consulta agendada: consulta futura com situação AGENDADO (aguardando confirmação).
//   - Consulta cancelada: consulta futura com situação CANCELADO.
// "Lida ou não lida" não existe na API, então isso fica salvo no navegador (ver InicioProfissional).
// Quando o back-end tiver notificações de verdade, basta trocar esta função por uma chamada à API.

import { dataLocal, rotuloDia, MESES_CURTOS as MESES } from './datas'

// Data/hora em que a notificação aconteceu -> "Agora", "2h atrás", "Ontem", "18 out"
export function tempoRelativo(valor, agora = new Date()) {
  if (!valor) return ''
  const momento = new Date(valor)
  if (Number.isNaN(momento.getTime())) return ''

  const minutos = Math.floor((agora - momento) / 60000)
  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `${minutos} min atrás`

  const horas = Math.floor(minutos / 60)
  if (horas < 24) return `${horas}h atrás`

  const dias = Math.round((dataLocal(agora.toISOString().slice(0, 10)) - dataLocal(momento.toISOString().slice(0, 10))) / 86400000)
  if (dias <= 1) return 'Ontem'
  return `${momento.getDate()} ${MESES[momento.getMonth()]}`
}

export function gerarNotificacoes(painel, hoje, horaAgora) {
  const agora = `${hoje} ${horaAgora}`
  const futuras = painel.agendamentos.filter((a) => a.data && `${a.data} ${a.hora}` >= agora)
  const porHorario = (a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`)
  const lista = []

  const hojeAtivas = painel.agendamentos
    .filter((a) => a.data === hoje && a.status !== 'CANCELADO')
    .sort(porHorario)
  if (hojeAtivas.length > 0) {
    const n = hojeAtivas.length
    lista.push({
      id: `lembrete-${hoje}`,
      icone: '🔔',
      titulo: 'Lembrete de agenda',
      texto: `Você possui ${n} ${n === 1 ? 'consulta' : 'consultas'} hoje. Primeira às ${hojeAtivas[0].hora}.`,
      quando: 'Hoje'
    })
  }

  futuras
    .filter((a) => a.status === 'CANCELADO')
    .sort(porHorario)
    .forEach((a) =>
      lista.push({
        id: `cancelada-${a.id}`,
        icone: '❌',
        titulo: 'Consulta cancelada',
        texto: `A consulta de ${a.pacienteNome} de ${rotuloDia(a.data, hoje)} às ${a.hora} foi cancelada.`,
        quando: tempoRelativo(a.atualizadoEm ?? a.criadoEm)
      })
    )

  futuras
    .filter((a) => a.status === 'AGENDADO')
    .sort(porHorario)
    .forEach((a) =>
      lista.push({
        id: `nova-${a.id}`,
        icone: '📅',
        titulo: 'Nova consulta agendada',
        texto: `${a.pacienteNome} — ${rotuloDia(a.data, hoje)} às ${a.hora}`,
        quando: tempoRelativo(a.criadoEm)
      })
    )

  return lista.slice(0, 30)
}
