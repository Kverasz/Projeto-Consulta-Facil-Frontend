// Funções de data usadas em várias telas. Datas chegam da API como "AAAA-MM-DD".

const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
]

export function dataLocal(data) {
  const [ano, mes, dia] = data.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

// "2026-10-20" -> "hoje", "amanhã" ou "20 out"
export function rotuloDia(data, hoje) {
  const dias = Math.round((dataLocal(data) - dataLocal(hoje)) / 86400000)
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'amanhã'
  const [, mes, dia] = data.split('-')
  return `${Number(dia)} ${MESES_CURTOS[Number(mes) - 1]}`
}

// "2026-10-20" -> "Hoje", "Amanhã" ou "20 de outubro" (com o ano, se não for o atual)
export function dataPorExtenso(data, hoje) {
  if (!data) return '—'
  const dias = Math.round((dataLocal(data) - dataLocal(hoje)) / 86400000)
  if (dias === 0) return 'Hoje'
  if (dias === 1) return 'Amanhã'
  const [ano, mes, dia] = data.split('-')
  const anoAtual = hoje.slice(0, 4)
  return `${Number(dia)} de ${MESES[Number(mes) - 1]}${ano !== anoAtual ? ` de ${ano}` : ''}`
}

export { MESES_CURTOS }

// ---------- Calendário (tela de agenda) ----------

const DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

export function paraISO(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

export function somarDias(data, dias) {
  const nova = dataLocal(data)
  nova.setDate(nova.getDate() + dias)
  return paraISO(nova)
}

// Segunda-feira da semana da data informada
export function segundaDaSemana(data) {
  return somarDias(data, -((dataLocal(data).getDay() + 6) % 7))
}

export function diaDaSemanaCurto(data) {
  return DIAS_SEMANA[dataLocal(data).getDay()].slice(0, 3)
}

// "2026-10-19" -> "Segunda-feira, 19 de outubro"
export function dataLonga(data) {
  const [, mes, dia] = data.split('-')
  return `${DIAS_SEMANA[dataLocal(data).getDay()]}, ${Number(dia)} de ${MESES[Number(mes) - 1]}`
}

// "2026-10-19" -> "19/10/2026"
export function dataBrasileira(data) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// mes de 0 a 11
export function nomeDoMes(mes) {
  return MESES[mes].charAt(0).toUpperCase() + MESES[mes].slice(1)
}

// Células do calendário (domingo primeiro): null para os espaços antes do dia 1
export function celulasDoMes(ano, mes) {
  const vazias = new Date(ano, mes, 1).getDay()
  const total = new Date(ano, mes + 1, 0).getDate()
  const celulas = Array(vazias).fill(null)
  for (let dia = 1; dia <= total; dia++) celulas.push(paraISO(new Date(ano, mes, dia)))
  return celulas
}

// "2026-10-16" -> "16 out 2026"
export function dataCurta(data) {
  if (!data) return ''
  const [ano, mes, dia] = data.split('-')
  return `${Number(dia)} ${MESES_CURTOS[Number(mes) - 1]} ${ano}`
}

// "2026-10-16" -> "16 de outubro de 2026"
export function dataCompleta(data) {
  if (!data) return ''
  const [ano, mes, dia] = data.split('-')
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${ano}`
}

// "2026-10-16", "09:30" -> "Hoje, 09:30", "Amanhã, 09:30" ou "Qui, 29 out · 09:30"
export function rotuloProximoHorario(data, hora, hoje) {
  if (!data) return ''
  const dias = Math.round((dataLocal(data) - dataLocal(hoje)) / 86400000)
  if (dias === 0) return `Hoje, ${hora}`
  if (dias === 1) return `Amanhã, ${hora}`
  const [, mes, dia] = data.split('-')
  return `${diaDaSemanaCurto(data)}, ${Number(dia)} ${MESES_CURTOS[Number(mes) - 1]} · ${hora}`
}
